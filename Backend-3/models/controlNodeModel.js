const mongoose = require("mongoose");

//collection ControlNode schema
const controlNodeSchema = new mongoose.Schema({
  //refernces the streetlight connected to
  streetLightID: {
    type: mongoose.Schema.ObjectId,
    ref: "StreetLight",
    default: null,
  },
  //current operational state
  status: {
    type: String,
    enum: {
      values: ["functioning", "malfunctioning"],
      message: "Status is either: functioning or malfunctioning",
    },
    default: "functioning",
  },
  //name of the hardware type/version
  model: {
    type: String,
    trim: true,
  },
  //attribute to connect with the node's API for functions
  tvilightID: {
    type: String,
    trim: true,
    requierd: true,
  },
});

//after it's saved: apply brightness in Tvilight API
controlNodeSchema.post("save", async function (next) {
  const StreetLight = require("../models/streetLightModel"); //to avoid circular dependency
  const {
    changeBrightnessAPI,
  } = require("../controllers/controlNodeController"); //to avoid circular dependency
  connectedStreetLight = await StreetLight.findById(this.streetLightID);
  await changeBrightnessAPI(
    this.streetLightID,
    connectedStreetLight.BrightnessLevel
  );
  next();
});
//creating a model for ControlNode collection
module.exports = mongoose.model("ControlNode", controlNodeSchema);
