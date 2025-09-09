const { PrismaClient } = require('@prisma/client');
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const bcrypt = require("bcryptjs");
const express = require('express');
const cors = require('cors');
const chalk = require('chalk');
const http = require('http');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const app = express();

require('dotenv').config({ quiet: true });
const PORT = process.env.SERVER_PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || require("crypto").randomBytes(64).toString("hex");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || `http://localhost:${PORT}`,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({
  origin: process.env.CORS_ORIGIN || `http://localhost:${PORT}`,
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/api/login', async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Your request was malformed. Please try again." });
  }

  email = email?.trim().toLowerCase();

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Your email address or password is incorrect." });

    const valid = await bcrypt.compare(password, user.hash);
    if (!valid) return res.status(401).json({ error: "Your email address or password is incorrect." });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, data: user });
  } catch (err) {
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

app.post('/api/register', async (req, res) => {
  let { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: "Your request was malformed. Please try again." });
  }

  name = name?.trim();
  email = email?.trim().toLowerCase();

  // Name validation
  if (!name || name.length < 5 || name.length > 100) {
    return res.status(400).json({ success: false, error: "Your full name must be between 5 and 100 characters long." });
  } else if(!name.match(/^[a-zA-Z\s'-]+$/)) {
    return res.status(400).json({ success: false, error: "Your full name contains invalid characters." });
  } else if(!name.includes(' ')) {
    return res.status(400).json({ success: false, error: "Please provide both your first and last name." });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.match(emailRegex) || email.length > 255) {
    return res.status(400).json({ success: false, error: "Please provide a valid email address." });
  }

  // Password validation
  if (password.length < 8 || password.length > 256) {
    return res.status(400).json({ success: false, error: "Your password must be between 8 and 256 characters long." });
  }

  try {
    const hash = await bcrypt.hash(password, 10); // Hash the password

    // Create the user in the database
    const user = await prisma.user.create({
      data: { name, email, hash }
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, data: user });
  } catch (err) {
    if (err.code === 'P2002') { // Prisma unique constraint failed
      return res.status(400).json({ error: "It looks like your email is already registered." });
    }

    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});


const dashboard = path.join(__dirname, 'client', 'dist');

server.listen(PORT, () => {
  console.log(`${chalk.green('[SERVER]')} Server is running on http://localhost:${PORT}`);

  if (fs.existsSync(dashboard) && fs.existsSync(path.join(dashboard, "index.html"))) {
    app.use(express.static(dashboard)); // First serve static files
    app.get('/{*any}', (req, res) => { // Then serve any other paths left
      res.sendFile(path.join(dashboard, "index.html"));
    });

    console.log(`${chalk.green('[SERVER]')} Static files are being served from ${dashboard}.`);
  } else {
    console.error(chalk.yellow('[SERVER]'), 'Static directory not found, dashboard will not be served. Please build the client first.');
  }
});