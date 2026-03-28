using Microsoft.EntityFrameworkCore;
using backend.db;
using backend.db.Models;

namespace backend.api;

public static class WorkLogsApi
{
    public static void MapWorkLogEndpoints(this WebApplication app)
    {
        // GET /worklogs
        app.MapGet("/worklogs", async (AppDbContext db) =>
            Results.Ok(await db.WorkLogs
                .Include(w => w.Application)
                .ToListAsync()));

        // GET /worklogs/{id}
        app.MapGet("/worklogs/{id}", async (int id, AppDbContext db) =>
            await db.WorkLogs
                .Include(w => w.Application)
                .FirstOrDefaultAsync(w => w.Id == id) is WorkLog log
                ? Results.Ok(log)
                : Results.NotFound(new { message = "WorkLog not found" }));

        // GET /worklogs/student/{studentId}
        app.MapGet("/worklogs/student/{studentId}", async (int studentId, AppDbContext db) =>
            Results.Ok(await db.WorkLogs
                .Include(w => w.Application)
                .Where(w => w.Application.StudentId == studentId)
                .ToListAsync()));

        // GET /worklogs/task/{taskId}
        app.MapGet("/worklogs/task/{taskId}", async (int taskId, AppDbContext db) =>
            Results.Ok(await db.WorkLogs
                .Include(w => w.Application)
                .Where(w => w.Application.TaskId == taskId)
                .ToListAsync()));

        // POST /worklogs
        app.MapPost("/worklogs", async (WorkLog log, AppDbContext db) =>
        {
            if (log.ApplicationId <= 0)
                return Results.BadRequest(new { message = "ApplicationId is required" });
            if (log.HoursWorked <= 0)
                return Results.BadRequest(new { message = "HoursWorked must be greater than 0" });

            db.WorkLogs.Add(log);
            await db.SaveChangesAsync();
            return Results.Created($"/worklogs/{log.Id}", log);
        });

        // PUT /worklogs/{id}
        app.MapPut("/worklogs/{id}", async (int id, WorkLog input, AppDbContext db) =>
        {
            var log = await db.WorkLogs.FindAsync(id);
            if (log is null) return Results.NotFound(new { message = "WorkLog not found" });

            log.HoursWorked = input.HoursWorked;
            log.WorkDate = input.WorkDate;
            log.Notes = input.Notes;

            await db.SaveChangesAsync();
            return Results.Ok(log);
        });

        // DELETE /worklogs/{id}
        app.MapDelete("/worklogs/{id}", async (int id, AppDbContext db) =>
        {
            var log = await db.WorkLogs.FindAsync(id);
            if (log is null) return Results.NotFound(new { message = "WorkLog not found" });

            db.WorkLogs.Remove(log);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
