using Microsoft.EntityFrameworkCore;
using backend.db;
using backend.db.Models;

namespace backend.api;

public static class StudentsApi
{
    public static void MapStudentEndpoints(this WebApplication app)
    {
        // GET /students
        app.MapGet("/students", async (AppDbContext db) =>
            Results.Ok(await db.Students.Include(s => s.User).ToListAsync()));

        // GET /students/{id}
        app.MapGet("/students/{id}", async (int id, AppDbContext db) =>
            await db.Students.Include(s => s.User).FirstOrDefaultAsync(s => s.Id == id) is Student student
                ? Results.Ok(student)
                : Results.NotFound(new { message = "Student not found" }));

        // POST /students
        app.MapPost("/students", async (Student student, AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(student.FullName))
                return Results.BadRequest(new { message = "FullName is required" });
            if (student.UserId <= 0)
                return Results.BadRequest(new { message = "UserId is required" });

            db.Students.Add(student);
            await db.SaveChangesAsync();
            return Results.Created($"/students/{student.Id}", student);
        });

        // PUT /students/{id}
        app.MapPut("/students/{id}", async (int id, Student input, AppDbContext db) =>
        {
            var student = await db.Students.FindAsync(id);
            if (student is null) return Results.NotFound(new { message = "Student not found" });

            student.FullName = input.FullName;
            student.StudentNumber = input.StudentNumber;
            student.VolunteeringCourse = input.VolunteeringCourse;
            student.TotalHours = input.TotalHours;

            await db.SaveChangesAsync();
            return Results.Ok(student);
        });

        // DELETE /students/{id}
        app.MapDelete("/students/{id}", async (int id, AppDbContext db) =>
        {
            var student = await db.Students.FindAsync(id);
            if (student is null) return Results.NotFound(new { message = "Student not found" });

            db.Students.Remove(student);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
