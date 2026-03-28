using Microsoft.EntityFrameworkCore;
using backend.db;
using backend.db.Models;

namespace backend.api;

public static class UsersApi
{
    public static void MapUserEndpoints(this WebApplication app)
    {
        // GET /users
        app.MapGet("/users", async (AppDbContext db) =>
            Results.Ok(await db.Users.ToListAsync()));

        // GET /users/{id}
        app.MapGet("/users/{id}", async (int id, AppDbContext db) =>
            await db.Users.FindAsync(id) is User user
                ? Results.Ok(user)
                : Results.NotFound(new { message = "User not found" }));

        // POST /users
        app.MapPost("/users", async (User user, AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(user.Email))
                return Results.BadRequest(new { message = "Email is required" });
            if (string.IsNullOrWhiteSpace(user.PasswordHash))
                return Results.BadRequest(new { message = "PasswordHash is required" });
            if (string.IsNullOrWhiteSpace(user.Role))
                return Results.BadRequest(new { message = "Role is required" });

            db.Users.Add(user);
            await db.SaveChangesAsync();
            return Results.Created($"/users/{user.Id}", user);
        });

        // PUT /users/{id}
        app.MapPut("/users/{id}", async (int id, User input, AppDbContext db) =>
        {
            var user = await db.Users.FindAsync(id);
            if (user is null) return Results.NotFound(new { message = "User not found" });

            user.Email = input.Email;
            user.PasswordHash = input.PasswordHash;
            user.Role = input.Role;

            await db.SaveChangesAsync();
            return Results.Ok(user);
        });

        // DELETE /users/{id}
        app.MapDelete("/users/{id}", async (int id, AppDbContext db) =>
        {
            var user = await db.Users.FindAsync(id);
            if (user is null) return Results.NotFound(new { message = "User not found" });

            db.Users.Remove(user);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
