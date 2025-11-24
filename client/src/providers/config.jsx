const config = {
    api: "http://localhost:3000",
    socket: "localhost:3001"
};

const api_url = (config.api || "");
const socket_url = (config.socket || "/");

export { api_url, socket_url };