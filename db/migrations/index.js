// 自訂 Migration Source：migration 一律寫成純 SQL 檔，桌面版（此檔，透過 knex.raw）與行動版（src/platform/capacitor.js）共用同一份
// 檔名規則：<時間戳>_<描述>.up.sql / .down.sql，依檔名排序執行，時間戳同時就是「Schema 版本號」
// 新增 migration 時：在此資料夾放入新的 .up.sql（與對應的 .down.sql）即可，兩個平台都會自動讀到
// SQL 撰寫限制：每個 statement 以分號結尾；註解只能整行使用 --；字串內不可含分號；不支援 trigger

const fs = require('fs');
const path = require('path');

// 依檔名排序列出所有 migration（Electron 的 fs 可直接讀取 asar 內的檔案，打包後同樣有效）
const listMigrations = () =>
  fs.readdirSync(__dirname)
    .filter((file) => file.endsWith('.up.sql'))
    .map((file) => file.replace(/\.up\.sql$/, ''))
    .sort();

// 去除整行註解後依分號切成單一 statement（better-sqlite3 一次只能執行一個 statement）
const splitStatements = (sql) =>
  sql.split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);

const runSqlFile = (name, direction) => async (knex) => {
  const sql = fs.readFileSync(path.join(__dirname, `${name}.${direction}.sql`), 'utf8');
  for (const statement of splitStatements(sql)) {
    await knex.raw(statement);
  }
};

module.exports = {
  getMigrations: async () => listMigrations(),
  getMigrationName: (name) => name,
  getMigration: async (name) => ({ up: runSqlFile(name, 'up'), down: runSqlFile(name, 'down') }),
};
