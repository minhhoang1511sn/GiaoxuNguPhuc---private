using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.DTOs;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Models;
using Microsoft.EntityFrameworkCore;

namespace GiaoxuNguPhucBE.Services
{
    public class ParishCalendarEventService(AppDbContext db) : IParishCalendarEventService
    {
        // ── GetByMonth (dùng chung cho public + admin) ──────────────────────────

        public async Task<List<ParishCalendarEventResponseDto>> GetByMonthAsync(int year, int month)
        {
            var items = await db.ParishCalendarEvents
                .Where(e => e.EventDate.Year == year && e.EventDate.Month == month)
                .OrderBy(e => e.EventDate)
                .ThenBy(e => e.DisplayOrder)
                .ToListAsync();

            return items.Select(MapToDto).ToList();
        }

        // ── Create ───────────────────────────────────────────────────────────

        public async Task<ParishCalendarEventResponseDto> CreateAsync(ParishCalendarEventDto dto)
        {
            var entity = new ParishCalendarEvent
            {
                Title        = dto.Title.Trim(),
                Description  = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim(),
                EventDate    = dto.EventDate,
                EventType    = dto.EventType,
                TimeLabel    = string.IsNullOrWhiteSpace(dto.TimeLabel) ? null : dto.TimeLabel.Trim(),
                Location     = string.IsNullOrWhiteSpace(dto.Location) ? null : dto.Location.Trim(),
                DisplayOrder = dto.DisplayOrder,
            };

            db.ParishCalendarEvents.Add(entity);
            await db.SaveChangesAsync();

            return MapToDto(entity);
        }

        // ── Update ───────────────────────────────────────────────────────────

        public async Task<ParishCalendarEventResponseDto?> UpdateAsync(int id, ParishCalendarEventDto dto)
        {
            var entity = await db.ParishCalendarEvents.FindAsync(id);
            if (entity is null) return null;

            entity.Title        = dto.Title.Trim();
            entity.Description  = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
            entity.EventDate    = dto.EventDate;
            entity.EventType    = dto.EventType;
            entity.TimeLabel    = string.IsNullOrWhiteSpace(dto.TimeLabel) ? null : dto.TimeLabel.Trim();
            entity.Location     = string.IsNullOrWhiteSpace(dto.Location) ? null : dto.Location.Trim();
            entity.DisplayOrder = dto.DisplayOrder;

            await db.SaveChangesAsync();
            return MapToDto(entity);
        }

        // ── Delete ───────────────────────────────────────────────────────────

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await db.ParishCalendarEvents.FindAsync(id);
            if (entity is null) return false;

            db.ParishCalendarEvents.Remove(entity);
            await db.SaveChangesAsync();
            return true;
        }

        // ── Helpers ──────────────────────────────────────────────────────────

        private static ParishCalendarEventResponseDto MapToDto(ParishCalendarEvent e) => new()
        {
            Id            = e.Id,
            Title         = e.Title,
            Description   = e.Description,
            EventDate     = e.EventDate,
            EventType     = (int)e.EventType,
            EventTypeName = e.EventType.ToString(),
            TimeLabel     = e.TimeLabel,
            Location      = e.Location,
            DisplayOrder  = e.DisplayOrder,
        };
    }
}
