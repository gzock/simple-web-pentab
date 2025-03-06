// server.ts
import express, { Request, Response } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';

// 描画データを型で定義
interface LineData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  lineWidth: number;
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 静的ファイル (public フォルダ) を配信
app.use(express.static(path.join(__dirname, '..', 'public')));

// これまでに描かれた全ストロークを保持する配列
let drawnLines: LineData[] = [];

// Socket 接続
io.on('connection', (socket: Socket) => {
  console.log('A user connected:', socket.id);

  // 接続クライアントに今までの描画履歴を送信
  socket.emit('initialLines', drawnLines);

  // クライアントからの描画イベントを受け取る
  socket.on('drawLine', (data: LineData) => {
    drawnLines.push(data);
    socket.broadcast.emit('drawLine', data);
  });

  // "clearCanvas" イベントを受け取ったとき
  socket.on('clearCanvas', () => {
    // サーバー側の履歴をクリア
    drawnLines = [];
    // 全クライアントにキャンバスクリアの通知
    io.emit('clearCanvas');
  });

  // クライアント切断時
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// もし任意のルートを設けるなら (例: /draw, /view)
// ただし今回、publicフォルダに置いたHTMLを直接参照しているので、
// 明示的なルーティングは不要。
// app.get('/draw', (req: Request, res: Response) => {
//   res.sendFile(path.join(__dirname, '..', 'public', 'draw.html'));
// });

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
