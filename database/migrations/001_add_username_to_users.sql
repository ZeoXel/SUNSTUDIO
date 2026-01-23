-- 添加 username 列到 users 表
-- 该迁移为 USERAPI 网关数据库添加用户名字段

-- 添加 username 列（可选字段）
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(50);

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 添加唯一约束（如果需要用户名唯一）
-- ALTER TABLE users ADD CONSTRAINT unique_username UNIQUE (username);

-- 注释说明
COMMENT ON COLUMN users.username IS '用户自定义用户名，可为空';
