import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { DatePicker } from "antd";
import { useLocation } from "react-router-dom";
import { createLight, updateLight } from "../../../services/street-light";
import DefaultLayout from "../../header";
import { zoneServices } from "../../../services/zone";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getErrorMessage } from "../../../utils";

const LightsInfoZone = () => {
  const location = useLocation();
  const isUpdate = location.state?.isUpdate || false;
  const navigate = useNavigate();
  const [streetlightData, setStreetlightData] = useState(null);
  const [dateTimes, setDateTimes] = useState([
    { startDateTime: null, endDateTime: null, brightness: "" },
  ]);
  const [brightness, setBrightness] = useState();
  const [errors, setErrors] = useState({});
  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    setIsOn((prevState) => !prevState);
  };

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("zoneData"));
    if (savedData) {
      setStreetlightData(savedData);
      if (isUpdate && savedData.dateTimes && savedData.dateTimes.length) {
        setDateTimes(
          savedData?.dateTimes[0]?.dateTimes.map((item) => ({
            startDateTime: item.startDateTime
              ? moment(item.startDateTime)
              : null,
            endDateTime: item.endDateTime ? moment(item.endDateTime) : null,
            brightness: item.BrightnessLevel,
          }))
        );
      }
    }
  }, [isUpdate]);

  const validateFields = () => {
    const newErrors = {};
    dateTimes.forEach((item, index) => {
      if (!item.startDateTime)
        newErrors[`startDateTime_${index}`] = "Start Date & Time is required";
      if (!item.endDateTime)
        newErrors[`endDateTime_${index}`] = "End Date & Time is required";
      if (
        item.startDateTime &&
        item.endDateTime &&
        item.endDateTime.isBefore(item.startDateTime)
      ) {
        newErrors[`endDateTime_${index}`] =
          "End Date & Time must be after Start Date & Time";
      }
      if (
        index > 0 &&
        item.startDateTime &&
        dateTimes[index - 1].endDateTime &&
        item.startDateTime.isBefore(dateTimes[index - 1].endDateTime)
      ) {
        newErrors[`startDateTime_${index}`] =
          "Start Date & Time must be after the previous End Date & Time";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper to get the polygon coordinates from saved data:
  const getZoneCoordinates = () => {
    // Check for either triangleCoords or polygonCoords
    return (
      streetlightData?.triangleCoords || streetlightData?.polygonCoords || []
    );
  };

  // Convert the coordinates to GeoJSON format: [ [ [lng, lat], ... ] ]
  const getGeoJSONCoordinates = () => {
    const coords = getZoneCoordinates();
    if (coords.length < 3) return null;
    const converted = coords.map((pt) => [pt.lng, pt.lat]);
    // Ensure the polygon is closed
    if (
      converted.length &&
      (converted[0][0] !== converted[converted.length - 1][0] ||
        converted[0][1] !== converted[converted.length - 1][1])
    ) {
      converted.push(converted[0]);
    }
    return [converted];
  };

  const handleSave = async () => {
    if (!validateFields()) return;

    const geoJSONCoords = getGeoJSONCoordinates();
    if (!geoJSONCoords) {
      toast.error(
        "Invalid triangle coordinates: At least 3 coordinates are required."
      );
      return;
    }

    const formattedDateTimes = dateTimes.map((item) => ({
      startDateTime: item.startDateTime
        ? item.startDateTime.format("YYYY-MM-DD h:mm A")
        : "",
      endDateTime: item.endDateTime
        ? item.endDateTime.format("YYYY-MM-DD h:mm A")
        : "",
      brightness: item.brightness,
    }));

    const updatedData = {
      ...streetlightData,
      isPoweredON: isOn,
      location: {
        type: "Polygon",
        coordinates: geoJSONCoords,
      },
      dateTimes: formattedDateTimes,
    };

    try {
      if (isUpdate) {
        await updateLight(streetlightData._id, updatedData);
      } else {
        await zoneServices.createZoneService(updatedData);
        localStorage.removeItem("zoneData");
        navigate("/all-zone");
      }
    } catch (error) {
      console.log("Error updating/creating zone:", error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleSaveWithoutDate = async () => {
    const geoJSONCoords = getGeoJSONCoordinates();
    if (!geoJSONCoords) {
      toast.error(
        "Invalid triangle coordinates: At least 3 coordinates are required."
      );
      return;
    }

    const updatedData = {
      ...streetlightData,
      BrightnessLevel: brightness,
      isPoweredOn: isOn,
      location: {
        type: "Polygon",
        coordinates: geoJSONCoords,
      },
      dateTimes: [],
    };

    try {
      if (isUpdate) {
        await updateLight(streetlightData._id, updatedData);
      } else {
        await zoneServices.createZoneService(updatedData);
        localStorage.removeItem("zoneData");
        navigate("/all-zone");
      }
    } catch (error) {
      console.log("Error updating/creating zone without date:", error);
      toast.error(getErrorMessage(error));
    }
  };

  const handleAddTimeSlot = () => {
    setDateTimes([
      ...dateTimes,
      { startDateTime: null, endDateTime: null, brightness: "" },
    ]);
  };

  const handleRemoveTimeSlot = (index) => {
    const newDateTimes = dateTimes.filter((_, i) => i !== index);
    setDateTimes(newDateTimes);
  };

  const handleChange = (index, field, value) => {
    const newDateTimes = [...dateTimes];
    newDateTimes[index][field] = value;
    setDateTimes(newDateTimes);
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-100">
        <h1 className="text-2xl font-semibold text-[#393838] mb-6">
          Streetlight Information
        </h1>

        <div className="flex items-center justify-center w-full h-full mb-6">
          <div className="flex flex-col items-start">
            <label className="text-black text-[20px] font-semibold mt-1 text-left">
              Brightness
            </label>
            <div
              className={`toggle-container mt-3 ${isOn ? "on" : "off"}`}
              onClick={handleToggle}
              aria-label="Toggle On/Off"
            >
              <span className="toggle-option">Off</span>
              <span className="toggle-option">On</span>
              <div className="toggle-knob"></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center w-full h-full mb-6">
          <div className="flex flex-col items-start">
            <label className="text-black text-[20px] font-semibold mt-1 text-left">
              Schedule
            </label>
            <div
              className={`toggle-container mt-3 ${!isOn ? "on" : "off"}`}
              onClick={handleToggle}
              aria-label="Toggle On/Off"
            >
              <span className="toggle-option">Off</span>
              <span className="toggle-option">On</span>
              <div className="toggle-knob"></div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          {!isOn ? (
            <>
              {dateTimes.map((item, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 mb-6">
                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-600">
                      Start Date & Time
                    </label>
                    <DatePicker
                      showTime
                      value={item.startDateTime}
                      onChange={(dateTime) =>
                        handleChange(index, "startDateTime", dateTime)
                      }
                      format="YYYY-MM-DD h:mm A"
                      className="w-full border-2 border-[#3D3D3D] rounded-md h-[44px]"
                    />
                    {errors[`startDateTime_${index}`] && (
                      <span className="text-sm text-red-500">
                        {errors[`startDateTime_${index}`]}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-1 font-medium text-gray-600">
                      End Date & Time
                    </label>
                    <DatePicker
                      showTime
                      value={item.endDateTime}
                      onChange={(dateTime) =>
                        handleChange(index, "endDateTime", dateTime)
                      }
                      format="YYYY-MM-DD h:mm A"
                      className="w-full border-2 border-[#3D3D3D] rounded-md h-[44px]"
                    />
                    {errors[`endDateTime_${index}`] && (
                      <span className="text-sm text-red-500">
                        {errors[`endDateTime_${index}`]}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between gap-2">
                      <label className="mb-1 font-medium text-gray-600">
                        Brightness
                      </label>
                      <p className="text-sm">
                        {item.brightness === "" ? 0 : item.brightness}%
                      </p>
                    </div>
                    <input
                      type="range"
                      step={1}
                      placeholder="1-100"
                      value={item.brightness === "" ? 0 : item.brightness}
                      onChange={(e) =>
                        handleChange(
                          index,
                          "brightness",
                          parseInt(e.target.value, 10)
                        )
                      }
                      className="p-2 border-2 border-[#3D3D3D] rounded-md h-[44px] accent-black"
                      min="1"
                      max="100"
                    />
                    {errors[`brightness_${index}`] && (
                      <span className="text-sm text-red-500">
                        {errors[`brightness_${index}`]}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-end col-span-3">
                    {dateTimes.length > 1 && (
                      <button
                        onClick={() => handleRemoveTimeSlot(index)}
                        className="text-sm text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddTimeSlot}
                className="px-4 py-2 mb-4 font-medium text-white bg-blue-500 rounded-md"
              >
                Add Another Time Slot
              </button>
            </>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <label className="mb-1 font-medium text-gray-600">
                  Brightness
                </label>
                <p className="text-sm">{brightness === "" ? 0 : brightness}%</p>
              </div>
              <input
                type="range"
                step={1}
                placeholder="1-100"
                value={brightness === "" ? 0 : brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                className="p-2 border-2 border-[#3D3D3D] rounded-md h-[44px] accent-black"
                min="1"
                max="100"
              />
              {errors[`brightness_`] && (
                <span className="text-sm text-red-500">
                  {errors[`brightness_$`]}
                </span>
              )}
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={() => {
                if (isOn) {
                  handleSaveWithoutDate();
                } else {
                  handleSave();
                }
              }}
              className="px-8 py-2 font-medium text-white rounded-md"
              style={{
                background:
                  "linear-gradient(90deg, #3D68B0 1.67%, #84A8E6 47.17%, #3D68B0 100%)",
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} />
    </DefaultLayout>
  );
};

export default LightsInfoZone;
