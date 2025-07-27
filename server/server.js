// Limited-use Judge0 collaborative server
import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import axios from 'axios';

const PORT = 3000;
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const RAPIDAPI_KEY = '3a012748demsh0ba621e26d69d0fp15011cjsnd72c5c9f7a89'; 

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://codecollab-client.onrender.com/',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const userSocketMap = {};
const roomCodeState = {};
const requestCount = {};
const MAX_DAILY_REQUESTS = 150;

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => ({
    socketId,
    username: userSocketMap[socketId],
  }));
};

const languageMap = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
};

const executeCode = async (code, language, input = '') => {
  const languageId = languageMap[language];
  if (!languageId) throw new Error(`Unsupported language: ${language}`);

  // Limit check
  const today = new Date().toISOString().split('T')[0];
  requestCount[today] = (requestCount[today] || 0) + 1;
  if (requestCount[today] > MAX_DAILY_REQUESTS) {
    throw new Error('Free execution limit reached for today. Try again tomorrow.');
  }

  console.log('Executing code:', { code: code.substring(0, 100), language, languageId });

  try {
    const response = await axios.post(
      `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: code,
        language_id: languageId,
        stdin: input,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        },
        timeout: 30000, 
      }
    );

    console.log('Judge0 response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Judge0 API Error:', error.response?.data || error.message);
    throw new Error(`Judge0 API Error: ${error.response?.data?.error || error.message}`);
  }
};

app.post('/api/execute', async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    
    const { code, language, input, roomId } = req.body;
    
    // Better validation
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing or invalid code parameter.' });
    }
    
    if (!language || typeof language !== 'string') {
      return res.status(400).json({ success: false, error: 'Missing or invalid language parameter.' });
    }

    if (!languageMap[language]) {
      return res.status(400).json({ success: false, error: `Unsupported language: ${language}. Supported: ${Object.keys(languageMap).join(', ')}` });
    }

    const result = await executeCode(code, language, input || '');
    
    const payload = {
      output: result.stdout || '',
      error: result.stderr || result.compile_output || '',
      status: result.status?.description || 'Unknown',
      time: result.time,
      memory: result.memory,
    };

    if (roomId) {
      io.to(roomId).emit('code_executed', payload);
    }
    
    res.json({ success: true, ...payload });
  } catch (err) {
    console.error('Execution error:', err);
    res.status(500).json({ success: false, error: err.message || 'Execution failed' });
  }
});

// Add a test endpoint to check if server is working
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Server is working', supportedLanguages: Object.keys(languageMap) });
});

io.on('connection', (socket) => {
  socket.on('join', ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    if (!roomCodeState[roomId]) {
      roomCodeState[roomId] = {
        code: '// Default starter code\nconsole.log("Hello World!");',
        language: 'javascript',
        input: '',
      };
    }

    socket.emit('room_state', roomCodeState[roomId]);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit('joined', { clients, username, socketId: socket.id });
    });
  });

  socket.on('code_change', ({ roomId, code }) => {
    if (roomCodeState[roomId]) {
      roomCodeState[roomId].code = code;
      socket.to(roomId).emit('code_changed', { code });
    }
  });

  socket.on('language_change', ({ roomId, language }) => {
    if (roomCodeState[roomId]) {
      roomCodeState[roomId].language = language;
      socket.to(roomId).emit('language_changed', { language });
    }
  });

  socket.on('input_change', ({ roomId, input }) => {
    if (roomCodeState[roomId]) {
      roomCodeState[roomId].input = input;
      socket.to(roomId).emit('input_changed', { input });
    }
  });

  socket.on('execute_code', async ({ roomId, code, language, input }) => {
    console.log('Socket execute_code received:', { roomId, language, codeLength: code?.length });
    
    io.to(roomId).emit('execution_started');
    try {
      const result = await executeCode(code, language, input);
      io.to(roomId).emit('code_executed', {
        output: result.stdout || '',
        error: result.stderr || result.compile_output || '',
        status: result.status?.description || 'Unknown',
        time: result.time,
        memory: result.memory,
      });
    } catch (error) {
      console.error('Socket execution error:', error);
      io.to(roomId).emit('code_executed', {
        output: '',
        error: error.message || 'Execution error',
        status: 'Error',
        time: null,
        memory: null,
      });
    }
  });

  socket.on('disconnect', () => {
    const username = userSocketMap[socket.id];
    delete userSocketMap[socket.id];
    const rooms = Array.from(socket.rooms);
    rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        const clients = getAllConnectedClients(roomId);
        socket.to(roomId).emit('user_left', { clients, username, socketId: socket.id });
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Key configured: ${RAPIDAPI_KEY ? 'YES' : 'NO'}`);
});

// const JUDGE0_API_URL = '3a012748demsh0ba621e26d69d0fp15011cjsnd72c5c9f7a89';
