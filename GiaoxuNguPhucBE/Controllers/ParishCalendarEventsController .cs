// Controllers/ParishCalendarEventsController.cs
using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/parish-calendar-events")]
public class ParishCalendarEventsController : ControllerBase
{
    private readonly AppDbContext _db; // đổi tên DbContext cho đúng project của bạn

    public ParishCalendarEventsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetPublic([FromQuery] int year, [FromQuery] int month)
    {
        var events = await _db.ParishCalendarEvents
            .Where(e => e.EventDate.Year == year && e.EventDate.Month == month)
            .OrderBy(e => e.EventDate)
            .ThenBy(e => e.DisplayOrder)
            .Select(e => new
            {
                e.Id,
                e.Title,
                e.Description,
                e.EventDate,
                EventType = e.EventType,
                EventTypeName = e.EventType.ToString(), // FE đang dùng ev.eventTypeName để tô màu
                e.TimeLabel,
                e.Location,
                e.DisplayOrder
            })
            .ToListAsync();

        return Ok(events);
    }

    // GET /api/parish-calendar-events/admin?year=2026&month=7
    [HttpGet("admin")]
    public async Task<IActionResult> GetAdmin([FromQuery] int year, [FromQuery] int month)
    {
        var events = await _db.ParishCalendarEvents
            .Where(e => e.EventDate.Year == year && e.EventDate.Month == month)
            .OrderBy(e => e.EventDate)
            .ThenBy(e => e.DisplayOrder)
            .ToListAsync();

        return Ok(events);
    }

    // POST /api/parish-calendar-events/admin
    [HttpPost("admin")]
    public async Task<IActionResult> Create([FromBody] ParishCalendarEventDto dto)
    {
        var entity = new ParishCalendarEvent
        {
            Title = dto.Title,
            Description = dto.Description,
            EventDate = dto.EventDate,
            EventType = dto.EventType,
            TimeLabel = dto.TimeLabel,
            Location = dto.Location,
            DisplayOrder = dto.DisplayOrder,
        };

        _db.ParishCalendarEvents.Add(entity);
        await _db.SaveChangesAsync();

        return Ok(entity);
    }

    // PUT /api/parish-calendar-events/admin/{id}
    [HttpPut("admin/{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] ParishCalendarEventDto dto)
    {
        var entity = await _db.ParishCalendarEvents.FindAsync(id);
        if (entity == null) return NotFound();

        entity.Title = dto.Title;
        entity.Description = dto.Description;
        entity.EventDate = dto.EventDate;
        entity.EventType = dto.EventType;
        entity.TimeLabel = dto.TimeLabel;
        entity.Location = dto.Location;
        entity.DisplayOrder = dto.DisplayOrder;

        await _db.SaveChangesAsync();
        return Ok(entity);
    }

    // DELETE /api/parish-calendar-events/admin/{id}
    [HttpDelete("admin/{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _db.ParishCalendarEvents.FindAsync(id);
        if (entity == null) return NotFound();

        _db.ParishCalendarEvents.Remove(entity);
        await _db.SaveChangesAsync();

        return NoContent(); // 204, khớp với apiFetch xử lý status 204 ở frontend
    }
}