//Handles application configurations and routing
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// Initialize Express
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
const LightRouter = require("./routes/light.route");
const ZoneSetting = require("./routes/zonesetting");
const controlNodeRouter = require("./routes/controlNodeRoutes");
const controlProfileRouter = require("./routes/controlProfileRoutes");
const userRouter = require("./routes/userRoute");

//to allow cross-origin-requests (from browsers on a different origin/domain)
app.use(cors());

//middleware
app.use(express.json()); // Middleware to parse JSON request body
app.use("/api/v1", LightRouter);
app.use("/api/v1", ZoneSetting);
app.use("/api/v1", controlNodeRouter);
app.use("/api/v1", controlProfileRouter);
app.use("/api/v1", userRouter);

module.exports = app;
