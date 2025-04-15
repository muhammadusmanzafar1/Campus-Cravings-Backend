const app = require("./app");
const connectDB = require("./config/db");
global.ApiError = require('./utils/ApiError');

const PORT = process.env.PORT || 5000;

connectDB();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
