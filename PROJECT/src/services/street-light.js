// Define functions to interact with the backend using a centralized HTTP client
// for consistent API interaction and error handling
import { DELETE, GET, PATCH, POST } from "./http-client";

export const createLight = async (data) => {
  try {
    const response = await POST("light/create", data);
    return response.data;
  } catch (error) {
    console.error("API error:", error);
  }
};

export const getAllLights = async () => {
  try {
    return await GET("light/getAll");
  } catch (error) {
    console.error("API error:", error);
  }
};

export const deleteLight = async (id) => {
  try {
    await DELETE(`light/delete/${id}`);
  } catch (error) {
    console.error("API error:", error);
  }
};

export const updateLight = async (id, data) => {
  try {
    await PATCH(`light/update/${id}`, data);
  } catch (error) {
    console.error("API error:", error);
  }
};

export const createControlNode = async (data) => {
  try {
    await POST("controlNode/create", data);
  } catch (error) {
    console.error("Error creating control node:", error);
  }
};

export const changeBrightnessAPI = async (id, brightness) => {
  try {
    await PATCH(`TVILIGHT/brightness/${id}`, { brightness });
    console.log("Brightness updated successfully in TVILIGHT API");
  } catch (error) {
    console.error("API error in changeBrightnessAPI:", error);
  }
};

export const determinePowerStatus = async (dateTimes) => {
  try {
    const response = await POST("controlProfile/brightness", { dateTimes });
    return response.brightnessLevel || 0;
  } catch (error) {
    console.error("API error in determinePowerStatus:", error);
    return 0; // Default brightness on error
  }
};

// Generate a new Light ID from the database
export const generateLightID = async () => {
  try {
    const response = await GET("light/generate-id"); // استدعاء API لاسترجاع ID جديد
    return response.data.id; // استخراج ID من البيانات المستلمة
  } catch (error) {
    console.error("Error generating Light ID:", error);
    throw error;
  }
};
