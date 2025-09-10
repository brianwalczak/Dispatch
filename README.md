<h1 align="center">Dispatch - Connect with your customers instantly.</h1>
<p align="center">A fast, reliable live chat solution for your website to make customer support effortless.</p>

> [!WARNING]
> **This project is currently in its beta state as I gather user feedback. The backend is still under construction! If you encounter any issues, please report them <a href='https://github.com/BrianWalczak/Dispatch/issues'>here</a> :)**

## Features
- (💬) Chat with website visitors in real-time. Each team can handle multiple sessions simultaneously.
- (👥) Invite multiple members to your team so everyone can respond to chats and keep conversations organized.
- (⚡) Add Dispatch to your website with a single JavaScript snippet - set up live chat instantly.
- (🖥️) Optimized web interface for desktop devices.
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

> [!WARNING]
> **In order to self-host Dispatch, you'll need to make sure you have a valid `.env` file containing your SMTP configuration; this step is required to send notification emails and request password resets. Additionally, you can configure your server and set the location for your database file here.**
> ```env
> DATABASE_URL="file:./dispatch.db" # Used by Prisma to locate your database file
> SERVER_DOMAIN="https://example.com" # This is used for emails to bring users to the right place
> CORS_ORIGIN="https://example.com" # HTTP requests from all other domains will be blocked (optional)
> CORS_SOCKET_ORIGIN=false # By default, your Socket.IO server can be connected to on other websites (required for chat on external sites to function properly).
> JWT_SECRET="<enter a unique, secure passphrase here>"
> SERVER_PORT=3000
> 
> SMTP_HOSTNAME="mail.xxxxxxxxx.com"
> SMTP_PORT=465
> SMTP_SECURE=true
> 
> SMTP_USERNAME="xxxxx@xxxxxxxxxxxxxxxxxxx.com"
> SMTP_PASSWORD="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
> ```

Prefer to host your own Dispatch instance? Dispatch is open-source under the Apache 2.0 license, and is easy to set up on your own server.

To start, you can download this repository by using the following:
```bash
git clone https://github.com/BrianWalczak/Dispatch.git
cd Dispatch
```

Before you continue, make sure that Node.js is properly installed (run `node --version` to check if it exists). If you don't have it installed yet, you can download it [here](https://nodejs.org/en/download).

Next, install the required dependencies and start the server (port 3000 by default):
```bash
npm install
npm run start
```

**Note:** The source code for the Dispatch home page is located in the app folder. To compile it, use the `npm run static/build` command (it will be saved in `dist/`).

## Contributions

If you'd like to contribute to this project, please create a pull request [here](https://github.com/BrianWalczak/Dispatch/pulls). You can submit your feedback or any bugs that you find on the <a href='https://github.com/BrianWalczak/Dispatch/issues'>issues page</a>. Contributions are highly appreciated and will help us keep this project up-to-date!
