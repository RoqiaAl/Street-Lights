const mongoose = require("mongoose");
// const {
//   applyControlProfileSettings,
// } = require("../controllers/controlProfileController");

const controlProfileSchema = new mongoose.Schema({
  //refernces the streetlight connected to
  streetLightId: {
    type: mongoose.Schema.ObjectId,
    ref: "StreetLight",
  },
  //array of scheduled brightness settings for specific time intervals
  dateTimes: [
    {
      startDateTime: {
        type: Date,
      },
      endDateTime: {
        type: Date,
      },
      BrightnessLevel: {
        type: Number,
        required: [true, "A Light must have brightness"],
        default: 0,
      },
    },
  ],
  //current operational state
  isPoweredON: {
    type: Boolean,
    default: false,
  },
});

//before it's saved: enforce consistency between `isPoweredON` and `dateTimes` brightness levels
controlProfileSchema.pre("save", function (next) {
  if (!this.isPoweredON) {
    // Set all brightnessLevel values to 0 if isPoweredON is false
    this.dateTimes.forEach((dateTime) => {
      dateTime.brightnessLevel = 0;
    });
  } else {
    // Check if all brightnessLevel values are 0, then set isPoweredON to false
    const allBrightnessZero = this.dateTimes.every(
      (dateTime) => dateTime.brightnessLevel === 0
    );
    if (allBrightnessZero) {
      this.isPoweredON = false;
    }
  }
  next();
});
// controlProfileSchema.pre("findOneAndUpdate", function (next) {
//   applyControlProfileSettings();
//   next();
// });

//creating a model for ControlProfile collection
module.exports = mongoose.model("controlProfile", controlProfileSchema);
