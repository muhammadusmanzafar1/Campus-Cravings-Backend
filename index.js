const http = require('http');
const app = require("./app");
const connectDB = require("./config/db");
const { setupSocket } = require("./src/sockets/index"); // make sure this path is correct
const startCronJobs = require('./utils/paymentSchedual'); // adjust path if needed
global.ApiError = require('./utils/ApiError');

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);

setupSocket(server);

startCronJobs();
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});