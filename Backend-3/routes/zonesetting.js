const express = require("express");
const router = express.Router();
const zoneSettingController = require("../controllers/zonesetting.controller");

router.post("/zone", zoneSettingController.createZoneSetting);
router.get("/zones", zoneSettingController.getAllZoneSettings);
router.get("/zone/:id", zoneSettingController.getZoneSettingById);
router.patch("/zone/:id", zoneSettingController.updateZoneSetting);
router.delete("/zone/:id", zoneSettingController.deleteZoneSetting);
router.get("/zone/info/:zoneId", zoneSettingController.getZoneInfo);

module.exports = router;
