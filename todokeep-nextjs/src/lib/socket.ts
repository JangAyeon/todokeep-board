import { io } from "socket.io-client";

console.log("SOCKET_URL", process.env.NEXT_PUBLIC_SOCKET_URL);
const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  path: "/socket.io", // default, change only if backend uses different path
  reconnection: true,
  reconnectionAttempts: Infinity,
  randomizationFactor: 0.5,
  transports: ["websocket", "polling"], // polling 추가 (중요!)
});

export default socket;
