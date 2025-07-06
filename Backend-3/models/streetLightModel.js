const mongoose = require("mongoose");
const { changeBrightnessAPI } = require("../controllers/controlNodeController");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const streetLightSchema = new mongoose.Schema({
  zoneID: {
    type: mongoose.Types.ObjectId,
    ref: "zonesetting",
  },
  status: {
    type: String,
    enum: ["functioning", "malfunctioning"],
    default: "functioning",
  },
  // نجعل lightid رقميًا (Number) ليتولّد تلقائياً
  lightid: {
    type: Number,
    unique: true,
  },
  zone: {
    type: mongoose.Types.ObjectId,
    ref: "zonesetting",
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, "A street light must have coordinates (longitude, latitude)"],
    },
  },
  address: {
    type: String,
  },
  ApplyZoneSetting: {
    type: Boolean,
    default: false,
  },
  ApplyProfileSetting: {
    type: Boolean,
    default: false,
  },
  BrightnessLevel: {
    type: Number,
    default: 0,
  },
  isPoweredOn: {
    type: Boolean,
    default: false,
  },
});


streetLightSchema.plugin(AutoIncrement, { inc_field: "lightid", start_seq: 1 });

// قبل الحفظ: منطق الحالة/السطوع
streetLightSchema.pre("save", async function (next) {
  if (this.BrightnessLevel === 0) {
    this.isPoweredOn = false;
  } else if (!this.isPoweredOn) {
    this.BrightnessLevel = 0;
  }
  next();
});

// قبل التحديث: منطق الحالة/السطوع
streetLightSchema.pre("findOneAndUpdate", async function (next) {
  const updatedData = this.getUpdate() || {};

  // إذا كان الـ BrightnessLevel = 0، أطفئ اللمبة
  if (updatedData.BrightnessLevel === 0) {
    updatedData.isPoweredOn = false;
  }
  // إذا كانت isPoweredOn = false، ضع BrightnessLevel=0
  else if (updatedData.isPoweredOn === false) {
    updatedData.BrightnessLevel = 0;
  }
  this.setUpdate(updatedData);

  // تنسيق السطوع مع الـ API الخارجية
  try {
    const streetLightID = this.getQuery()._id; 
    if (streetLightID && updatedData.BrightnessLevel !== undefined) {
      await changeBrightnessAPI(streetLightID, updatedData.BrightnessLevel);
    }
  } catch (error) {
    console.error("Error calling changeBrightnessAPI:", error);
  }
  next();
});

// فهرس جغرافي (ضروري للمواقع الجغرافية)
streetLightSchema.index({ location: "2dsphere" });

// تصدير الموديل
module.exports = mongoose.model("StreetLight", streetLightSchema);
