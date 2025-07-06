const ZoneSetting = require("../models/zonesettings");
const Light = require("../models/streetLightModel");

exports.createZoneSetting = async (req, res) => {
  try {
    const { name, triangleCoords, dateTimes, BrightnessLevel, isPoweredOn } =
      req.body;
    console.log("Request body:", req.body);

    // ✅ Validate triangleCoords
    if (
      !triangleCoords ||
      !Array.isArray(triangleCoords) ||
      triangleCoords.length < 3
    ) {
      return res.status(400).json({
        message:
          "Invalid triangle coordinates. At least 3 coordinates are required.",
      });
    }

    // ✅ Validate each coordinate
    for (const coord of triangleCoords) {
      if (typeof coord.lat !== "number" || typeof coord.lng !== "number") {
        return res.status(400).json({
          message:
            "Invalid coordinate format. Each coordinate must have 'lat' and 'lng' as numbers.",
        });
      }
    }

    // ✅ Convert triangleCoords to GeoJSON Polygon format
    const formattedCoords = triangleCoords.map((coord) => [
      coord.lng,
      coord.lat,
    ]);

    // ✅ Ensure the polygon is closed (first and last coordinates must match)
    if (
      formattedCoords[0][0] !==
        formattedCoords[formattedCoords.length - 1][0] ||
      formattedCoords[0][1] !== formattedCoords[formattedCoords.length - 1][1]
    ) {
      formattedCoords.push(formattedCoords[0]); // Close the polygon
    }

    // ✅ Create the GeoJSON Polygon object
    const location = {
      type: "Polygon",
      coordinates: [formattedCoords], // GeoJSON Polygon format
    };

    // ✅ Check if the zone already exists
    const FindZone = await ZoneSetting.findOne({ name });
    if (FindZone) {
      return res
        .status(400)
        .json({ success: false, message: "Zone Already Exist" });
    }

    // ✅ Create new zone setting with the correct GeoJSON Polygon
    const newZoneSetting = await ZoneSetting.create({
      name,
      location, // Correct GeoJSON Polygon format
      dateTimes,
      isPoweredOn,
      BrightnessLevel,
    });

    return res.status(201).json({
      success: true,
      message: "Zone setting created successfully",
      data: newZoneSetting,
    });
  } catch (error) {
    console.error("Error details:", error); // Log the full error
    return res.status(500).json({
      success: false,
      message: "Error creating zone setting",
      error: error.message,
    });
  }
};

exports.getAllZoneSettings = async (req, res) => {
  try {
    const zoneSettings = await ZoneSetting.find();
    return res.status(200).json({
      success: true,
      message: "Zone settings fetched successfully",
      data: zoneSettings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching zone settings",
      error: error.message,
    });
  }
};

exports.getZoneSettingById = async (req, res) => {
  try {
    const zoneSetting = await ZoneSetting.findById(req.params.id);
    if (!zoneSetting) {
      return res.status(404).json({
        message: "Zone setting not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Zone setting fetched successfully",
      data: zoneSetting,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching zone setting",
      error: error.message,
    });
  }
};

exports.updateZoneSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, triangleCoords, dateTimes, BrightnessLevel, isPoweredOn } =
      req.body;

    // ✅ Find the zone by ID
    const zone = await ZoneSetting.findById(id);
    if (!zone) {
      return res
        .status(404)
        .json({ success: false, message: "Zone not found" });
    }

    // ✅ If triangleCoords are provided, update the location
    if (triangleCoords && Array.isArray(triangleCoords)) {
      // Validate triangleCoords
      if (triangleCoords.length < 3) {
        return res.status(400).json({
          message:
            "Invalid triangle coordinates. At least 3 coordinates are required.",
        });
      }

      // Convert triangleCoords to GeoJSON Polygon format
      const formattedCoords = triangleCoords.map((coord) => [
        coord.lng,
        coord.lat,
      ]);

      // Ensure the polygon is closed
      if (
        formattedCoords[0][0] !==
          formattedCoords[formattedCoords.length - 1][0] ||
        formattedCoords[0][1] !== formattedCoords[formattedCoords.length - 1][1]
      ) {
        formattedCoords.push(formattedCoords[0]); // Close the polygon
      }

      // Update the location field
      zone.location = {
        type: "Polygon",
        coordinates: [formattedCoords],
      };
    }

    // ✅ Update other fields if provided
    if (name) zone.name = name;
    if (dateTimes) zone.dateTimes = dateTimes;
    if (BrightnessLevel) zone.BrightnessLevel = BrightnessLevel;
    if (isPoweredOn !== undefined) zone.isPoweredOn = isPoweredOn;

    // ✅ Save the updated zone
    const updatedZone = await zone.save();

    return res.status(200).json({
      success: true,
      message: "Zone updated successfully",
      data: updatedZone,
    });
  } catch (error) {
    console.error("Error details:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating zone setting",
      error: error.message,
    });
  }
};

exports.getZoneInfo = async (req, res) => {
  try {
    const { zoneId } = req.params;

    const zone = await ZoneSetting.findById(zoneId);
    if (!zone) {
      return res.status(404).json({ message: "Zone not found" });
    }

    const lights = await Light.find({ zoneId });

    res.status(200).json({
      success: true,
      data: {
        zone,
        lights,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.deleteZoneSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedZoneSetting = await ZoneSetting.findByIdAndDelete(id);
    if (!deletedZoneSetting) {
      return res.status(404).json({
        message: "Zone setting not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Zone setting deleted successfully",
      data: deletedZoneSetting,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting zone setting",
      error: error.message,
    });
  }
};
