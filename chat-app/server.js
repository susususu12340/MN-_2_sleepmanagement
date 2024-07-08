const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const db = require('./database'); // データベース接続をインポート

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected');

    // 接続時に過去のメッセージを送信
    db.all("SELECT * FROM messages ORDER BY timestamp ASC", (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        rows.forEach((row) => {
            socket.emit('chat message', { username: row.username, message: row.message });
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
        const { username, message } = msg;
        // データベースにメッセージを保存
        db.run("INSERT INTO messages (username, message) VALUES (?, ?)", [username, message], function(err) {
            if (err) {
                return console.error(err.message);
            }
            io.emit('chat message', { username, message });
        });
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
