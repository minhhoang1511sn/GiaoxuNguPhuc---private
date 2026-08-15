using DotNetEnv;
using GiaoxuNguPhucBE.Config;
using GiaoxuNguPhucBE.Data;
using GiaoxuNguPhucBE.Interfaces;
using GiaoxuNguPhucBE.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Load .env
Env.Load();

// Connection String
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")!
    .Replace("${DB_HOST}", Environment.GetEnvironmentVariable("DB_HOST"))
    .Replace("${DB_PORT}", Environment.GetEnvironmentVariable("DB_PORT"))
    .Replace("${DB_NAME}", Environment.GetEnvironmentVariable("DB_NAME"))
    .Replace("${DB_USER}", Environment.GetEnvironmentVariable("DB_USER"))
    .Replace("${DB_PASS}", Environment.GetEnvironmentVariable("DB_PASS"))
    // SslMode: mặc định "Preferred" (dùng SSL nếu server hỗ trợ, không có thì
    // vẫn kết nối bình thường) -> chạy được cả với MySQL local (không SSL) lẫn
    // MySQL cloud (TiDB Cloud, Aiven...) yêu cầu SSL bắt buộc ("Required").
    .Replace("${DB_SSLMODE}", Environment.GetEnvironmentVariable("DB_SSLMODE") ?? "Preferred");

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// ─────────────────────────────────────────────────────────────────────────
// JWT: ưu tiên lấy từ biến môi trường (.env), fallback sang appsettings.json
// nếu biến môi trường không được set (ví dụ khi appsettings.json đã có sẵn giá trị).
// ─────────────────────────────────────────────────────────────────────────
var jwtSettings = new JwtSettings
{
    Key = Environment.GetEnvironmentVariable("JWT_KEY")
          ?? builder.Configuration["Jwt:Key"]
          ?? throw new InvalidOperationException("Thiếu cấu hình JWT_KEY (biến môi trường hoặc appsettings.json > Jwt:Key)."),
    Issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") ?? builder.Configuration["Jwt:Issuer"] ?? "GiaoxuNguPhucBE",
    Audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") ?? builder.Configuration["Jwt:Audience"] ?? "GiaoxuNguPhucFE",
    AccessTokenMinutes = int.TryParse(Environment.GetEnvironmentVariable("JWT_ACCESS_TOKEN_MINUTES") ?? builder.Configuration["Jwt:AccessTokenMinutes"], out var atm) ? atm : 15,
    RefreshTokenDays = int.TryParse(Environment.GetEnvironmentVariable("JWT_REFRESH_TOKEN_DAYS") ?? builder.Configuration["Jwt:RefreshTokenDays"], out var rtd) ? rtd : 7,
};
builder.Services.AddSingleton(jwtSettings);

// ─────────────────────────────────────────────────────────────────────────
// Email (SMTP): ưu tiên biến môi trường (.env), fallback sang appsettings.json.
// Dùng để gửi mail cho Admin khi có tài khoản mới đăng ký chờ duyệt, và gửi
// mật khẩu mới cho người dùng khi Admin reset mật khẩu.
// ─────────────────────────────────────────────────────────────────────────
var emailSettings = new EmailSettings
{
    SmtpHost = Environment.GetEnvironmentVariable("SMTP_HOST") ?? builder.Configuration["Email:SmtpHost"] ?? "",
    SmtpPort = int.TryParse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? builder.Configuration["Email:SmtpPort"], out var smtpPort) ? smtpPort : 587,
    SmtpUser = Environment.GetEnvironmentVariable("SMTP_USER") ?? builder.Configuration["Email:SmtpUser"] ?? "",
    SmtpPass = Environment.GetEnvironmentVariable("SMTP_PASS") ?? builder.Configuration["Email:SmtpPass"] ?? "",
    FromEmail = Environment.GetEnvironmentVariable("SMTP_FROM_EMAIL") ?? builder.Configuration["Email:FromEmail"] ?? "",
    FromName = Environment.GetEnvironmentVariable("SMTP_FROM_NAME") ?? builder.Configuration["Email:FromName"] ?? "Giáo xứ Ngũ Phúc",
    EnableSsl = !bool.TryParse(Environment.GetEnvironmentVariable("SMTP_ENABLE_SSL") ?? builder.Configuration["Email:EnableSsl"], out var enableSsl) || enableSsl,
    AdminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL") ?? builder.Configuration["Email:AdminEmail"] ?? "",
    FrontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? builder.Configuration["Email:FrontendUrl"] ?? "http://localhost:3000",
};
builder.Services.AddSingleton(emailSettings);
builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});

// Services
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<ICatechismRegistrationService, CatechismRegistrationService>();
builder.Services.AddScoped<ICatechismClassService, CatechismClassService>();
builder.Services.AddScoped<IClergyMemberService, ClergyMemberService>();
builder.Services.AddScoped<IParishHistoryService, ParishHistoryService>();
builder.Services.AddScoped<IMinistryService, MinistryService>();
builder.Services.AddScoped<IContactInfoService, ContactInfoService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IPageSettingService, PageSettingService>();
builder.Services.AddScoped<IHomeSlideService, HomeSlideService>();
builder.Services.AddScoped<IParishCalendarEventService, ParishCalendarEventService>();
builder.Services.AddScoped<IMinistryRegistrationService, MinistryRegistrationService>();
builder.Services.AddScoped<INewsletterService, NewsletterService>();
builder.Services.AddScoped<IContactMessageService, ContactMessageService>();
// Controllers
builder.Services.AddControllers();

// CORS
// Trước đây origin bị hardcode "http://localhost:3000" nên khi deploy lên
// domain thật, mọi request từ frontend production sẽ bị CORS chặn. Giờ dùng
// lại đúng FrontendUrl đã cấu hình sẵn cho email (biến môi trường FRONTEND_URL),
// đảm bảo luôn khớp với domain frontend đang chạy thật.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(emailSettings.FrontendUrl)
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

// ─────────────────────────────────────────────────────────────────────────
// Xử lý lỗi tập trung.
//
// Trước đây KHÔNG có middleware nào bắt exception toàn cục, và không controller
// nào tự try/catch — nghĩa là bất kỳ lỗi không lường trước nào (mất kết nối DB,
// null reference...) sẽ rơi vào trang lỗi mặc định của ASP.NET Core (HTML, hoặc
// rỗng ở Production) thay vì JSON. Phía frontend (apiClient.js) luôn cố gắng
// đọc `response.json().message` để hiển thị lỗi cho người dùng — với response
// rỗng/không phải JSON, người dùng chỉ thấy "HTTP 500" vô nghĩa.
//
// Middleware này đảm bảo MỌI lỗi không được xử lý đều trả về JSON dạng
// { message: "..." } giống các lỗi nghiệp vụ (400/404) mà API đã trả ở nơi khác,
// đồng thời ghi log đầy đủ exception ở phía server để dev debug.
// ─────────────────────────────────────────────────────────────────────────
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var feature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        var exception = feature?.Error;

        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogError(exception, "Lỗi không được xử lý khi gọi {Method} {Path}",
            context.Request.Method, context.Request.Path);

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        // Ở Development lộ message thật để dễ debug; ở Production giấu chi tiết
        // nội bộ (connection string, stack trace...) để tránh lộ thông tin nhạy cảm.
        var message = app.Environment.IsDevelopment() && exception != null
            ? exception.Message
            : "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";

        await context.Response.WriteAsJsonAsync(new { message });
    });
});

// Đảm bảo thư mục lưu ảnh upload tồn tại trước khi phục vụ static files
var uploadsRoot = Path.Combine(app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot"), "uploads");
Directory.CreateDirectory(uploadsRoot);

// Phục vụ ảnh đã upload (wwwroot/uploads/...) qua đường dẫn tĩnh /uploads/...
app.UseStaticFiles();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
