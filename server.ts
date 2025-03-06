// server.ts
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';

interface LineData {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  lineWidth: number;
  tool: 'pen' | 'eraser';
}

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '..', 'public')));

let drawnLines: LineData[] = [];

io.on('connection', (socket: Socket) => {
  console.log('A user connected:', socket.id);

  socket.emit('initialLines', drawnLines);

  socket.on('drawLine', (data: LineData) => {
    drawnLines.push(data);
    socket.broadcast.emit('drawLine', data);
  });

  socket.on('clearCanvas', () => {
    drawnLines = [];
    io.emit('clearCanvas');
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
