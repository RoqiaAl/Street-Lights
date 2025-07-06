const controlProfile = require("../models/controleProfileSetting");
const StreetLight = require("../models/streetLightModel");
const { determinePowerStatus } = require("../controllers/utilities");
const moment = require("moment");
const cron = require("node-cron"); //library that allows the server to run background tasks periodically

const { getIO } = require("./utilities"); // to import the io instance

//mock function for req to call Fun. changeBrightness in the background task
const mockReq = (id, brightness) => ({
  params: { id },
  body: { brightness },
});
//mock function for res to call Fun. changeBrightness in the background task
const mockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.data = data;
    return res;
  };
  return res;
};

//run every minute to manage streetlights based on their controlProfiles
//and attr. 'applyControlSetting'and synchronize with the external API.
cron.schedule("* * * * *", async () => {
  applyControlProfileSettings();
});

async function applyControlProfileSettings() {
  try {
    const profiles = await controlProfile.find();
    console.log("control profiles checkup at:", moment.utc());
    for (const profile of profiles) {
      //variables to determine if power status and brightnes need to change
      const brightnessLevel = determinePowerStatus(profile.dateTimes);
      const ScheduledToBeOn = Boolean(brightnessLevel > 0);
      const isPoweredON = Boolean(profile.isPoweredON);
      const chosenStreetlight = await StreetLight.findById(
        profile.streetLightId
      ); //CHANGE IF HEND CORRECTED CONNECTION CONTROLPROGILE WITH CONTROLNODE
      if (!chosenStreetlight) {
        console.warn(`Streetlight not found for ID: ${profile.streetLightId}`);
        continue; // Skip this profile if the streetlight is missing
      }

      const ApplyProfileSetting = Boolean(
        chosenStreetlight.ApplyProfileSetting
      );
      console.log(
        "In profile:",
        profile._id,
        " its stretlight have ApplyProfileSetting as: ",
        ApplyProfileSetting
      );
      //check if streetlight should apply the settings from a schedule "controlProfile"
      // and if the status 'isPoweredOn' or 'BrightnessLevel' different from controlProfile settings
      const shouldChangePowerStatus = isPoweredON !== ScheduledToBeOn;
      const shouldChangeBrightness =
        brightnessLevel !== chosenStreetlight.BrightnessLevel;

      if (
        ApplyProfileSetting === true &&
        (shouldChangePowerStatus || shouldChangeBrightness)
      ) {
        //update in database
        profile.isPoweredON = ScheduledToBeOn;
        try {
          await profile.save();
        } catch (error) {
          console.error("Error saving profile:", error);
        }
        // Update brightness attr. in TVILIGHT API and in streetlight class
        const req = mockReq(profile.streetLightId, brightnessLevel);
        const res = mockRes();
        try {
          const {
            changeBrightness,
          } = require("../controllers/light.controller");
          await changeBrightness(req, res);
        } catch (error) {
          console.error(
            "Error updating brightness using Fun. changeBrightness:",
            error
          );
        }
      }
    }
    console.log("Schedules checked and statuses updated.");
    // Emit the update event
    const io = getIO();
    io.emit("dataUpdated", { message: "Database updated" });
  } catch (err) {
    console.error("Error in cron job:", err);
  }
}

module.exports = { applyControlProfileSettings };
