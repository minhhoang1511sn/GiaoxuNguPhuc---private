using GiaoxuNguPhucBE.Models;
using System.ComponentModel.DataAnnotations;


namespace GiaoxuNguPhucBE.DTOs
{
    public record CreatePostDto(
        [Required, MinLength(5), MaxLength(300)] string Title,
        [Required, MinLength(10), MaxLength(500)] string Excerpt,
        [Required, MinLength(10)] string Content,
        string? ThumbnailUrl,
        string? CoverImageUrl,
        int AuthorId,
        PostStatus Status = PostStatus.Draft
    );
}
