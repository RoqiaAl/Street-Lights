const express = require("express");
const controlNodeController = require("../controllers/controlNodeController");

const controlNodeRouter = express.Router();

controlNodeRouter
  .route("/TVILIGHT/brightness/:id")
  .patch(controlNodeController.changeBrightnessAPI);

controlNodeRouter
  .route("/controlNode/create")
  .post(controlNodeController.createControlNode);

module.exports = controlNodeRouter;
