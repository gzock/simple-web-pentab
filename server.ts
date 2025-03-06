// server.ts
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';

// ストローク(線/消しゴム) データの型定義
interface LineData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  lineWidth: number;
  tool: 'pen' | 'eraser'; // ペン or 消しゴム
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// public フォルダを静的配信
app.use(express.static(path.join(__dirname, '..', 'public')));

// これまで描かれた全ストロークを保持する配列
let drawnLines: LineData[] = [];

// Socket.IO 接続
io.on('connection', (socket: Socket) => {
  console.log('A user connected:', socket.id);

  // 新規接続クライアントに現在の描画履歴を送る
  socket.emit('initialLines', drawnLines);

  // クライアントからストロークデータを受信
  socket.on('drawLine', (data: LineData) => {
    drawnLines.push(data);
    // 他クライアントにブロードキャスト
    socket.broadcast.emit('drawLine', data);
  });

  // クリア要求
  socket.on('clearCanvas', () => {
    // サーバー側の履歴もクリア
    drawnLines = [];
    // 全クライアントにクリアを通知
    io.emit('clearCanvas');
  });

  // 切断時
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
