// import modulesconst cors = require("cors");
require('dotenv').config()
const express = require("express")
const cors = require("cors")
const compression = require('compression')
const app = express();

// create REST apiconst app = express();
global.__basedir = __dirname;
var corsOptions = {
  origin: process.env.SERVER_URL
};
const router = require("./routes/index");
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(compression())
app.use('/api',router)
app.listen(process.env.SERVER_PORT, () => {
  console.log(`Running at localhost:${process.env.SERVER_PORT}`);
});