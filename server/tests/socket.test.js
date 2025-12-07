import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { io as ioClient } from 'socket.io-client';
import http from 'http';
import { Server } from 'socket.io';
import express from 'express';
import cors from 'cors';

/**
 * Integration tests for Socket.IO real-time collaboration
 */

let httpServer;
let io;
let serverPort;
let clientSocket1;
let clientSocket2;

// Setup test server
beforeAll((done) => {
  const app = express();
  app.use(cors());

  httpServer = http.createServer(app);
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  const rooms = new Map();

  // Socket.IO handlers (copied from main server)
  io.on('connection', (socket) => {
    socket.on('join-room', ({ roomId, userId, username }) => {
      socket.join(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          code: '// Welcome to the collaborative coding interview!\n// Start coding in JavaScript...\n\nfunction greet(name) {\n  return "Hello, " + name + "!";\n}\n',
          language: 'javascript',
          users: new Map()
        });
      }

      const room = rooms.get(roomId);
      room.users.set(socket.id, { userId, username });

      socket.emit('room-state', {
        code: room.code,
        language: room.language,
        users: Array.from(room.users.values())
      });

      socket.to(roomId).emit('user-joined', { userId, username });
    });

    socket.on('code-change', ({ roomId, code }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.code = code;
        socket.to(roomId).emit('code-update', { code });
      }
    });

    socket.on('language-change', ({ roomId, language }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.language = language;
        const starterCode = {
          javascript: '// Welcome to the collaborative coding interview!\n// Start coding in JavaScript...\n\nfunction greet(name) {\n  return "Hello, " + name + "!";\n}\n',
          python: '# Welcome to the collaborative coding interview!\n# Start coding in Python...\n\ndef greet(name):\n    return f\'Hello, {name}!\'\n'
        };
        room.code = starterCode[language] || starterCode.javascript;
        io.to(roomId).emit('language-update', { language });
        io.to(roomId).emit('code-update', { code: room.code });
      }
    });

    socket.on('disconnect', () => {
      rooms.forEach((room, roomId) => {
        if (room.users.has(socket.id)) {
          const user = room.users.get(socket.id);
          room.users.delete(socket.id);
          socket.to(roomId).emit('user-left', { userId: user.userId });

          if (room.users.size === 0) {
            rooms.delete(roomId);
          }
        }
      });
    });
  });

  httpServer.listen(() => {
    serverPort = httpServer.address().port;
    done();
  });
});

afterAll((done) => {
  io.close();
  httpServer.close(done);
});

beforeEach(() => {
  if (clientSocket1?.connected) clientSocket1.disconnect();
  if (clientSocket2?.connected) clientSocket2.disconnect();
});

describe('Socket.IO Real-time Collaboration', () => {
  test('should connect to server', (done) => {
    clientSocket1 = ioClient(`http://localhost:${serverPort}`);

    clientSocket1.on('connect', () => {
      expect(clientSocket1.connected).toBe(true);
      clientSocket1.disconnect();
      done();
    });
  });

  test('should join room and receive room state', (done) => {
    clientSocket1 = ioClient(`http://localhost:${serverPort}`);

    clientSocket1.on('connect', () => {
      clientSocket1.emit('join-room', {
        roomId: 'test-room-1',
        userId: 'user-1',
        username: 'Test User 1'
      });
    });

    clientSocket1.on('room-state', (state) => {
      expect(state).toBeDefined();
      expect(state.code).toBeDefined();
      expect(state.language).toBe('javascript');
      expect(state.users).toBeInstanceOf(Array);
      clientSocket1.disconnect();
      done();
    });
  });

  test('should notify other users when someone joins', (done) => {
    clientSocket1 = ioClient(`http://localhost:${serverPort}`);
    clientSocket2 = ioClient(`http://localhost:${serverPort}`);

    let client1Ready = false;
    let client2Ready = false;

    clientSocket1.on('connect', () => {
      clientSocket1.emit('join-room', {
        roomId: 'test-room-2',
        userId: 'user-1',
        username: 'User One'
      });
    });

    clientSocket1.on('room-state', () => {
      client1Ready = true;
      if (client2Ready) {
        clientSocket1.disconnect();
        clientSocket2.disconnect();
      }
    });

    clientSocket1.on('user-joined', (data) => {
      expect(data.userId).toBe('user-2');
      expect(data.username).toBe('User Two');
      clientSocket1.disconnect();
      clientSocket2.disconnect();
      done();
    });

    // Wait a bit before second user joins
    setTimeout(() => {
      clientSocket2.emit('join-room', {
        roomId: 'test-room-2',
        userId: 'user-2',
        username: 'User Two'
      });

      clientSocket2.on('room-state', () => {
        client2Ready = true;
      });
    }, 100);
  });

  test('should synchronize code changes between users', (done) => {
    clientSocket1 = ioClient(`http://localhost:${serverPort}`);
    clientSocket2 = ioClient(`http://localhost:${serverPort}`);

    const testCode = 'console.log("Hello from tests!");';

    clientSocket1.on('connect', () => {
      clientSocket1.emit('join-room', {
        roomId: 'test-room-3',
        userId: 'user-1',
        username: 'User One'
      });
    });

    clientSocket1.on('room-state', () => {
      // Second user joins
      setTimeout(() => {
        clientSocket2.emit('join-room', {
          roomId: 'test-room-3',
          userId: 'user-2',
          username: 'User Two'
        });
      }, 100);
    });

    clientSocket2.on('room-state', () => {
      // User 1 sends code change
      clientSocket1.emit('code-change', {
        roomId: 'test-room-3',
        code: testCode
      });
    });

    clientSocket2.on('code-update', (data) => {
      expect(data.code).toBe(testCode);
      clientSocket1.disconnect();
      clientSocket2.disconnect();
      done();
    });
  });

  test('should synchronize language changes', (done) => {
    clientSocket1 = ioClient(`http://localhost:${serverPort}`);
    clientSocket2 = ioClient(`http://localhost:${serverPort}`);

    clientSocket1.on('connect', () => {
      clientSocket1.emit('join-room', {
        roomId: 'test-room-4',
        userId: 'user-1',
        username: 'User One'
      });
    });

    clientSocket1.on('room-state', () => {
      setTimeout(() => {
        clientSocket2.emit('join-room', {
          roomId: 'test-room-4',
          userId: 'user-2',
          username: 'User Two'
        });
      }, 100);
    });

    clientSocket2.on('room-state', () => {
      clientSocket1.emit('language-change', {
        roomId: 'test-room-4',
        language: 'python'
      });
    });

    let languageUpdated = false;
    let codeUpdated = false;

    clientSocket2.on('language-update', (data) => {
      expect(data.language).toBe('python');
      languageUpdated = true;
      if (codeUpdated) {
        clientSocket1.disconnect();
        clientSocket2.disconnect();
        done();
      }
    });

    clientSocket2.on('code-update', (data) => {
      expect(data.code).toContain('# Welcome');
      codeUpdated = true;
      if (languageUpdated) {
        clientSocket1.disconnect();
        clientSocket2.disconnect();
        done();
      }
    });
  });

  test('should notify when user leaves', (done) => {
    clientSocket1 = ioClient(`http://localhost:${serverPort}`);
    clientSocket2 = ioClient(`http://localhost:${serverPort}`);

    clientSocket1.on('connect', () => {
      clientSocket1.emit('join-room', {
        roomId: 'test-room-5',
        userId: 'user-1',
        username: 'User One'
      });
    });

    clientSocket1.on('room-state', () => {
      setTimeout(() => {
        clientSocket2.emit('join-room', {
          roomId: 'test-room-5',
          userId: 'user-2',
          username: 'User Two'
        });
      }, 100);
    });

    clientSocket2.on('room-state', () => {
      // User 2 leaves
      setTimeout(() => {
        clientSocket2.disconnect();
      }, 100);
    });

    clientSocket1.on('user-left', (data) => {
      expect(data.userId).toBe('user-2');
      clientSocket1.disconnect();
      done();
    });
  });
});
