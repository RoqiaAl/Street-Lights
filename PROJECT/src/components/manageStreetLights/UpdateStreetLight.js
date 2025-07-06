import React, { useEffect, useState } from "react";
import { Switch } from "antd";
import DefaultLayout from "../header";
import Svgs from "../../assets/svgs";
import { useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateLight } from "../../services/street-light";
import LocationPicker from "./locationPicker";
import { getAllZone } from "../../services/zone";

const UpdateStreetLight = () => {
  const navigate = useNavigate();
  const reactLocation = useLocation();
  const light = reactLocation.state?.light || null;

  const [lights, setLights] = useState([]);
  const [isOn, setIsOn] = useState(light.isOn);
  const [applyZoneSetting, setApplyZoneSetting] = useState(
    light.applyZoneSetting
  );
  const [applyControllingSetting, setApplyControllingSetting] = useState(
    light.applyControllingSetting
  );
  const [location, setLocation] = useState({
    lat: light.location.coordinates[1],
    lng: light.location.coordinates[0],
  });

  useEffect(() => {
    getAllZone().then((res) => {
      setLights(res?.data);
    });
  }, []);

  useEffect(() => {
    if (!light) {
      navigate("/");
    }
  }, [navigate, light]);

  const handleToggle = () => {
    setIsOn((prevState) => !prevState);
  };

  const handleZoneSettingChange = (checked) => {
    setApplyZoneSetting(checked);
    if (checked) setApplyControllingSetting(false);
  };

  const handleControllingSettingChange = (checked) => {
    setApplyControllingSetting(checked);
    if (checked) setApplyZoneSetting(false);
  };

  const formik = useFormik({
    initialValues: {
      id: light.lightid,
      zone: light.zoneId,
      address: light.address,
      status: light.status,
      applyZoneSetting: light.applyZoneSetting,
      applyControllingSetting: light.applyControllingSetting,
      brightness: light.brightness,
      location: {
        lat: light.location.coordinates[1],
        lng: light.location.coordinates[0],
      },
    },
    validationSchema: Yup.object({
      zone: Yup.string().required("Zone is required"),
      address: Yup.string().required("Address is required"),
      status: Yup.string().required("Status is required"),
      location: Yup.object()
        .shape({
          lat: Yup.number().required("Latitude is required"),
          lng: Yup.number().required("Longitude is required"),
        })
        .nullable()
        .required("Location is required"),
    }),
    onSubmit: async (values) => {
      const formData = {
        ...values,
        applyZoneSetting,
        applyControllingSetting,
        isOn,
        location: {
          type: "Point",
          coordinates: [location?.lng, location?.lat],
        },
        _id: light._id,
        dateTimes: light.dateTimes,
      };
      if (applyControllingSetting) {
        localStorage.setItem("streetlightData", JSON.stringify(formData));
        navigate("/lights-info", { state: { isUpdate: true } });
      } else {
        await updateLight(light._id, formData);
        navigate("/");
      }
    },
  });

  const fields = [
    {
      label: "ID",
      type: "input",
      placeholder: "ID*",
      id: "id",
      readOnly: true, // جعل الحقل للعرض فقط
    },
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

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-100">
        <h1 className="font-sans font-medium text-[32px] text-[#393838] mb-8">
          Manage Streetlight{" "}
          <span className="text-base text-[#6C6A6A]">/ Update Streetlight</span>
        </h1>

        <div className="flex items-center justify-between w-full mb-6">
          <p className="text-start font-sans font-medium text-[#4C4A4A] text-[24px]">
            Update Streetlight
          </p>
          <span className="cursor-pointer">
            <Svgs.UpArrow />
          </span>
        </div>

        <div className="w-full h-[1px] bg-black mb-8"></div>

        <div className="p-6 bg-white rounded-lg shadow">
          <form onSubmit={formik.handleSubmit}>
            <div className="grid grid-cols-1 gap-3 2xl:grid-cols-3 md:grid-cols-2">
              <div className="grid grid-cols-1 gap-4">
                {fields.map((field, index) => (
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
                        readOnly={field.readOnly}
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
              <div className="hidden 2xl:flex"></div>
              <div className="flex items-center justify-center w-full h-full">
                <div className="flex flex-col items-end gap-8 md:flex-row">
                  <div className="flex flex-col items-start">
                    <label className="text-black text-[20px] font-semibold text-left">
                      ON/OFF
                    </label>
                    <div
                      className={`toggle-container ${isOn ? "on" : "off"}`}
                      onClick={handleToggle}
                      aria-label="Toggle On/Off"
                    >
                      <span className="toggle-option">No</span>
                      <span className="toggle-option">Yes</span>
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
                        id={"brightness"}
                        name={"brightness"}
                        type="range"
                        step={1}
                        min={1}
                        max={100}
                        placeholder={"Brightness"}
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
                    <input
                      id={"brightness"}
                      name={"field.id"}
                      type="range"
                      step={1}
                      min={1}
                      max={100}
                      placeholder={"Brightness"}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values["field.id"]}
                      className={`visible:hidden p-2 rounded-md focus:outline-none border-[2px] ${
                        formik.touched["field.id"] && formik.errors[""]
                          ? "border-red-500"
                          : "border-[#3D3D3D]"
                      }`}
                      style={{ visibility: "hidden" }}
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
                  setLocation(coords);
                  formik.setFieldValue(
                    "address",
                    `${coords?.lat}  ${coords?.lng}`
                  );
                  formik.setFieldValue("location", coords);
                }}
              />
              {formik.touched.location && formik.errors.location ? (
                <div className="text-sm text-red-500">
                  {formik.errors.location}
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-center w-full">
              <button
                type="submit"
                className="mt-6 w-[312px] py-2 text-white font-medium rounded-[4px]"
                style={{
                  background:
                    "linear-gradient(90deg, #3D68B0 1.67%, #84A8E6 47.17%, #3D68B0 100%)",
                }}
              >
                Update Streetlight
              </button>
            </div>
          </form>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default UpdateStreetLight;
