const express = require('express');
const cors = require('cors');
const chalk = require('chalk');
const app = express();

app.use('/api', cors());
require('dotenv').config({ quiet: true });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// place my API routes here

const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => {
  console.log(`${chalk.green('[SERVER]')} Server is running on http://localhost:${PORT}`);
});