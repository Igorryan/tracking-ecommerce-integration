require("dotenv").config();
const { connectDb } = require("./src/models");
const express = require('express');

const cron = require('node-cron');
const microsservice = require('./src/app');

const app = express();
app.use(express.json());
app.listen(process.env.PORT || 3000, () => console.log('Executando microsservice tracking (FLASH & AMEND)'));

connectDb().then(async () => {
  console.log('Banco conectado e cron job iniciado.');
  cron.schedule("0 */1 * * *", async () => {
    microsservice();
    console.log('Executando verificação de horário...');
  });
});



