const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const functions = require('firebase-functions');

require('dotenv').config();

const app = express();

const router = require('./routes/index');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));


const options = {
    origin: ["https://www.ashleytarot.com", "http://ashleytarot.com", "https://ashleytarot.com", "http://www.ashleytarot.com", "http://localhost:5173"],
    credentials: true,
}

app.options("*", cors(options));
app.use(cors(options));

app.use("/", router);

app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500);
})

app.listen(3000);

// exports.api = functions.https.onRequest(app);