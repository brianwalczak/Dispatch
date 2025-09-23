const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const { DateTime } = require('luxon');
const crypto = require('crypto');
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
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (process.env?.CORS_SOCKET_ORIGIN && process.env.CORS_SOCKET_ORIGIN !== 'false' ? process.env.CORS_SOCKET_ORIGIN : '*'),
    methods: ["GET", "POST"],
    credentials: true
  }
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOSTNAME,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});

app.use(cors({
  origin: (process.env?.CORS_ORIGIN && process.env.CORS_ORIGIN !== 'false' ? process.env.CORS_ORIGIN : '*'),
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function createToken(userId, method, ttl = null) {
  try {
    const token = await prisma.userToken.create({
      data: {
        userId: userId,
        token: crypto.randomBytes(64).toString("hex"),
        method: method,
        expiresAt: ttl ? DateTime.utc().plus(ttl).toJSDate() : null
      }
    });

    return (token?.token) ?? new Error("Could not create token.");
  } catch {
    return new Error("Could not create token.");
  }
}

async function verifyToken(token, method) {
  try {
    const valid = await prisma.userToken.findFirst({
      where: {
        token: token,
        method: method
      }
    });

    if (valid?.expiresAt && DateTime.utc() > DateTime.fromJSDate(valid.expiresAt)) {
      await prisma.userToken.delete({ where: { token: valid.token } });
      return false;
    }

    return valid ?? false;
  } catch {
    return false;
  }
}

// -- Authentication Routes -- //
app.post('/api/auth/sign_in', async (req, res) => {
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

    const token = await createToken(user.id, "auth", { days: 7 }); // Auth tokens expire in 7 days
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

app.post('/api/auth/sign_up', async (req, res) => {
  let { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: "Your request was malformed. Please try again." });
  }

  name = name?.trim();
  email = email?.trim().toLowerCase();

  // Name validation
  if (!name || name.length < 5 || name.length > 100) {
    return res.status(400).json({ success: false, error: "Your full name must be between 5 and 100 characters long." });
  } else if (!name.match(/^[a-zA-Z\s'-]+$/)) {
    return res.status(400).json({ success: false, error: "Your full name contains invalid characters." });
  } else if (!name.includes(' ')) {
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

    const token = await createToken(user.id, "auth", { days: 7 }); // Auth tokens expire in 7 days
    res.json({ success: true, token });
  } catch (err) {
    if (err.code === 'P2002') { // Prisma unique constraint failed
      return res.status(400).json({ error: "It looks like your email is already registered." });
    }

    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

app.post('/api/auth/reset_password', async (req, res) => {
  // check if there's a token parameter
  if (req.body?.reset_token && req.body?.password) {
    const { reset_token, password } = req.body;

    try {
      // Check if token is valid and payload is for reset
      const valid = await verifyToken(reset_token, "reset");
      if (!valid) {
        return res.status(400).json({ error: "Your password reset link is invalid. Please request a new one." });
      }

      // Check if user exists with that email
      const user = await prisma.user.findUnique({ where: { id: valid.userId } });
      if (!user) {
        return res.status(400).json({ error: "Your password reset link is invalid. Please request a new one." });
      }

      // Password validation
      if (password.length < 8 || password.length > 256) {
        return res.status(400).json({ success: false, error: "Your password must be between 8 and 256 characters long." });
      }

      // Update the user's password
      const hash = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: valid.userId },
        data: { hash }
      });

      // Delete the token to prevent re-use
      await prisma.userToken.delete({ where: { token: valid.token } });

      res.json({ success: true });
    } catch (err) {
      return res.status(400).json({ error: "Your password reset link is invalid. Please request a new one." });
    }
  } else {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Your request was malformed. Please try again." });
    }

    email = email?.trim().toLowerCase();
    res.json({ success: true });

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return;

      const token = await createToken(user.id, "reset", { minutes: 15 }); // Reset tokens expire in 15 minutes
      const url = process.env.SERVER_DOMAIN ? `${process.env.SERVER_DOMAIN}/auth/reset_password?token=${token}` : `http://localhost:${PORT}/auth/reset_password?token=${token}`;

      await transporter.sendMail({
        from: `"Dispatch" <${process.env.SMTP_USERNAME}>`,
        to: email,
        subject: "Password Reset Request",
        text: `Hello ${user.name.split(" ")[0]},\n\nYou've recently requested a password reset for your Dispatch account. To finish resetting your password, please use the following link: ${url}\nIf you didn't make this request, you may discard this email.\n\nThanks for using Dispatch.`
      });
    } catch { };
  }
});

// -- Create Routes -- //
app.post('/api/workspaces/new', async (req, res) => {
  let { name, description, token } = req.body;

  if (!name || !description || !token) {
    return res.status(400).json({ success: false, error: "Your request was malformed. Please try again." });
  }

  name = name?.trim();
  description = description?.trim();

  // Name validation
  if (name.length < 5 || name.length > 100) {
    return res.status(400).json({ success: false, error: "Your workspace name must be between 5 and 100 characters long." });
  }

  // Description validation
  if (description.length < 5 || description.length > 256) {
    return res.status(400).json({ success: false, error: "Your workspace description must be between 5 and 256 characters long." });
  }

  try {
    // Token validation
    const valid = await verifyToken(token, "auth");
    if (!valid) {
      return res.status(401).json({ error: "It looks like you've been logged out. Please sign in again." });
    }

    // Create the workspace in the database
    const workspace = await prisma.team.create({
      data: {
        name,
        description,
        users: {
          connect: [{ id: valid.userId }]
        }
      }
    });

    if (!workspace) {
      return res.status(500).json({ error: "Internal server error. Please try again later." });
    }

    res.json({ success: true, data: workspace });
  } catch (err) {
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

// -- User Data Routes -- //
app.post('/api/user/me', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, error: "Your request was malformed. Please try again." });
  }

  try {
    // Token validation
    const valid = await verifyToken(token, "auth");
    if (!valid || !valid.userId) {
      return res.status(401).json({ error: "It looks like you've been logged out. Please sign in again." });
    }

    // Fetch the user data from Prisma
    const user = await prisma.user.findUnique({
      where: { id: valid.userId },
      include: { teams: true } // basic teams data
    });
    if (!user) return res.status(401).json({ error: "It looks like you've been logged out. Please sign in again." });
    delete user.hash; // Remove the hash before sending the user object

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

// -- Sessions/Messages Routes -- //
app.post('/api/sessions/:team', async (req, res) => {
  const { token } = req.body;

  if (!token || !req.params?.team) {
    return res.status(400).json({ success: false, error: "Your request was malformed. Please try again." });
  }

  try {
    // Token validation
    const valid = await verifyToken(token, "auth");
    if (!valid || !valid.userId) {
      return res.status(401).json({ error: "It looks like you've been logged out. Please sign in again." });
    }

    // Get the data for the session
    let sessions = await prisma.session.findMany({
      where: {
        team: {
          id: req.params.team, // session belongs to the team
          users: { some: { id: valid.userId } } // user is part of the team
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' }, // newest messages first
          take: 1 // only get the latest message for preview
        }
      },
      orderBy: { createdAt: 'desc' } // newest sessions first
    });
    if (!sessions) sessions = [];

    const safeSessions = sessions.map(({ token, messages, ...session }) => ({
      ...session,
      latestMessage: messages[0] || null
    }));

    res.json({ success: true, data: safeSessions });
  } catch (err) {
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

app.post('/api/session/:session', async (req, res) => {
  const { token } = req.body;

  if (!token || !req.params?.session) {
    return res.status(400).json({ success: false, error: "Your request was malformed. Please try again." });
  }

  try {
    // Token validation
    const valid = await verifyToken(token, "auth");
    if (!valid || !valid.userId) {
      return res.status(401).json({ error: "It looks like you've been logged out. Please sign in again." });
    }

    // Get the data for the session
    let session = await prisma.session.findFirst({
      where: {
        id: req.params.session, // find session based on id
        team: {
          users: { some: { id: valid.userId } } // user is part of the team
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }, // newest messages last (in list)
          include: { sender: { select: { id: true, name: true } } }
        }
      }
    });
    if (!session) return res.status(404).json({ error: "We couldn't find this session. It may have been deleted." });
    delete session.token; // Remove the token before sending the session object

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

const dashboard = path.join(__dirname, 'client', 'dist');

server.listen(PORT, () => {
  console.log(`${chalk.green('[SERVER]')} Server is running on http://localhost:${PORT}`);

  // remove expired tokens every 10 minutes
  setInterval(async () => {
    try {
      await prisma.userToken.deleteMany({
        where: {
          expiresAt: { lt: DateTime.utc().toJSDate() }
        }
      });
    } catch { };
  }, 10 * 60 * 1000);

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