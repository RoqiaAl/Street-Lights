const mongoose = require("mongoose");

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true, // Ensure zone names are unique
      required: [true, "A zone must have a name"],
    },
    location: {
      type: {
        type: String,
        enum: ["Polygon"], // Only allow "Polygon" as the type
        required: true,
      },
      coordinates: {
        type: [[[Number]]], // Array of arrays of arrays for GeoJSON Polygon
        required: true,
      },
    },
    dateTimes: [
      {
        startDateTime: {
          type: Date,
          required: [true, "A date time entry must have a start date"],
        },
        endDateTime: {
          type: Date,
          required: [true, "A date time entry must have an end date"],
        },
        BrightnessLevel: {
          type: Number,
          required: [true, "A date time entry must have a brightness level"],
          default: 0,
        },
      },
    ],
    BrightnessLevel: {
      type: Number,
      default: 0,
    },
    isPoweredOn: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Pre-save hook to enforce consistency between BrightnessLevel and isPoweredOn
zoneSchema.pre("save", function (next) {
  if (this.BrightnessLevel === 0) {
    this.isPoweredOn = false;
  } else if (!this.isPoweredOn) {
    this.BrightnessLevel = 0;
  }
  next();
});

// Index the location field for geospatial queries
zoneSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("ZoneSetting", zoneSchema);
