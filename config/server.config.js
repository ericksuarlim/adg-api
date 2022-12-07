const express = require ("express");
const cors = require ("cors");

const app = express();
const localhostPort = 5000;

app.use(cors());

app.use(express.json());

exports.app = app;
exports.localhostPort = localhostPort