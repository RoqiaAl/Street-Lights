import { DELETE, GET, PATCH, POST } from "./http-client";

export const createZone = async (data) => {
  try {
    await POST("zone", data);
  } catch (error) {
    console.error("API error:", error);
  }
};

export const getAllZone = async () => {
  try {
    return await GET("zones");
  } catch (error) {
    console.error("API error:", error);
  }
};

export const deleteZone = async (id) => {
  try {
    await DELETE(`zone/${id}`);
  } catch (error) {
    console.error("API error:", error);
  }
};

const createZoneService = (data) => POST("/zone", data);
const updateZoneService = (id, data) => PATCH(`/zone/${id}`, data);

const getZoneById = (id) => GET(`/zone/${id}`);
const getLightZoneById = (id) => GET(`/zone/info/${id}`);

export const zoneServices = {
  createZoneService,
  getZoneById,
  getLightZoneById,
  updateZoneService,
};
