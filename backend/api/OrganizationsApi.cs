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
            Results.Ok(await db.Organizations.ToListAsync()));

        // GET /organizations/{id}
        app.MapGet("/organizations/{id}", async (int id, AppDbContext db) =>
            await db.Organizations.FirstOrDefaultAsync(o => o.Id == id) is Organization org
                ? Results.Ok(org)
                : Results.NotFound(new { message = "Organization not found" }));

        // PUT /organizations/{id}
        app.MapPut("/organizations/{id}", async (int id, Organization input, AppDbContext db) =>
        {
            var org = await db.Organizations.FindAsync(id);
            if (org is null) return Results.NotFound(new { message = "Organization not found" });

            org.Name = input.Name;
            org.PhoneNumber = input.PhoneNumber;
            org.LogoUrl = input.LogoUrl;

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
