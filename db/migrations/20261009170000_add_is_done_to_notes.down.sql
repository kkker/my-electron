-- 需 SQLite 3.35 以上才支援 DROP COLUMN（better-sqlite3 11 內建版本已符合）
ALTER TABLE notes DROP COLUMN is_done;
