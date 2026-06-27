-- ════════════════════════════════════════════════════════════════════════
-- Script đồng bộ bảng `Users` với model User.cs hiện tại.
-- An toàn để chạy nhiều lần (chỉ ADD COLUMN nếu cột chưa tồn tại).
-- Chạy script này trong MySQL client, đúng database mà backend đang dùng
-- (xem DB_NAME trong file .env).
-- ════════════════════════════════════════════════════════════════════════

-- AvatarUrl (string?, nullable)
SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'Users' AND column_name = 'AvatarUrl'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE `Users` ADD COLUMN `AvatarUrl` VARCHAR(255) NULL',
    'SELECT "AvatarUrl already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Role (enum UserRole -> stored as int, default 0 = User)
SET @col_exists := (
    SELECT COUNT(*) FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = 'Users' AND column_name = 'Role'
);
SET @sql := IF(@col_exists = 0,
    'ALTER TABLE `Users` ADD COLUMN `Role` INT NOT NULL DEFAULT 0',
    'SELECT "Role already exists"');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Kiểm tra lại toàn bộ cột hiện có của bảng Users sau khi chạy xong
SELECT column_name, column_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = DATABASE() AND table_name = 'Users'
ORDER BY ordinal_position;
