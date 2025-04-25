const { Server } = require('socket.io');
const connectionHandler = require('./connectionHandler');
const { validateSocketAuth } = require('./middlewares/socketAuth');
const socketService = require('./service/socketService');

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization']
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