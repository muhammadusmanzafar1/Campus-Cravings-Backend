const { Server } = require('socket.io');
const connectionHandler = require('./connectionHandler');
const { validateSocketAuth } = require('./middlewares/socketAuth');
const socketService = require('./service/socketService');

const allowedOrigins = [
  'https://restaurantmanager.campuscravings.co',
  'http://localhost:5173' // React dev (optional)
  // DO NOT include mobile — no origin will be sent
];

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Initialize socket io instance
  socketService.init(io);

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      const { user, session } = await validateSocketAuth(token);
      socket.user = user;
      socket.session = session;
      next();
    } catch (err) {
      next(err); // passes error to client via `on("connect_error", ...)`
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    connectionHandler(io, socket);
  });
}

module.exports = { setupSocket };