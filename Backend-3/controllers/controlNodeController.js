const ControlNode = require("../models/controlNodeModel");
const mongoose = require("mongoose");

exports.createControlNode = async (req, res) => {
  try {
    const { streetLightID, status, model, tvilightID } = req.body;
    const newControlNodeData = { streetLightID, status, model, tvilightID };
    const newControlNode = new ControlNode(newControlNodeData);
    await newControlNode.save();

    console.log("added control node successfully ");
    return res.status(201).json({
      success: true,
      data: newControlNode,
      message: "node created successfully",
    });
  } catch (error) {
    console.error("error creating node: ", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//function that changes brighnesslevel of the streetlight in TVILIGHT API
exports.changeBrightnessAPI = async (streetLightID, brightnesslevel) => {
  try {
    console.log(
      "in func. changeBrightnessAPI: streetLight ID: " +
        streetLightID +
        " and brightness:" +
        brightnesslevel
    );
    // Validate streetLightID
    if (!streetLightID || !mongoose.isValidObjectId(streetLightID)) {
      throw new Error(`Invalid streetLightID: ${streetLightID}`);
    }
    // find the streetlight's control node to change the brightness in TVILIGHT API
    const connectedControlNode = await ControlNode.findOne({
      streetLightID: streetLightID,
    });
    if (!connectedControlNode) {
      throw new Error(
        `No ControlNode found for streetLightID: ${streetLightID}`
      );
    }
    const tvilightID = connectedControlNode.tvilightID;

    if (!tvilightID) {
      throw new Error(
        `tvilightID is missing for ControlNode linked to StreetLight ID: ${streetLightID}`
      );
    }

    //update device's data in Tvilight API
    const Response = await fetch(
      `https://ctl.tvilight.io/api/devices/${tvilightID}`,
      {
        method: "PUT",
        headers: {
          "x-api-key": process.env.TVLIGHT_API_KEY, // The API Key for identifying the request
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.accessToken}`, // Bearer token for authentication
          Accept: "application/vnd.tvilight.v1.0+json", // API versioning
        },
        body: JSON.stringify({
          modus: "fixed_level",
          lamp_brightness_percentage: brightnesslevel,
        }),
      }
    );

    if (!Response.ok) {
      const errorText = await Response.text();
      console.error(`API Error: ${Response.status} - ${errorText}`);
      throw new Error(`Could not fetch resource: ${Response.status}`);
    }
  } catch (error) {
    console.error(error);
  }
};

//function that directly turns the streetlight on/off in TVILIGHT API
exports.changePowerAPI = async (streetLightID, streetlightPowerStatus) => {
  try {
    console.log(
      "in func. changePowerAPI: streetLight ID: " +
        streetLightID +
        " and its status:" +
        streetlightPowerStatus
    );
    // find the streetlight's control node to change the brightness in TVILIGHT API
    const connectedControlNode = await ControlNode.findOne({
      streetLightID: streetLightID,
    });
    const tvilightID = connectedControlNode.tvilightID;
    //update device's data in Tvilight API
    const Response = await fetch(
      `https://ctl.tvilight.io/api/devices/${tvilightID}`,
      {
        method: "PUT",
        headers: {
          "x-api-key": process.env.TVLIGHT_API_KEY, // The API Key for identifying the request
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.accessToken}`, // Bearer token for authentication
          Accept: "application/vnd.tvilight.v1.0+json", // API versioning
        },
        body: JSON.stringify({
          modus: "fixed_level",
          lamp_brightness_percentage: streetlightPowerStatus,
        }),
      }
    );

    if (!Response.ok) {
      const errorText = await Response.text();
      console.error(`API Error: ${Response.status} - ${errorText}`);
      throw new Error(`Could not fetch resource: ${Response.status}`);
    }
  } catch (error) {
    console.error(error);
  }
};
