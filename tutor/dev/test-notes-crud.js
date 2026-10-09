// 驗證 notes 資料表的 CRUD（新增、讀取、修改、刪除）
// 整個流程包在交易中，最後 rollback，資料庫不會留下任何測試資料
//
// 執行方式（於容器內、專案根目錄）：
//   ELECTRON_RUN_AS_NODE=1 npx electron tutor/dev/test-notes-crud.js
// 注意：better-sqlite3 已編譯成 Electron 版本，不能直接用 node 執行，否則會出現 NODE_MODULE_VERSION 不符
// 可用環境變數 DB_PATH 指定其他資料庫檔案

const knex = require('knex')({
  client: 'better-sqlite3',
  connection: {
    filename: process.env.DB_PATH || '/config/.config/electron-react-vite-app/app.sqlite3',
  },
  useNullAsDefault: true,
});

(async () => {
  try {
    await knex.transaction(async (trx) => {
      // C：新增
      const [id] = await trx('notes').insert({ title: '測試筆記', content: '第一版內容' });
      console.log('✔ 新增 id =', id);

      // R：讀取
      console.log('✔ 讀取', await trx('notes').where({ id }).first());

      // U：修改
      const updated = await trx('notes').where({ id })
        .update({ content: '第二版內容', updated_at: trx.fn.now() });
      console.log('✔ 修改筆數 =', updated, '→', await trx('notes').where({ id }).first());

      // D：刪除
      const deleted = await trx('notes').where({ id }).del();
      console.log('✔ 刪除筆數 =', deleted, '→ 再查一次:', await trx('notes').where({ id }).first());

      throw new Error('ROLLBACK'); // 故意丟錯，讓交易回滾，不留下任何測試資料
    });
  } catch (e) {
    if (e.message !== 'ROLLBACK') throw e;
    console.log('↩ 已 rollback，資料庫維持原狀');
  } finally {
    await knex.destroy();
  }
})();

/// 輸出：
// abc@e070d2cef6f7:~/workspace$ ELECTRON_RUN_AS_NODE=1 npx electron tutor/dev/test-notes-crud.js
// ✔ 新增 id = 1
// ✔ 讀取 {
//   id: 1,
//   title: '測試筆記',
//   content: '第一版內容',
//   is_done: 0,
//   created_at: '2026-10-09 04:39:52',
//   updated_at: '2026-10-09 04:39:52'
// }
// ✔ 修改筆數 = 1 → {
//   id: 1,
//   title: '測試筆記',
//   content: '第二版內容',
//   is_done: 0,
//   created_at: '2026-10-09 04:39:52',
//   updated_at: '2026-10-09 04:39:52'
// }
// ✔ 刪除筆數 = 1 → 再查一次: undefined
// ↩ 已 rollback，資料庫維持原狀
