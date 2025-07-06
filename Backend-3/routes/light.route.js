const express = require("express");
const streetLightController = require("../controllers/light.controller");

const lightRouter = express.Router();

lightRouter.post("/light/create", streetLightController.createLight);
lightRouter.delete("/light/delete/:id", streetLightController.deleteLight);
lightRouter.patch("/light/update/:lightId", streetLightController.updateLight);
lightRouter.get("/light/zone/:id", streetLightController.getLightsWithZone);
lightRouter.get("/light/getAll", streetLightController.getAllLights);


lightRouter.route("/power/:id").patch(streetLightController.toggleIsPoweredOn);
lightRouter
  .route("/brightness/:id")
  .patch(streetLightController.changeBrightness);

module.exports = lightRouter;
