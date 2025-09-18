import { io } from "socket.io-client";

const socket = io("http://localhost:5000/notifications");

socket.on("connect", () => {
  console.log("Connected with id:", socket.id);

  const userId = "69ab52ae-d754-4d36-bf60-d93bbecc80af";
  socket.emit("joinRoom", userId);
});

socket.on("notification", (msg) => {
  console.log("New notification:", msg);
});
