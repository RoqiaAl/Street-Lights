//created to break the dependency cycles (two modules export and import from each other)

// to prevent it between light.controller.js and controlProfileController.js
const moment = require("moment");

//Method to check real-time and determine isPoweredOn based on dateTimes array
function determinePowerStatus(dateTimes) {
  // If dateTimes is null, undefined, or not an array, return default brightness
  if (!Array.isArray(dateTimes) || dateTimes.length === 0) {
    return 0;
  }
  const currentTime = moment.utc(); // Get the current real-time using moment
  // Iterate through the dateTimes array
  for (const dateTime of dateTimes) {
    const start = moment.utc(dateTime.startDateTime); // Parse start time using moment
    const end = moment.utc(dateTime.endDateTime); // Parse end time using moment

    // Check if current time is within the range
    if (currentTime.isBetween(start, end, "[)")) {
      // Return the brightness level if it's greater than 0
      console.log(
        "from within the interval, start:",
        dateTime.startDateTime,
        "end:",
        dateTime.endDateTime
      );
      return dateTime.BrightnessLevel;
    }
  }
  // If no matching time range is found, default to powered off (0 brightness)
  return 0;
}

// to prevent it between server.js and controlProfileController.js

const socketIo = require("socket.io"); //to emit a WebSocket event to notify the frontend
let io;
function init(server) {
  io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000", // Replace this with your frontend's URL
      methods: ["GET", "POST"], // Allowed HTTP methods
      credentials: true, // Allow cookies or authentication tokens
    },
  });
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Client disconnected${socket.id}`);
    });
  });
}

function getIO() {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
}

module.exports = { determinePowerStatus, init, getIO };
