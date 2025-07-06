import React, { useEffect, useState } from "react";
import { Switch } from "antd";
import DefaultLayout from "../header";
import Svgs from "../../assets/svgs";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  createLight,
  createControlNode,
  changeBrightnessAPI,
} from "../../services/street-light";
import LocationPicker from "./locationPicker";
import { getAllZone } from "../../services/zone";
import { toast } from "react-toastify";

const AddStreetLight = () => {
  const navigate = useNavigate();
  const [isOn, setIsOn] = useState(false);
  const [applyZoneSetting, setApplyZoneSetting] = useState(false);
  const [applyControllingSetting, setApplyControllingSetting] = useState(false);
  const [location, setLocation] = useState(null); // Stores location coordinates (lat/lng)
  const [lights, setLights] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null); // Stores the selected zone's polygon coordinates
  const [zoneBoundaries, setZoneBoundaries] = useState(null); // Stores the polygon coordinates for the map

  // Fetch Zones on component mount
  useEffect(() => {
    getAllZone()
      .then((res) => {
        console.log("Fetched zones:", res);
        setLights(res?.data);
      })
      .catch((err) => console.error("Error fetching zones:", err));
  }, []);

  // Handle zone selection
  const handleZoneChange = (zoneId) => {
    const selectedZone = lights.find((zone) => zone._id === zoneId);
    if (selectedZone) {
      console.log("Selected Zone:", selectedZone); // Debugging
      setSelectedZone(selectedZone);
      setZoneBoundaries(selectedZone.location.coordinates[0]); // Extract polygon coordinates
      console.log("Zone Boundaries:", selectedZone.location.coordinates[0]); // Debugging
    } else {
      setSelectedZone(null);
      setZoneBoundaries(null);
    }
  };

  // Toggle the entire lamp ON/OFF
  const handleToggle = () => {
    setApplyZoneSetting(false);
    setApplyControllingSetting(false);
    setIsOn((prevState) => !prevState);
  };

  // Toggle applyZoneSetting
  const handleZoneSettingChange = (checked) => {
    setApplyZoneSetting(checked);
    if (checked) setApplyControllingSetting(false);
    setIsOn(false);
  };

  // Toggle applyControllingSettingA
  const handleControllingSettingChange = (checked) => {
    setApplyControllingSetting(checked);
    if (checked) setApplyZoneSetting(false);
    setIsOn(false);
  };

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      zone: "",
      address: "", // Ensure address is included
      status: "",
      applyZoneSetting: false,
      applyControllingSetting: false,
      location: null,
      brightness: 0,
      model: "",
      tvilightID: "",
    },
    validationSchema: Yup.object({
      zone: Yup.string().required("Zone is required"),
      address: Yup.string().required("Address is required"), // Ensure address is validated
      status: Yup.string().required("Status is required"),
      location: Yup.object()
        .shape({
          type: Yup.string()
            .oneOf(["Point"], "Type must be Point")
            .required("Type is required"),
          coordinates: Yup.array()
            .of(Yup.number().required("Coordinate must be a number"))
            .length(
              2,
              "Coordinates must be exactly two numbers (longitude, latitude)"
            )
            .required("Coordinates are required"),
        })
        .nullable()
        .required("Location is required"),

      model: Yup.string().required("Model is required"),
      tvilightID: Yup.string().required("Tvilight ID is required"),
    }),
    // In your formik configuration
    onSubmit: async (values) => {
      console.log("Form submitted with values:", values);
      try {
        // Call your API to create the streetlight
        const response = await createLight(values);
        console.log("Streetlight created successfully:", response);
        toast.success("Streetlight added successfully");
        // Navigate to the AllStreetLights page after successful creation
        navigate("/");
      } catch (error) {
        console.error("Error adding streetlight:", error);
        toast.error("Error adding streetlight");
      }
    },
  });

  // Fields to be displayed in the StreetLight form (excluding 'id')
  const streetLightFields = [
    {
      label: "Zone",
      type: "select",
      options: lights?.map((item) => item),
      id: "zone",
    },
    {
      label: "Address",
      type: "input",
      placeholder: "Address*",
      id: "address",
    },
    {
      label: "Status",
      type: "select",
      options: [
        {
          id: "functioning",
          name: "functioning",
        },
        {
          id: "malfunctioning",
          name: "malfunctioning",
        },
      ],
      id: "status",
    },
  ];

  // Fields for the Control Node form
  const controlNodeFields = [
    {
      label: "Model",
      type: "input",
      placeholder: "Model*",
      id: "model",
    },
    {
      label: "Tvilight ID",
      type: "input",
      placeholder: "Tvilight ID*",
      id: "tvilightID",
    },
  ];

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-100">
        <h1 className="font-sans font-medium text-[32px] text-[#393838] mb-8">
          Manage Streetlight{" "}
          <span className="text-base text-[#6C6A6A]">/ Add Streetlight</span>
        </h1>

        <div className="flex items-center justify-between w-full mb-6">
          <p className="text-start font-sans font-medium text-[#4C4A4A] text-[24px]">
            Add Streetlight
          </p>
          <span className="cursor-pointer">
            <Svgs.UpArrow />
          </span>
        </div>

        <div className="w-full h-[1px] bg-black mb-8"></div>

        {/* Form start */}
        <form onSubmit={formik.handleSubmit}>
          <div className="p-6 bg-white rounded-lg shadow">
            {/* Streetlight Basic Fields */}
            <div className="grid grid-cols-1 gap-3 2xl:grid-cols-3 md:grid-cols-2">
              <div className="grid grid-cols-1 gap-4">
                {streetLightFields.map((field, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <label
                      htmlFor={field.id}
                      className="flex gap-0 font-medium text-gray-600"
                    >
                      {field.label}
                      <span className="mt-1">
                        <Svgs.RoundStar />
                      </span>
                    </label>
                    {field.type === "input" ? (
                      <input
                        id={field.id}
                        name={field.id}
                        type="text"
                        placeholder={field.placeholder}
                        onChange={(e) => {
                          formik.handleChange(e);
                          if (field.id === "zone") {
                            handleZoneChange(e.target.value);
                          }
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values[field.id]}
                        className={`p-2 rounded-md focus:outline-none border-[2px] ${
                          formik.touched[field.id] && formik.errors[field.id]
                            ? "border-red-500"
                            : "border-[#3D3D3D]"
                        }`}
                      />
                    ) : (
                      <select
                        id={field.id}
                        name={field.id}
                        onChange={(e) => {
                          formik.handleChange(e);
                          if (field.id === "zone") {
                            handleZoneChange(e.target.value);
                          }
                        }}
                        onBlur={formik.handleBlur}
                        value={formik.values[field.id]}
                        className={`p-2 rounded-md focus:outline-none border-[2px] ${
                          formik.touched[field.id] && formik.errors[field.id]
                            ? "border-red-500"
                            : "border-[#3D3D3D]"
                        }`}
                      >
                        <option value="" label="Select" />
                        {field.options.map((option, i) => (
                          <option key={i} value={option._id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {formik.touched[field.id] && formik.errors[field.id] ? (
                      <div className="text-sm text-red-500">
                        {formik.errors[field.id]}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="hidden 2xl:flex"></div>

              {/* ON/OFF + Brightness */}
              <div className="flex items-center justify-center w-full h-full">
                <div className="flex flex-col items-end gap-8 md:flex-row">
                  <div className="flex flex-col items-start">
                    <label className="text-black text-[20px] font-semibold mt-1 text-left">
                      ON/OFF
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
                  {isOn ? (
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm">Brightness</p>
                        <p className="text-sm">
                          {formik.values["brightness"]}%
                        </p>
                      </div>
                      <input
                        id="brightness"
                        name="brightness"
                        type="range"
                        step={1}
                        min={1}
                        max={100}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values["brightness"]}
                        className={`p-2 rounded-md focus:outline-none accent-black border-[2px] ${
                          formik.touched["brightness"] && formik.errors[""]
                            ? "border-red-500"
                            : "border-[#3D3D3D]"
                        }`}
                      />
                    </div>
                  ) : (
                    // إخفاء شريط التمرير لو كان مطفأ
                    <input
                      type="hidden"
                      id="brightness"
                      name="brightness"
                      value={formik.values["brightness"]}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Google Map Picker */}
            <div className="w-full mt-20">
              {location && location.lat && location.lng && (
                <p>
                  Selected location: {location.lat}, {location.lng}
                </p>
              )}
              <LocationPicker
                onLocationSelect={(coords) => {
                  // When a point is selected within the zone, update the project’s address and location.
                  console.log("Selected location:", coords);
                  setLocation(coords);
                  formik.setFieldValue(
                    "address",
                    `${coords.lat}, ${coords.lng}`
                  );
                  formik.setFieldValue("location", {
                    type: "Point",
                    coordinates: [coords.lng, coords.lat],
                  });
                }}
                // Pass the boundaries for the zone to be drawn on the map.
                zoneBoundaries={selectedZone?.location?.coordinates[0]}
              />

              {formik.touched.location && formik.errors.location ? (
                <div className="text-sm text-red-500">
                  {formik.errors.location}
                </div>
              ) : null}
            </div>

            {/* Switches: Apply Zone Setting & Controlling Setting */}
            <div className="flex items-start justify-between mt-8 space-x-8">
              <div className="flex flex-col items-start">
                <label className="text-black text-[20px] font-semibold mt-1 text-left flex">
                  Allow user to Apply Zone Setting
                  <span className="mt-1">
                    <Svgs.RoundStar />
                  </span>
                </label>
                <p className="font-medium text-[10px] text-[#547995] flex gap-1">
                  <span className="mt-1">
                    <Svgs.RoundStar />
                  </span>
                  This will allow users to configure the zone settings for the
                  smart streetlights.
                </p>
                <span className="mt-8">
                  <Switch
                    checked={applyZoneSetting}
                    onChange={handleZoneSettingChange}
                    className="w-[51px] h-[24px]"
                  />
                </span>
              </div>

              <div className="flex flex-col items-start">
                <label className="text-black text-[20px] font-semibold mt-1 text-left flex">
                  Allow user to Apply Controlling Setting
                  <span className="mt-1">
                    <Svgs.RoundStar />
                  </span>
                </label>
                <p className="font-medium text-[10px] text-[#547995] flex gap-1">
                  <span className="mt-1">
                    <Svgs.RoundStar />
                  </span>
                  This will allow users to control various settings for the
                  smart streetlights.
                </p>
                <span className="mt-8">
                  <Switch
                    checked={applyControllingSetting}
                    onChange={handleControllingSettingChange}
                    className="w-[51px] h-[24px]"
                  />
                </span>
              </div>
            </div>
          </div>

          {/* Control Node Form */}
          <div className="p-6 mt-5 bg-white rounded-lg shadow">
            <div className="grid grid-cols-1 gap-3 2xl:grid-cols-3 md:grid-cols-2">
              <div className="grid grid-cols-1 gap-4">
                <h2 className="font-sans font-medium text-[24px] text-[#4C4A4A] mb-4">
                  The Control Node Details:
                </h2>
                {controlNodeFields.map((field, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <label
                      htmlFor={field.id}
                      className="flex gap-0 font-medium text-gray-600"
                    >
                      {field.label}
                      <span className="mt-1">
                        <Svgs.RoundStar />
                      </span>
                    </label>
                    {field.type === "input" ? (
                      <input
                        id={field.id}
                        name={field.id}
                        type="text"
                        placeholder={field.placeholder}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values[field.id]}
                        className={`p-2 rounded-md focus:outline-none border-[2px] ${
                          formik.touched[field.id] && formik.errors[field.id]
                            ? "border-red-500"
                            : "border-[#3D3D3D]"
                        }`}
                      />
                    ) : (
                      <select
                        id={field.id}
                        name={field.id}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values[field.id]}
                        className={`p-2 rounded-md focus:outline-none border-[2px] ${
                          formik.touched[field.id] && formik.errors[field.id]
                            ? "border-red-500"
                            : "border-[#3D3D3D]"
                        }`}
                      >
                        <option value="" label="Select" />
                        {field.options.map((option, i) => (
                          <option key={i} value={option._id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {formik.touched[field.id] && formik.errors[field.id] ? (
                      <div className="text-sm text-red-500">
                        {formik.errors[field.id]}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-center w-full">
            <button
              type="submit"
              className="mt-6 w-[312px] py-2 text-white font-medium rounded-[4px]"
              disabled={formik.isSubmitting}
              style={{
                background:
                  "linear-gradient(90deg, #3D68B0 1.67%, #84A8E6 47.17%, #3D68B0 100%)",
              }}
            >
              Add Streetlight
            </button>
          </div>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default AddStreetLight;
