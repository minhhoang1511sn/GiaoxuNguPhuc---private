using System.ComponentModel.DataAnnotations;

namespace GiaoxuNguPhucBE.DTOs
{
    public record CreateCommentDto(
        [Required, MinLength(2), MaxLength(100)] string AuthorName,
        [EmailAddress, MaxLength(200)] string? AuthorEmail,
        [Required, MinLength(1), MaxLength(2000)] string Content
    );
}
