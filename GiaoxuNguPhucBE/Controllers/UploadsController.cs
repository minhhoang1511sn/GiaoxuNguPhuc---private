using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GiaoxuNguPhucBE.Respone;

namespace GiaoxuNguPhucBE.Controllers
{
    /// <summary>
    /// Endpoint upload ảnh từ máy người dùng (thay cho việc dán link ảnh có sẵn).
    /// Ảnh được lưu vào wwwroot/uploads/{folder}/ và phục vụ qua static files,
    /// trả về đường dẫn tương đối để frontend lưu chung với các trường *Url hiện có
    /// (ImageUrl của ClergyMember, ThumbnailUrl của Post...).
    /// </summary>
    [ApiController]
    [Route("api/uploads")]
    [Produces("application/json")]
    public class UploadsController(IWebHostEnvironment env, ILogger<UploadsController> logger) : ControllerBase
    {
        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg", ".jpeg", ".png", ".webp", ".gif"
        };

        private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg", "image/png", "image/webp", "image/gif"
        };

        private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5MB

        /// <summary>
        /// POST /api/uploads?folder=clergy - Upload 1 ảnh từ máy.
        /// folder dùng để phân loại thư mục lưu (clergy, posts...), mặc định "general".
        /// </summary>
        [Authorize(Roles = "Admin")]
        [HttpPost]
        [RequestSizeLimit(MaxFileSizeBytes + 1024)]
        public async Task<ActionResult> UploadImage(IFormFile? file, [FromQuery] string folder = "general")
        {
            if (file is null || file.Length == 0)
                return BadRequest(new ApiError("Vui lòng chọn một file ảnh để tải lên."));

            if (file.Length > MaxFileSizeBytes)
                return BadRequest(new ApiError("Kích thước ảnh tối đa là 5MB."));

            var ext = Path.GetExtension(file.FileName);
            if (string.IsNullOrWhiteSpace(ext) || !AllowedExtensions.Contains(ext))
                return BadRequest(new ApiError("Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF."));

            if (!AllowedContentTypes.Contains(file.ContentType))
                return BadRequest(new ApiError("File tải lên không đúng định dạng ảnh."));

            // Chỉ cho phép chữ/số trong tên thư mục để tránh path traversal (../, /, \)
            var safeFolder = string.IsNullOrWhiteSpace(folder) || !folder.All(c => char.IsLetterOrDigit(c) || c == '-' || c == '_')
                ? "general"
                : folder;

            var webRoot = env.WebRootPath;
            if (string.IsNullOrEmpty(webRoot))
            {
                webRoot = Path.Combine(env.ContentRootPath, "wwwroot");
            }

            var uploadDir = Path.Combine(webRoot, "uploads", safeFolder);
            Directory.CreateDirectory(uploadDir);

            var fileName = $"{Guid.NewGuid():N}{ext.ToLowerInvariant()}";
            var filePath = Path.Combine(uploadDir, fileName);

            try
            {
                using var stream = new FileStream(filePath, FileMode.Create);
                await file.CopyToAsync(stream);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Lỗi khi lưu file upload vào {Path}", filePath);
                return StatusCode(500, new ApiError("Không thể lưu file. Vui lòng thử lại."));
            }

            // Đường dẫn tương đối — frontend tự nối với NEXT_PUBLIC_API_URL khi hiển thị
            var relativeUrl = $"/uploads/{safeFolder}/{fileName}";

            return Ok(new { url = relativeUrl });
        }
    }
}
