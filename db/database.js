const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const createKnex = require('knex');
const migrationSource = require('./migrations');

let knex = null;

// 資料庫存放於作業系統的使用者資料夾，版本升級（覆蓋安裝）時不會被刪除
// macOS: ~/Library/Application Support/<App>/   Windows: %APPDATA%\<App>\   Linux: ~/.config/<App>/
function getDbPath() {
  return path.join(app.getPath('userData'), 'app.sqlite3');
}

// 程式啟動時呼叫：開啟資料庫並自動執行尚未跑過的 migration
async function initDatabase() {
  const dbPath = getDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  knex = createKnex({
    client: 'better-sqlite3',
    connection: { filename: dbPath },
    useNullAsDefault: true, // SQLite 不支援 DEFAULT 關鍵字，Knex 官方建議開啟
  });

  await knex.migrate.latest({ migrationSource });
}

// 讀取套件的 package.json 取得版本號
function getPackageVersion(name) {
  try {
    return require(`${name}/package.json`).version;
  } catch {
    return 'unknown';
  }
}

// 提供給 IPC 使用：彙整資料庫狀態回傳給 React
async function getDatabaseInfo() {
  const dbPath = getDbPath();
  const [{ version: sqliteVersion }] = await knex.raw('select sqlite_version() as version');
  const schemaVersion = await knex.migrate.currentVersion({ migrationSource });
  const [completed, pending] = await knex.migrate.list({ migrationSource });
  const tables = await knex('sqlite_master')
    .where({ type: 'table' })
    .whereNot('name', 'like', 'sqlite_%')
    .pluck('name');

  return {
    appVersion: app.getVersion(),
    knexVersion: getPackageVersion('knex'),
    betterSqlite3Version: getPackageVersion('better-sqlite3'),
    sqliteVersion,
    schemaVersion, // 最後一支已執行 migration 的時間戳，尚未執行任何 migration 時為 'none'
    dbPath,
    fileSize: fs.statSync(dbPath).size,
    tables,
    completedMigrations: completed.map((m) => m.name),
    pendingMigrations: pending.map((m) => migrationSource.getMigrationName(m)),
  };
}

async function closeDatabase() {
  if (knex) {
    await knex.destroy();
    knex = null;
  }
}

module.exports = { initDatabase, getDatabaseInfo, closeDatabase };
