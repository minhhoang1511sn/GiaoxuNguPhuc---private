# ─────────────────────────────────────────────────────────────
# Dockerfile cho GiaoxuNguPhucBE (.NET 8 Web API)
# Dùng để deploy lên Render (Web Service > Docker)
# ─────────────────────────────────────────────────────────────

# ---- Stage 1: Build ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj trước để tận dụng cache layer khi restore package
COPY GiaoxuNguPhucBE.csproj ./
RUN dotnet restore "GiaoxuNguPhucBE.csproj"

# Copy toàn bộ source còn lại và build
COPY . .
RUN dotnet publish "GiaoxuNguPhucBE.csproj" -c Release -o /app/publish --no-restore

# ---- Stage 2: Runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Tạo sẵn thư mục lưu ảnh upload (sẽ bị mất khi container restart nếu
# không gắn Render Disk - xem README_DEPLOY.md)
RUN mkdir -p /app/wwwroot/uploads

COPY --from=build /app/publish .

# Render tự cấp biến môi trường PORT và route traffic vào đúng cổng đó.
# ASP.NET Core cần bind vào 0.0.0.0:$PORT thay vì cổng cố định.
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:${PORT:-8080} dotnet GiaoxuNguPhucBE.dll"]
