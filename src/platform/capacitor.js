// Capacitor 實作（Android / iOS）：直接在 WebView 內透過原生插件存取 SQLite 與裝置資訊
// Migration 與桌面版共用 db/migrations/*.up.sql；執行記錄則不同：桌面版由 knex 記在 knex_migrations，這裡記在 schema_migrations
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import { Device } from '@capacitor/device';

const DB_NAME = 'app';
const sqlite = new SQLiteConnection(CapacitorSQLite);

// Vite 打包時把所有 migration SQL 以字串形式內嵌進前端
const migrationFiles = import.meta.glob('../../db/migrations/*.up.sql', { query: '?raw', import: 'default', eager: true });
const migrations = Object.entries(migrationFiles)
  .map(([file, sql]) => ({ name: file.split('/').pop().replace(/\.up\.sql$/, ''), sql }))
  .sort((a, b) => a.name.localeCompare(b.name));

// 去除整行註解（規則與桌面版 db/migrations/index.js 一致）
const stripComments = (sql) => sql.split('\n').filter((line) => !line.trim().startsWith('--')).join('\n');

const queryRows = async (db, sql) => (await db.query(sql)).values ?? [];

const getCompletedMigrations = async (db) =>
  (await queryRows(db, 'SELECT name FROM schema_migrations ORDER BY name')).map((row) => row.name);

let dbPromise = null;

// 開啟資料庫並執行尚未跑過的 migration；只做一次，之後重用同一個連線
const openDatabase = () => {
  dbPromise ??= (async () => {
    // WebView 重新載入後，原生端可能還留著舊連線：先同步兩端狀態，再決定新建或沿用
    await sqlite.checkConnectionsConsistency();
    const { result: exists } = await sqlite.isConnection(DB_NAME, false);
    const db = exists
      ? await sqlite.retrieveConnection(DB_NAME, false)
      : await sqlite.createConnection(DB_NAME, false, 'no-encryption', 1, false);
    if (!(await db.isDBOpen()).result) await db.open();

    await db.execute(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      run_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );`);
    const completed = await getCompletedMigrations(db);
    for (const { name, sql } of migrations.filter((m) => !completed.includes(m.name))) {
      // migration 本體與執行記錄放在同一個交易，避免執行到一半留下不一致的狀態
      await db.execute(`${stripComments(sql)}\nINSERT INTO schema_migrations (name) VALUES ('${name}');`, true);
    }
    return db;
  })();
  return dbPromise;
};

export const getDbInfo = async () => {
  try {
    const db = await openDatabase();
    const completed = await getCompletedMigrations(db);
    const [{ version: sqliteVersion }] = await queryRows(db, 'SELECT sqlite_version() AS version');
    const [{ page_count: pageCount }] = await queryRows(db, 'PRAGMA page_count');
    const [{ page_size: pageSize }] = await queryRows(db, 'PRAGMA page_size');
    const tables = await queryRows(db, "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'");

    return {
      ok: true,
      data: {
        appVersion: __APP_VERSION__,
        libraries: [{ name: '@capacitor-community/sqlite', version: __CAP_SQLITE_VERSION__ }],
        sqliteVersion,
        schemaVersion: completed.at(-1)?.split('_')[0] ?? 'none', // 與 knex currentVersion 相同：最後一支的時間戳
        dbPath: (await db.getUrl()).url,
        fileSize: pageCount * pageSize,
        tables: tables.map((row) => row.name),
        completedMigrations: completed,
        pendingMigrations: migrations.map((m) => m.name).filter((name) => !completed.includes(name)),
      },
    };
  } catch (error) {
    return { ok: false, error: error.message ?? String(error) };
  }
};

export const getSystemInfo = async () => {
  const info = await Device.getInfo();
  return [
    `[環境：${Capacitor.getPlatform()} 行動裝置]`,
    '',
    `作業系統：${info.operatingSystem} ${info.osVersion}`,
    `裝置：${info.manufacturer} ${info.model}`,
    `WebView：${info.webViewVersion}`,
  ].join('\n');
};
