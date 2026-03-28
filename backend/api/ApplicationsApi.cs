using Microsoft.EntityFrameworkCore;
using backend.db;
using AppModel = backend.db.Models.Application;

namespace backend.api;

public static class ApplicationsApi
{
    public static void MapApplicationEndpoints(this WebApplication app)
    {
        // GET /applications
        app.MapGet("/applications", async (AppDbContext db) =>
            Results.Ok(await db.Applications
                .Include(a => a.Task)
                .Include(a => a.Student)
                .ToListAsync()));

        // GET /applications/{id}
        app.MapGet("/applications/{id}", async (int id, AppDbContext db) =>
            await db.Applications
                .Include(a => a.Task)
                .Include(a => a.Student)
                .FirstOrDefaultAsync(a => a.Id == id) is AppModel application
                ? Results.Ok(application)
                : Results.NotFound(new { message = "Application not found" }));

        // GET /applications/task/{taskId}
        app.MapGet("/applications/task/{taskId}", async (int taskId, AppDbContext db) =>
            Results.Ok(await db.Applications
                .Include(a => a.Student)
                .Where(a => a.TaskId == taskId)
                .ToListAsync()));

        // GET /applications/student/{studentId}
        app.MapGet("/applications/student/{studentId}", async (int studentId, AppDbContext db) =>
            Results.Ok(await db.Applications
                .Include(a => a.Task)
                .Where(a => a.StudentId == studentId)
                .ToListAsync()));

        // POST /applications
        app.MapPost("/applications", async (AppModel application, AppDbContext db) =>
        {
            if (application.TaskId <= 0)
                return Results.BadRequest(new { message = "TaskId is required" });
            if (application.StudentId <= 0)
                return Results.BadRequest(new { message = "StudentId is required" });

            db.Applications.Add(application);
            await db.SaveChangesAsync();
            return Results.Created($"/applications/{application.Id}", application);
        });

        // PUT /applications/{id} — update status
        app.MapPut("/applications/{id}", async (int id, AppModel input, AppDbContext db) =>
        {
            var application = await db.Applications.FindAsync(id);
            if (application is null) return Results.NotFound(new { message = "Application not found" });

            application.Status = input.Status;

            await db.SaveChangesAsync();
            return Results.Ok(application);
        });

        // DELETE /applications/{id}
        app.MapDelete("/applications/{id}", async (int id, AppDbContext db) =>
        {
            var application = await db.Applications.FindAsync(id);
            if (application is null) return Results.NotFound(new { message = "Application not found" });

            db.Applications.Remove(application);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
