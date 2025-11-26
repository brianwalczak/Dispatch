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
const agents = new Map();
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

    // Keep a record of the last opened workspace for new device logins (to know where to leave off)
    let newLastOpenedId = user.lastOpenedId;
    // Update the lastOpenedId with the current workspace if it's different 
    if ((req.body.workspace && req.body.workspace !== user.lastOpenedId) && user.teams.some(t => t.id === req.body.workspace)) {
      newLastOpenedId = req.body.workspace;
      // If there's no lastOpenedId but the user has teams, set it to the first team
    } else if ((!user.lastOpenedId || !user.teams.some(t => t.id === user.lastOpenedId)) && user.teams?.length > 0) {
      newLastOpenedId = user.teams[0].id;
      // If the user has no teams, set lastOpenedId to null
    } else {
      newLastOpenedId = null;
    }

    if (newLastOpenedId !== user.lastOpenedId) {
      await prisma.user.update({
        where: { id: valid.userId },
        data: { lastOpenedId: newLastOpenedId }
      });

      user.lastOpenedId = newLastOpenedId;
    }

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

app.post('/api/workspaces/:team', async (req, res) => {
  const { token } = req.body;
  const { team } = req.params;

  if (!token || !team) {
    return res.status(400).json({ success: false, error: "Your request was malformed. Please try again." });
  }

  try {
    // Token validation
    const valid = await verifyToken(token, "auth");
    if (!valid || !valid.userId) {
      return res.status(401).json({ error: "It looks like you've been logged out. Please sign in again." });
    }

    // Fetch the workspace data
    const workspace = await prisma.team.findFirst({
      where: {
        id: team, // find workspace based on id
        users: {
          some: { id: valid.userId } // user is part of the team
        }
      },
      include: { users: true } // include users in the workspace
    });
    if (!workspace) return res.status(404).json({ error: "We couldn't find this workspace. It may no longer exist." });

    const teamMap = agents.get(team);
    workspace.users = workspace.users.map(({ hash, ...user }) => ({ // remove hash from user object
      ...user,
      online: !!(teamMap && teamMap.has(user.id) && teamMap.get(user.id)?.size > 0) // check if user is online
    }));

    res.json({ success: true, data: workspace });
  } catch (err) {
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

app.delete('/api/workspaces/:team/users/:user', async (req, res) => {
  const { token } = req.body;
  const { team, user: userId } = req.params;

  if (!token || !team || !userId) {
    return res.status(400).json({ success: false, error: "Your request was malformed. Please try again." });
  }

  try {
    // Token validation
    const valid = await verifyToken(token, "auth");
    if (!valid || !valid.userId) {
      return res.status(401).json({ error: "It looks like you've been logged out. Please sign in again." });
    }

    // Check if the user is part of the team
    const workspace = await prisma.team.findFirst({
      where: {
        id: team, // find workspace based on id
        users: {
          some: { id: valid.userId } // user is part of the team
        }
      },
      include: { users: true } // include users in the workspace
    });
    if (!workspace) return res.status(404).json({ error: "We couldn't find this workspace. It may no longer exist." });
    if (!workspace.users.some(u => u.id === userId)) { // user to be removed is part of the team
      return res.status(404).json({ error: "We couldn't find this user in your workspace. They may have already been removed." });
    }

    // Remove the user from the team
    await prisma.team.update({
      where: { id: team },
      data: {
        users: { disconnect: { id: userId } }
      }
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

// -- Invite Routes -- //
app.post('/api/invites', async (req, res) => {
  const { token, teamId } = req.body;

  if (!token || !teamId) {
    return res.status(400).json({ success: false, error: "Your request was malformed. Please try again." });
  }

  try {
    // Token validation
    const valid = await verifyToken(token, "auth");
    if (!valid || !valid.userId) {
      return res.status(401).json({ error: "It looks like you've been logged out. Please sign in again." });
    }

    // Check if the user is part of the team
    const workspace = await prisma.team.findFirst({
      where: {
        id: teamId,
        users: {
          some: { id: valid.userId }
        }
      }
    });

    if (!workspace) return res.status(404).json({ error: "We couldn't find this workspace. It may no longer exist." });

    // Get all invites for the team
    const invites = await prisma.teamInvite.findMany({
      where: { teamId },
      select: {
        id: true,
        email: true,
        expiresAt: true
      }
    });

    res.json({ success: true, data: invites });
  } catch (err) {
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

app.post('/api/invites/new', async (req, res) => {
  const { token, teamId, email } = req.body;

  if (!token || !teamId || !email) {
    return res.status(400).json({ success: false, error: "Your request was malformed. Please try again." });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.match(emailRegex) || email.length > 255) {
    return res.status(400).json({ success: false, error: "Please provide a valid email address." });
  }

  try {
    // Token validation
    const valid = await verifyToken(token, "auth");
    if (!valid || !valid.userId) {
      return res.status(401).json({ error: "It looks like you've been logged out. Please sign in again." });
    }

    // Check if the user is part of the team
    const workspace = await prisma.team.findFirst({
      where: {
        id: teamId, // find workspace based on id
        users: {
          some: { id: valid.userId } // user is part of the team
        }
      },
      include: { users: true } // include users in the workspace
    });

    if (!workspace) return res.status(404).json({ error: "We couldn't find this workspace. It may no longer exist." });
    if (workspace.users.some(u => u.email === email.toLowerCase())) { // user to be added is already part of the team
      return res.status(404).json({ error: "It looks like this user is already in your workspace." });
    }

    // Create the invite
    const invite = await prisma.teamInvite.create({
      data: {
        email: email.toLowerCase(),
        token: crypto.randomBytes(64).toString("hex"),
        expiresAt: DateTime.utc().plus({ days: 7 }).toJSDate(),
        teamId: teamId
      }
    });
    
    res.json({ success: true, id: invite.id });

    try {
      const url = process.env.SERVER_DOMAIN ? `${process.env.SERVER_DOMAIN}/invites/${invite.id}/?token=${invite.token}` : `http://localhost:${PORT}/invites/${invite.id}/?token=${invite.token}`;

      await transporter.sendMail({
        from: `"Dispatch" <${process.env.SMTP_USERNAME}>`,
        to: email,
        subject: `You've been invited to ${workspace.name} on Dispatch.`,
        text: `Hello there,\n\nYou've been invited to join the workspace "${workspace.name}" on Dispatch. To accept the invite and join the team, please use the following link: ${url}\nThis invite will expire in 7 days.\n\nThanks for using Dispatch.`
      });
    } catch { };
  } catch (err) {
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

app.post('/api/invites/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, error: "Your request was malformed. Please try again." });
  }

  try {
    // Find the invite
    const invite = await prisma.teamInvite.findUnique({
      where: { id },
      include: { team: true }
    });

    // Check if invite exists
    if (!invite) {
      return res.status(404).json({ error: "Whoops, your invite is no longer valid or has already been accepted." });
    }

    // Check if invite has expired
    if (DateTime.utc() > DateTime.fromJSDate(invite.expiresAt)) {
      await prisma.teamInvite.delete({ where: { id } }); // clean up expired invite
      return res.status(400).json({ error: "Sorry, your invite has already expired. Please request a new one from the workspace owner." });
    }

    // Ensure the workspace still exists
    if (!invite.team) {
      await prisma.teamInvite.delete({ where: { id } }); // clean up invite with no workspace
      return res.status(404).json({ error: "Whoops, it looks like the workspace for this invite no longer exists." });
    }

    // Check if a user exists with the invite email
    const user = await prisma.user.findUnique({
      where: { email: invite.email }
    });

    res.json({ success: true, data: { email: invite.email, isUser: !!user, expiresAt: invite.expiresAt, team: {
      // only include necessary info to prevent extra data leak, that'd suck lol
      name: invite.team.name,
      description: invite.team.description
    }}});
  } catch (err) {
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

app.delete('/api/invites/:id', async (req, res) => {
  const { token } = req.body;
  const { id } = req.params;

  if (!token || !id) {
    return res.status(400).json({ success: false, error: "Your request was malformed. Please try again." });
  }

  try {
    // Token validation
    const valid = await verifyToken(token, "auth");
    if (!valid || !valid.userId) {
      return res.status(401).json({ error: "It looks like you've been logged out. Please sign in again." });
    }

    // Find the invite
    const invite = await prisma.teamInvite.findUnique({
      where: { id }
    });

    if (!invite) {
      return res.json({ success: true }); // invite already doesn't exist, so consider it deleted
    }

    // Check if the user is part of the team
    const workspace = await prisma.team.findFirst({
      where: {
        id: invite.teamId, // find workspace based on id
        users: {
          some: { id: valid.userId } // user is part of the team
        }
      }
    });

    if (!workspace) return res.status(404).json({ error: "We couldn't find this workspace. It may no longer exist." });
    await prisma.teamInvite.delete({ where: { id } });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

app.post('/api/invites/:id/accept', async (req, res) => {
  const { token } = req.body;
  const { id } = req.params;
  const { token: inviteToken } = req.query;

  if (!token || !id || !inviteToken) {
    return res.status(400).json({ success: false, error: "Your request was malformed. Please try again." });
  }

  try {
    // Token validation
    const valid = await verifyToken(token, "auth");
    if (!valid || !valid.userId) {
      return res.status(401).json({ error: "It looks like you've been logged out. Please sign in again." });
    }

    // Find the invite
    const invite = await prisma.teamInvite.findUnique({
      where: { id, token: inviteToken },
      include: { team: true }
    });

    // Check if invite exists
    if (!invite) {
      return res.status(404).json({ error: "Whoops, your invite is no longer valid or has already been accepted." });
    }

    // Check if invite has expired
    if (DateTime.utc() > DateTime.fromJSDate(invite.expiresAt)) {
      await prisma.teamInvite.delete({ where: { id } }); // clean up expired invite
      return res.status(400).json({ error: "Sorry, your invite has already expired. Please request a new one from the workspace owner." });
    }

    // Ensure the workspace still exists
    if (!invite.team) {
      await prisma.teamInvite.delete({ where: { id } }); // clean up invite with no workspace
      return res.status(404).json({ error: "Whoops, it looks like the workspace for this invite no longer exists." });
    }

    // Find the user accepting the invite
    const user = await prisma.user.findFirst({
      where: {
        id: valid.userId
      },
      include: { teams: true }
    });

    if (!user) {
      return res.status(401).json({ error: "It looks like you've been logged out. Please sign in again." });
    }

    // Check if the email on the invite matches the user's email
    if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
      return res.status(400).json({ error: "You are unable to accept this invite under your current email address." });
    }

    // Ensure the user is not already a member
    if (user.teams.some(t => t.id === invite.teamId)) {
      return res.json({ success: true, id: invite.teamId }); // just return success if already a member
    }

    // Add user to team and delete the invite
    await prisma.team.update({
      where: { id: invite.teamId },
      data: {
        users: {
          connect: { id: valid.userId }
        }
      }
    });

    // delete all invites for this email and team (in-case multiple were sent)
    await prisma.teamInvite.deleteMany({ where: { email: invite.email, teamId: invite.teamId } });
    res.json({ success: true, id: invite.teamId });
  } catch (err) {
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

// -- Sessions/Messages Routes -- //
app.post('/api/sessions/create', async (req, res) => {
  // this is visitors only, so we're assuming this is a new visitor
  const { teamId } = req.body;

  if (!teamId) {
    return res.status(400).json({ success: false, error: "Your request was malformed. Please try again." });
  }

  try {
    // Check if the team exists before creating a session
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) return res.status(404).json({ error: "It looks like this site developer hasn't setup live chat yet." });

    // Create the new session
    const session = await prisma.session.create({
      data: { token: crypto.randomBytes(64).toString("hex"), teamId },
      include: { messages: true }
    });

    res.json({ success: true, data: session });

    // Send an event to all agents in the team about the new session
    const { token, messages, ...safeSession } = session;
    io.to(`team_${teamId}`).emit("new_session", {
      ...safeSession,
      latestMessage: messages[0] || null
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

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
  const { type, token } = req.body;

  if (!type || !token || !req.params?.session || (type !== 'agent' && type !== 'visitor')) {
    return res.status(400).json({ success: false, error: "Your request was malformed. Please try again." });
  }

  try {
    let session;

    if (type === 'agent') {
      // Token validation
      const valid = await verifyToken(token, "auth");
      if (!valid || !valid.userId) {
        return res.status(401).json({ error: "It looks like you've been logged out. Please sign in again." });
      }

      // Mark all messages as read up to this point (doesn't matter if session is invalid since it'll simply do nothing)
      await prisma.message.updateMany({
        where: {
          sessionId: req.params.session, // find session based on id
          senderId: null, // all the messages sent by visitor
          read: false,
          session: {
            team: {
              users: { some: { id: valid.userId } } // user is part of the team
            }
          }
        },
        data: { read: true } // mark them as read
      });

      // Get the data for the session
      session = await prisma.session.findFirst({
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

      io.to(`visitor_${session.id}`).emit("messages_read"); // notify visitor that their messages were read
    } else if (type === 'visitor') {
      // Mark all messages as read up to this point (doesn't matter if session is invalid since it'll simply do nothing)
      await prisma.message.updateMany({
        where: {
          sessionId: req.params.session, // find session based on id
          session: {
            token: token // include secure token for visitors
          },
          senderId: { not: null }, // all the messages sent by agents
          read: false
        },
        data: { read: true } // mark them as read
      });

      // Get the data for the session
      session = await prisma.session.findUnique({
        where: { id: req.params.session, token: token }, // include secure token for visitors
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }, // newest messages last (in list)
            include: { sender: { select: { id: true, name: true } } }
          }
        }
      });

      io.to(`team_${session.teamId}`).emit("messages_read", { id: session.id }); // notify agents that visitor read messages 
    }

    if (!session) return res.status(404).json({ error: "We couldn't find this session. It may have been deleted." });
    delete session.token; // Remove the token before sending the session object

    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

app.patch('/api/session/:session', async (req, res) => {
  const { token, status } = req.body;

  if (!token || !status || !req.params?.session || (status !== 'open' && status !== 'closed' && status !== 'delete')) {
    return res.status(400).json({ success: false, error: "Your request was malformed. Please try again." });
  }

  try {
    // Token validation
    const valid = await verifyToken(token, "auth");
    if (!valid || !valid.userId) {
      return res.status(401).json({ error: "It looks like you've been logged out. Please sign in again." });
    }

    // Find the session to see if it exists
    let session = await prisma.session.findFirst({
      where: {
        id: req.params.session, // find session based on id
        team: {
          users: { some: { id: valid.userId } } // user is part of the team
        }
      }
    });
    if (!session) return res.status(404).json({ error: "We couldn't find this session. It may have been deleted." });
    if (session.status === status) return res.status(400).json({ error: "Whoops! It looks like this session is already updated." });

    if (status === "delete") {
      await prisma.session.delete({ where: { id: session.id } });
      res.json({ success: true });

      // Send an event to agents and the visitor that the session was deleted
      io.to(`team_${session.teamId}`).emit("session_delete", { id: session.id });
      io.to(`visitor_${session.id}`).emit("session_delete", { id: session.id });

      // Disconnect all sockets in the visitor room
      const room = io.sockets.adapter.rooms.get(`visitor_${session.id}`);
      if (room) {
        room.forEach(id => {
          const socket = io.sockets.sockets.get(id);

          if (socket) {
            socket.disconnect(true);
          }
        });
      }
    } else {
      const update = await prisma.session.update({
        where: { id: session.id },
        data: { status, closedAt: status === "closed" ? DateTime.utc().toJSDate() : null }
      });
      delete update.token; // Remove the token before sending the session object
      res.json({ success: true, data: update });

      // Send an event to agents and the visitor that the session was updated
      io.to(`team_${session.teamId}`).emit("session_update", { id: session.id, status: update.status, closedAt: update.closedAt });
      io.to(`visitor_${session.id}`).emit("session_update", { id: session.id, status: update.status, closedAt: update.closedAt });
    }
  } catch (err) {
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

app.post('/api/session/:session/create', async (req, res) => {
  const { type, token, message } = req.body;

  if (!type || !token || !message || !req.params?.session || (type !== 'agent' && type !== 'visitor')) {
    return res.status(400).json({ success: false, error: "Your request was malformed. Please try again." });
  }

  try {
    let session;
    let valid;

    if (type === 'agent') {
      // Token validation
      valid = await verifyToken(token, "auth");
      if (!valid || !valid.userId) {
        return res.status(401).json({ error: "It looks like you've been logged out. Please sign in again." });
      }

      // Get the data for the session
      session = await prisma.session.findFirst({
        where: {
          id: req.params.session, // find session based on id
          team: {
            users: { some: { id: valid.userId } } // user is part of the team
          }
        }
      });
    } else if (type === 'visitor') {
      // Get the data for the session
      session = await prisma.session.findUnique({
        where: { id: req.params.session, token: token } // include secure token for visitors
      });
    }

    if (!session) return res.status(404).json({ error: "We couldn't find this session. It may have been deleted." });
    if (session.status === "closed" && type !== "agent") { // only an agent can add to closed conversations
      return res.status(400).json({ error: "It looks like this conversation has been resolved." });
    }

    // Create the message in the database
    const newMessage = await prisma.message.create({
      data: {
        sessionId: session.id,
        senderId: (type === "agent" ? valid?.userId : null),
        content: message
      },
      include: {
        sender: { select: { id: true, name: true } }
      }
    });

    res.json({ success: true, data: newMessage });

    // Send an event to agents and the visitor about the new message
    io.to(`team_${session.teamId}`).emit("new_message", newMessage);
    io.to(`visitor_${session.id}`).emit("new_message", newMessage);
  } catch (err) {
    res.status(500).json({ error: "Internal server error. Please try again later." });
  }
});

// -- Websocket Handling -- //
io.use(async (socket, next) => {
  try {
    const { type, token } = socket.handshake.auth;
    if (!["agent", "visitor"].includes(type)) return next(new Error("Authentication error: invalid type provided"));
    if (!token) return next(new Error("Authentication error: no token provided"));

    switch (type) {
      case "agent": {
        const { teamId } = socket.handshake.auth;
        if (!teamId) return next(new Error("Authentication error: no team ID provided"));

        const verify = await verifyToken(token, "auth");
        if (!verify) return next(new Error("Authentication error: invalid token"));

        const user = await prisma.user.findUnique({ where: { id: verify.userId }, include: { teams: true } });
        if (!user || !user.teams.some(t => t.id === teamId)) {
          return next(new Error("Authentication error: you do not have access to that team"));
        }

        socket.user = { type: type, id: verify.userId, team: teamId };
        next();
        break;
      }
      case "visitor": {
        const { id } = socket.handshake.auth;
        if (!id) return next(new Error("Authentication error: no visitor ID provided"));

        const session = await prisma.session.findFirst({ where: { id, token } });
        if (!session) return next(new Error("Authentication error: invalid token"));

        socket.user = { type: type, id, team: session.teamId };
        next();
        break;
      }
    }
  } catch (err) {
    next(new Error("An unknown error occurred during authentication."));
  }
});

io.on("connection", (socket) => {
  const { type, id: userId, team: teamId } = socket.user;

  // join room based on type
  if (type === "visitor" && userId) {
    socket.join(`visitor_${userId}`);
  } else if (type === "agent" && teamId) {
    socket.join(`team_${teamId}`);
  }

  // check the count of connected clients
  if (type === "agent" && teamId && userId) {
    // create the team map if it doesn't exist
    if (!agents.has(teamId)) agents.set(teamId, new Map());
    const teamMap = agents.get(teamId);

    // add this agent to the team map with their socket id
    if (!teamMap.has(userId)) teamMap.set(userId, new Set());
    teamMap.get(userId).add(socket.id);

    // emit array of team member ids to their team
    io.to(`team_${teamId}`).emit("members", Array.from(teamMap.keys()));
  }

  socket.on("disconnect", () => {
    if (type === "agent" && teamId && userId) {
      const teamMap = agents.get(teamId);
      if (!teamMap) return;

      const sockets = teamMap.get(userId);
      if (!sockets) return;

      sockets.delete(socket.id); // remove this socket only

      if (sockets.size === 0) {
        teamMap.delete(userId); // remove user entirely if no sockets left
      }

      io.to(`team_${teamId}`).emit("members", Array.from(teamMap.keys())); // emit updated array of online members

      if (teamMap.size === 0) {
        agents.delete(teamId); // remove team entirely if no agents left
      }
    }
  });

  socket.on("messages_read", async (data) => {
    // emit to other party that messages were read
    if (type === "visitor") {
      await prisma.message.updateMany({
        where: {
          sessionId: userId, // find session based on id
          senderId: { not: null }, // all the messages sent by agents
          read: false
        },
        data: { read: true } // mark them as read
      });

      io.to(`team_${teamId}`).emit("messages_read", { id: userId });
    } else if (type === "agent") {
      await prisma.message.updateMany({
        where: {
          sessionId: data?.id, // find session based on id
          senderId: null, // all the messages sent by visitor
          read: false,
          session: {
            team: {
              users: { some: { id: userId } } // user is part of the team
            }
          }
        },
        data: { read: true } // mark them as read
      });

      io.to(`visitor_${data?.id}`).emit("messages_read");
    }
  });
});

const dashboard = path.join(__dirname, 'client', 'dist');

server.listen(PORT, () => {
  console.log(`${chalk.green('[SERVER]')} Server is running on http://localhost:${PORT}`);

  // remove expired tokens/invites every 10 minutes
  setInterval(async () => {
    try {
      await prisma.userToken.deleteMany({
        where: {
          expiresAt: { lt: DateTime.utc().toJSDate() }
        }
      });

      await prisma.teamInvite.deleteMany({
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