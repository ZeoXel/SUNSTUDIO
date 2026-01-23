# 数据库迁移

本目录包含 USERAPI 网关数据库的迁移文件。

## 迁移说明

### 001_add_username_to_users.sql

**目的**: 为 users 表添加 username 字段，允许用户自定义用户名

**变更内容**:
- 添加 `username` 列（VARCHAR(50)，可为空）
- 添加索引以提高查询性能
- 添加字段注释

**应用方法**:

1. **使用 Supabase CLI**:
   ```bash
   # 方法一：通过 Supabase CLI 直接执行
   supabase db push

   # 方法二：手动执行 SQL
   psql -U postgres -d your_database -f 001_add_username_to_users.sql
   ```

2. **使用 Supabase Dashboard**:
   - 登录 Supabase Dashboard
   - 进入 SQL Editor
   - 复制 `001_add_username_to_users.sql` 文件内容
   - 执行 SQL

3. **使用其他数据库工具**:
   - pgAdmin
   - DBeaver
   - 其他 PostgreSQL 客户端工具

## 后端 API 更新

迁移应用后，需要确保后端 API (USERAPI 网关) 支持：

1. **用户名更新 API**:
   ```
   POST /api/user/update-username
   Headers: Authorization: Bearer <api_key>
   Body: { "username": "新用户名" }
   ```

2. **用户信息查询 API** 需要返回 `username` 字段:
   ```json
   {
     "user": {
       "id": "...",
       "name": "...",
       "username": "自定义用户名",
       "email": "...",
       ...
     }
   }
   ```

## 注意事项

1. **字段可为空**: username 设计为可选字段，用户可以选择不设置
2. **长度限制**: 用户名长度限制为 1-50 个字符
3. **唯一性**: 当前未启用唯一约束，如需启用请取消注释 SQL 中的 UNIQUE 约束
4. **向后兼容**: 添加的是可选字段，不影响现有用户数据

## 回滚方法

如需回滚此迁移：

```sql
-- 删除 username 列
ALTER TABLE users DROP COLUMN IF EXISTS username;

-- 删除索引
DROP INDEX IF EXISTS idx_users_username;
```
