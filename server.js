const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');


// dot config
dotenv.config();


// mongodb connection
connectDB();

// rest objects
const app = express();

//middlewares
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));



//ROUTES
// 1 Test Routes
app.use('/api/v1/test', require("./routes/testRoutes"));
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/inventory', require('./routes/inventoryRoutes'));
app.use('/api/v1/analytics', require('./routes/analyticsRoutes'));
app.use('/api/v1/admin', require('./routes/adminRoutes'));

// STATIC FOLDER
app.use(express.static(path.join(__dirname, './client/build')));

// STATIC ROUTEs
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, './client/build/index.html'));
})

// port
const PORT = process.env.PORT || 8080;

// listen
app.listen(PORT, () => {
    console.log(`Node server running in ${process.env.DEV_MODE} mode on PORT ${process.env.PORT}`);
});