// 第一支 Migration：建立筆記資料表
// 命名規則：<時間戳>_<描述>，Knex 依檔名排序執行，時間戳同時就是「Schema 版本號」

exports.up = function (knex) {
  return knex.schema.createTable('notes', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('content');
    table.timestamps(true, true); // created_at / updated_at，預設值為現在時間
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('notes');
};
