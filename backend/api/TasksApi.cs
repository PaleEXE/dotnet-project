using Microsoft.EntityFrameworkCore;
using backend.db;
using TaskModel = backend.db.Models.Task;

namespace backend.api;

public static class TasksApi
{
    public static void MapTaskEndpoints(this WebApplication app)
    {
        // GET /tasks
        app.MapGet("/tasks", async (AppDbContext db) =>
            Results.Ok(await db.Tasks.Include(t => t.Organization).ToListAsync()));

        // GET /tasks/{id}
        app.MapGet("/tasks/{id}", async (int id, AppDbContext db) =>
            await db.Tasks.Include(t => t.Organization).FirstOrDefaultAsync(t => t.Id == id) is TaskModel task
                ? Results.Ok(task)
                : Results.NotFound(new { message = "Task not found" }));

        // GET /tasks/open
        app.MapGet("/tasks/open", async (AppDbContext db) =>
            Results.Ok(await db.Tasks
                .Include(t => t.Organization)
                .Where(t => t.Status == "open")
                .ToListAsync()));

        // POST /tasks
        app.MapPost("/tasks", async (TaskModel task, AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(task.Title))
                return Results.BadRequest(new { message = "Title is required" });
            if (string.IsNullOrWhiteSpace(task.Description))
                return Results.BadRequest(new { message = "Description is required" });
            if (task.OrgId <= 0)
                return Results.BadRequest(new { message = "OrgId is required" });

            db.Tasks.Add(task);
            await db.SaveChangesAsync();
            return Results.Created($"/tasks/{task.Id}", task);
        });

        // PUT /tasks/{id}
        app.MapPut("/tasks/{id}", async (int id, TaskModel input, AppDbContext db) =>
        {
            var task = await db.Tasks.FindAsync(id);
            if (task is null) return Results.NotFound(new { message = "Task not found" });

            task.Title = input.Title;
            task.Description = input.Description;
            task.VolunteersNeeded = input.VolunteersNeeded;
            task.Status = input.Status;
            task.StartDate = input.StartDate;
            task.EndDate = input.EndDate;

            await db.SaveChangesAsync();
            return Results.Ok(task);
        });

        // DELETE /tasks/{id}
        app.MapDelete("/tasks/{id}", async (int id, AppDbContext db) =>
        {
            var task = await db.Tasks.FindAsync(id);
            if (task is null) return Results.NotFound(new { message = "Task not found" });

            db.Tasks.Remove(task);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
