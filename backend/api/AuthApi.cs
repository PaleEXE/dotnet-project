using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using backend.db;
using backend.db.Models;

namespace backend.api;

public static class AuthApi
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        // POST /auth/register
        app.MapPost("/auth/register", async (RegisterRequest req, AppDbContext db, IConfiguration config) =>
        {
            if (string.IsNullOrWhiteSpace(req.Email))
                return Results.BadRequest(new { message = "Email is required" });
            if (string.IsNullOrWhiteSpace(req.Password))
                return Results.BadRequest(new { message = "Password is required" });
            if (req.Role != "student" && req.Role != "organization")
                return Results.BadRequest(new { message = "Role must be 'student' or 'organization'" });

            // Check for duplicate email
            if (await db.Users.AnyAsync(u => u.Email == req.Email))
                return Results.BadRequest(new { message = "Email already registered" });

            // Role-specific validation
            if (req.Role == "student" && string.IsNullOrWhiteSpace(req.FullName))
                return Results.BadRequest(new { message = "FullName is required for students" });
            if (req.Role == "organization" && string.IsNullOrWhiteSpace(req.OrgName))
                return Results.BadRequest(new { message = "OrgName is required for organizations" });

            using var transaction = await db.Database.BeginTransactionAsync();

            var user = new User
            {
                Email = req.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                Role = req.Role
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            // Create the associated profile
            if (req.Role == "student")
            {
                db.Students.Add(new Student
                {
                    UserId = user.Id,
                    FullName = req.FullName!,
                    StudentNumber = req.StudentNumber
                });
            }
            else
            {
                db.Organizations.Add(new Organization
                {
                    UserId = user.Id,
                    Name = req.OrgName!,
                    Description = req.OrgDescription,
                    ContactPhone = req.ContactPhone
                });
            }

            await db.SaveChangesAsync();
            await transaction.CommitAsync();

            return Results.Created($"/users/{user.Id}", new
            {
                user.Id,
                user.Email,
                user.Role,
                user.CreatedAt
            });
        });

        // POST /auth/login
        app.MapPost("/auth/login", async (LoginRequest req, AppDbContext db, IConfiguration config) =>
        {
            if (string.IsNullOrWhiteSpace(req.Email))
                return Results.BadRequest(new { message = "Email is required" });
            if (string.IsNullOrWhiteSpace(req.Password))
                return Results.BadRequest(new { message = "Password is required" });

            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Results.Json(new { message = "Invalid email or password" }, statusCode: 401);

            var token = GenerateJwtToken(user, config);

            return Results.Ok(new
            {
                token,
                user = new
                {
                    user.Id,
                    user.Email,
                    user.Role,
                    user.CreatedAt
                }
            });
        });
    }

    private static string GenerateJwtToken(User user, IConfiguration config)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(config["Jwt:Key"]!));

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

// ── Request models (kept here to avoid extra files) ─────────────
public class RegisterRequest
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Role { get; set; } = null!;          // "student" | "organization"

    // Student fields
    public string? FullName { get; set; }
    public string? StudentNumber { get; set; }

    // Organization fields
    public string? OrgName { get; set; }
    public string? OrgDescription { get; set; }
    public string? ContactPhone { get; set; }
}

public class LoginRequest
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
}
