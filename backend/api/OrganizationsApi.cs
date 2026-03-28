using Microsoft.EntityFrameworkCore;
using backend.db;
using backend.db.Models;

namespace backend.api;

public static class OrganizationsApi
{
    public static void MapOrganizationEndpoints(this WebApplication app)
    {
        // GET /organizations
        app.MapGet("/organizations", async (AppDbContext db) =>
            Results.Ok(await db.Organizations.Include(o => o.User).ToListAsync()));

        // GET /organizations/{id}
        app.MapGet("/organizations/{id}", async (int id, AppDbContext db) =>
            await db.Organizations.Include(o => o.User).FirstOrDefaultAsync(o => o.Id == id) is Organization org
                ? Results.Ok(org)
                : Results.NotFound(new { message = "Organization not found" }));

        // POST /organizations
        app.MapPost("/organizations", async (Organization org, AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(org.Name))
                return Results.BadRequest(new { message = "Name is required" });
            if (org.UserId <= 0)
                return Results.BadRequest(new { message = "UserId is required" });

            db.Organizations.Add(org);
            await db.SaveChangesAsync();
            return Results.Created($"/organizations/{org.Id}", org);
        });

        // PUT /organizations/{id}
        app.MapPut("/organizations/{id}", async (int id, Organization input, AppDbContext db) =>
        {
            var org = await db.Organizations.FindAsync(id);
            if (org is null) return Results.NotFound(new { message = "Organization not found" });

            org.Name = input.Name;
            org.Description = input.Description;
            org.ContactPhone = input.ContactPhone;

            await db.SaveChangesAsync();
            return Results.Ok(org);
        });

        // DELETE /organizations/{id}
        app.MapDelete("/organizations/{id}", async (int id, AppDbContext db) =>
        {
            var org = await db.Organizations.FindAsync(id);
            if (org is null) return Results.NotFound(new { message = "Organization not found" });

            db.Organizations.Remove(org);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
