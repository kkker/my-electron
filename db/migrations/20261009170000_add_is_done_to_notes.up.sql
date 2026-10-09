-- 第二支 Migration：notes 新增「是否已完成」標記（0 = 未完成、1 = 已完成）
-- SQLite 新增 NOT NULL 欄位必須給預設值，既有資料會自動填入 0
ALTER TABLE notes ADD COLUMN is_done INTEGER NOT NULL DEFAULT 0;
