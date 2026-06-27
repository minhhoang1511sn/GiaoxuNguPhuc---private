using DotNetEnv;
using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Load .env
Env.Load();

// Connection String
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!
    .Replace("${DB_HOST}", Environment.GetEnvironmentVariable("DB_HOST"))
    .Replace("${DB_PORT}", Environment.GetEnvironmentVariable("DB_PORT"))
    .Replace("${DB_NAME}", Environment.GetEnvironmentVariable("DB_NAME"))
    .Replace("${DB_USER}", Environment.GetEnvironmentVariable("DB_USER"))
    .Replace("${DB_PASS}", Environment.GetEnvironmentVariable("DB_PASS"));

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Services
builder.Services.AddScoped<IPostService, PostService>();

// Controllers
builder.Services.AddControllers();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// ─────────────────────────────────────────────────────────────────────────
// Áp dụng EF Core Migrations khi khởi động.
//
// Trước đây project không dùng Migrations mà tự kiểm tra "bảng đã tồn tại
// chưa" rồi bỏ qua nếu có đủ bảng. Cách đó có lỗ hổng: nếu bảng đã tồn tại
// nhưng THIẾU CỘT so với model hiện tại (ví dụ thêm field mới vào entity),
// nó vẫn bị bỏ qua -> EF Core sinh câu SQL SELECT cột không tồn tại ->
// MySqlException "Unknown column ... in 'field list'" -> 500 lúc runtime.
//
// MigrateAsync() áp dụng đúng migration nào CHƯA được áp dụng (tạo bảng
// mới hoặc thêm/sửa cột), dựa theo lịch sử lưu trong bảng __EFMigrationsHistory.
// Đây là cách chuẩn để giữ DB schema luôn khớp với model.
// ─────────────────────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var startupLogger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    const int maxRetries = 5;
    for (var attempt = 1; attempt <= maxRetries; attempt++)
    {
        try
        {
            await db.Database.MigrateAsync();
            startupLogger.LogInformation("Đã áp dụng migrations thành công (DB schema đã đồng bộ với model).");
            break;
        }
        catch (Exception ex) when (attempt < maxRetries)
        {
            startupLogger.LogWarning(ex,
                "Không thể kết nối/migrate Database (lần thử {Attempt}/{MaxRetries}). Thử lại sau 3 giây...",
                attempt, maxRetries);
            await Task.Delay(3000);
        }
    }
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
