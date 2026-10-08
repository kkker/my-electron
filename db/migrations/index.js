// 自訂 Migration Source：以「明確 require」取代 Knex 預設的掃描資料夾
// 關鍵：打包成 asar 後掃描目錄容易踩坑，明確列出清單可確保每支 migration 都被打包進去
// 新增 migration 時：建立新檔案後，記得在下方清單「依時間順序」補上一行

const migrations = {
  '20261009000000_create_notes': require('./20261009000000_create_notes'),
};

module.exports = {
  getMigrations: async () => Object.keys(migrations),
  getMigrationName: (name) => name,
  getMigration: async (name) => migrations[name],
};
