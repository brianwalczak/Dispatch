<h1 align="center">Dispatch - Connect with your customers instantly.</h1>
<p align="center">A fast, reliable live chat solution for your website to make customer support effortless.</p>

> [!WARNING]
> **This project is currently in its beta state as I gather user feedback. The backend is still under construction! If you encounter any issues, please report them <a href='https://github.com/BrianWalczak/Dispatch/issues'>here</a> :)**

## Features
- (💬) Chat with website visitors in real-time. Each team can handle multiple sessions simultaneously.
- (👥) Invite multiple members to your team so everyone can respond to chats and keep conversations organized.
- (⚡) Add Dispatch to your website with a single JavaScript snippet - set up live chat instantly.
- (🖥️) Optimized web interface for both desktop devices.
- (👤) Open-source under Apache 2.0 license - contribute or view it anytime.

## Getting Started

1. **Create an Account**  
   Sign up for a free Dispatch account. Your account lets you create and manage teams, track chat sessions, and invite other members.

2. **Create Your Team**  
   Once logged in, set up a team for your website. Each team can have multiple members to manage chats together.

3. **Install the Chat Widget**  
   Copy the provided JavaScript snippet into your website's code. Dispatch will instantly start handling live chat sessions with your visitors.

4. **Start Chatting**  
   Open your Dispatch dashboard to see active sessions, respond to messages, and manage conversations in real-time.

## Self-Hosting
> [!NOTE]
> **Self-hosting is optional and intended for developers or advanced users who want more control. Most users won't need to self-host.**

Prefer to host your own Dispatch instance? Dispatch is open-source under the Apache 2.0 license, and is easy to set up on your own server.

To start, you can download this repository by using the following:
```bash
git clone https://github.com/BrianWalczak/Dispatch.git
cd Dispatch
```

Before you continue, make sure that Node.js is properly installed (run `node --version` to check if it exists). If you don't have it installed yet, you can download it [here](https://nodejs.org/en/download).

Next, install the required dependencies and start the server (port 3000):
```bash
npm install
node .
```

The React + Vite frontend is located in the client folder. To launch a live development server:
```bash
cd client
npm install
npm run dev
```

By default, Vite will start the frontend on `http://localhost:5173`, and it will communicate with the backend on port 3000.

## Contributions

If you'd like to contribute to this project, please create a pull request [here](https://github.com/BrianWalczak/Dispatch/pulls). You can submit your feedback or any bugs that you find on the <a href='https://github.com/BrianWalczak/Dispatch/issues'>issues page</a>. Contributions are highly appreciated and will help us keep this project up-to-date!
