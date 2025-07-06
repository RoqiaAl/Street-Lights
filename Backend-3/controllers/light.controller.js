const Light = require("../models/streetLightModel");
const ControlProfile = require("../models/controleProfileSetting");
const ControlNode = require("../models/controlNodeModel");
const { changePowerAPI, changeBrightnessAPI } = require("./controlNodeController");
const { determinePowerStatus } = require("./utilities");
const { applyControlProfileSettings } = require("./controlProfileController");

// إنشاء لمبة جديدة
exports.createLight = async (req, res) => {
  try {
    const {
      zone,
      address,
      status,
      isOn,
      applyZoneSetting,
      applyControllingSetting,
      dateTimes,
      location,
      brightness,
    } = req.body;

    if (!zone) {
      return res.status(400).json({
        success: false,
        message: "Please provide zone as well",
      });
    }

    const applyZoneSettings = applyZoneSetting === true;
    const controlSetting = applyControllingSetting === true;
    const BrightnessLevel = isOn ? brightness : 0;

    const newLightData = {
      zone,
      address,
      status,
      isPoweredOn: isOn,
      ApplyZoneSetting: applyZoneSettings,
      ApplyProfileSetting: controlSetting,
      location,
      BrightnessLevel,
    };

    const savedLight = await Light.create(newLightData);

    if (controlSetting && dateTimes) {
      const controlProfileData = {
        streetLightId: savedLight._id,
        dateTimes: dateTimes.map((dt) => ({
          startDateTime: dt.startDateTime,
          endDateTime: dt.endDateTime,
          BrightnessLevel: dt.brightness,
        })),
      };
      await ControlProfile.create(controlProfileData);
    }

    return res.status(201).json({
      success: true,
      data: savedLight,
      message: "Light created successfully",
    });
  } catch (error) {
    console.error("Error creating light:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// تحديث بيانات لمبة
exports.updateLight = async (req, res) => {
  try {
    const { lightId } = req.params;
    const {
      zoneID,
      status,
      applyZoneSetting,
      applyControllingSetting,
      dateTimes,
      isOn,
      brightness,
      location,
    } = req.body;

    const BrightnessLevel = isOn ? brightness : 0;

    const updateData = {
      zoneID,
      status,
      isPoweredOn: isOn,
      ApplyZoneSetting: applyZoneSetting === true,
      ApplyProfileSetting: applyControllingSetting === true,
      BrightnessLevel,
      location,
    };

    const updatedLight = await Light.findOneAndUpdate(
      { _id: lightId },
      updateData,
      { new: true }
    );

    if (!updatedLight) {
      return res.status(404).json({
        success: false,
        message: "Light not found",
      });
    }

    if (applyControllingSetting && dateTimes) {
      await ControlProfile.findOneAndUpdate(
        { streetLightId: lightId },
        {
          isPoweredON: isOn || false,
          dateTimes: dateTimes.map((dt) => ({
            startDateTime: dt.startDateTime,
            endDateTime: dt.endDateTime,
            BrightnessLevel: dt.brightness,
          })),
        },
        { upsert: true, new: true }
      );
      applyControlProfileSettings();
    } else {
      await ControlProfile.findOneAndDelete({ streetLightId: lightId });
    }

    return res.status(200).json({
      success: true,
      message: "Light updated successfully",
      data: updatedLight,
    });
  } catch (error) {
    console.error("Error updating light:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// حذف لمبة
exports.deleteLight = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLight = await Light.findByIdAndDelete(id);
    if (!deletedLight) {
      return res.status(404).json({
        success: false,
        message: "Light not found",
      });
    }

    await ControlProfile.findOneAndDelete({ streetLightId: id });
    await changeBrightnessAPI(id, "0");
    await ControlNode.findOneAndDelete({ streetLightID: id });

    return res.status(200).json({
      success: true,
      message: "Light deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting light:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// جلب جميع اللمبات مع ربط معلومات الزون وملفات التحكم
exports.getAllLights = async (req, res) => {
  try {
    const lights = await Light.aggregate([
      {
        $lookup: {
          from: "zonesettings",
          localField: "zone",
          foreignField: "_id",
          as: "zoneDetails",
        },
      },
      {
        $unwind: {
          path: "$zoneDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "controlprofiles",
          localField: "_id",
          foreignField: "streetLightId",
          as: "dateTimes",
        },
      },
      {
        $addFields: {
          activeDateTime: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$zoneDetails.dateTimes",
                  as: "dateTime",
                  cond: {
                    $and: [
                      { $gte: ["$$dateTime.startDateTime", new Date()] },
                      { $lte: ["$$dateTime.endDateTime", new Date()] },
                    ],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          status: 1,
          lightid: 1,
          location: 1,
          address: 1,
          applyZoneSetting: "$ApplyZoneSetting",
          applyControllingSetting: "$ApplyProfileSetting",
          brightness: "$BrightnessLevel",
          isOn: "$isPoweredOn",
          dateTimes: 1,
          zone: "$zoneDetails.name",
          zoneId: "$zoneDetails._id",
        },
      },
    ]);

    lights.forEach((light) => {
      if (light.applyZoneSetting) {
        light.brightness =
          light.zoneDetails?.isPoweredOn && light.zoneDetails?.BrightnessLevel
            ? light.zoneDetails.BrightnessLevel
            : light.activeDateTime?.BrightnessLevel || light.brightness;
      } else if (light.applyControllingSetting) {
        light.brightness = determinePowerStatus(light.dateTimes);
      }
    });

    return res.status(200).json({
      success: true,
      data: lights,
    });
  } catch (error) {
    console.error("Error fetching lights:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// جلب لمبات تابعة لزون معيّن
exports.getLightsWithZone = async (req, res) => {
  try {
    const { id } = req.params;
    const findLight = await Light.find({ zoneID: id }).populate("zone");
    return res.status(200).json({ success: true, data: findLight });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// تبديل حالة اللمبة
exports.toggleIsPoweredOn = async (req, res) => {
  try {
    const currentstreetlight = await Light.findById(req.params.id);
    if (!currentstreetlight) {
      return res.status(404).json({
        status: "fail",
        message: "Streetlight not found",
      });
    }

    const updatedStreetlight = await Light.findByIdAndUpdate(
      req.params.id,
      {
        isPoweredOn: !currentstreetlight.isPoweredOn,
        BrightnessLevel: currentstreetlight.isPoweredOn ? 0 : 100,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    await changePowerAPI(req.params.id, updatedStreetlight.BrightnessLevel);
    res.status(200).json({
      status: "success",
      data: { streetlight: updatedStreetlight },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

// تغيير مستوى السطوع
exports.changeBrightness = async (req, res) => {
  try {
    const streetlight = await Light.findById(req.params.id);
    if (!streetlight) {
      return res.status(404).json({
        status: "fail",
        message: "Streetlight not found",
      });
    }

    const newBrightness = req.body.brightness;
    const power = newBrightness > 0;

    const updatedStreetlight = await Light.findByIdAndUpdate(
      req.params.id,
      {
        BrightnessLevel: newBrightness,
        isPoweredOn: power,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    await changeBrightnessAPI(req.params.id, newBrightness);

    res.status(200).json({
      status: "success",
      data: {
        BrightnessLevel: newBrightness,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};
