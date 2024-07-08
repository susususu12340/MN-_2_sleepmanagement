const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); // メモリ内データベース。ファイルを使う場合はファイル名を指定。

db.serialize(() => {
    // メッセージテーブルを作成
    db.run("CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, message TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

module.exports = db;
