const config = {
    api: null,
    socket: null
};

const api_url = (config.api || "");
const socket_url = (config.socket || "/");

export { api_url, socket_url };