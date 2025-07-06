import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "../../header";
import Svgs from "../../../assets/svgs";
import Map from "./Map";
import useForm from "../../../hooks/validation";
import zonesData from "../../../assets/zones.json";

const initialValues = {
  name: "",
};

const validationRules = {
  name: (value) => (value ? "" : "This Field is Required"),
};

const AddZone = () => {
  const navigate = useNavigate();
  const { values, errors, handleOnChange } = useForm(
    initialValues,
    validationRules
  );

  // Use triangleCoords consistently for polygon coordinates.
  const [triangleCoords, setTriangleCoords] = useState([]);
  const [zones, setZones] = useState([]);

  // Load zones from JSON using the key "Riyadh_Districts"
  useEffect(() => {
    if (zonesData && zonesData.Riyadh_Districts) {
      setZones(zonesData.Riyadh_Districts);
    }
  }, []);

  // When a user selects a zone from the dropdown, update triangleCoords.
  const handleZoneSelect = (e) => {
    handleOnChange(e);
    const selectedZoneName = e.target.value;
    const zoneData = zones.find((zone) => zone.name === selectedZoneName);
    if (
      zoneData &&
      zoneData.polygon &&
      zoneData.polygon.type === "Polygon" &&
      zoneData.polygon.coordinates &&
      zoneData.polygon.coordinates[0]
    ) {
      // Convert each coordinate pair from [lng, lat] to { lat, lng }
      const convertedCoords = zoneData.polygon.coordinates[0].map(
        ([lng, lat]) => ({ lat, lng })
      );
      setTriangleCoords(convertedCoords);
    } else {
      setTriangleCoords([]);
    }
  };

  const handleSubmit = () => {
    const formData = {
      ...values,
      triangleCoords,
    };
    localStorage.setItem("zoneData", JSON.stringify(formData));
    navigate("light");
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-100">
        <h1 className="font-sans font-medium text-[32px] text-[#393838] mb-8">
          Manage Zone{" "}
          <span className="text-base text-[#6C6A6A]">/ Add Zone</span>
        </h1>

        <div className="flex items-center justify-between w-full mb-6">
          <p className="text-start font-sans font-medium text-[#4C4A4A] text-[24px]">
            Add Zone
          </p>
          <span className="cursor-pointer">
            <Svgs.UpArrow />
          </span>
        </div>

        <div className="w-full h-[1px] bg-black mb-8"></div>

        <div className="p-6 bg-white rounded-lg shadow">
          <form>
            <div className="grid grid-cols-1 gap-3 2xl:grid-cols-3 md:grid-cols-2">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="flex gap-0 font-medium text-gray-600">
                    Zone{" "}
                    <span className="mt-1">
                      <Svgs.RoundStar />
                    </span>
                  </label>
                  <select
                    name="name"
                    value={values.name}
                    onChange={handleZoneSelect}
                    className={`p-2 rounded-md focus:outline-none border-[2px] ${
                      errors.name ? "border-red-500" : "border-[#3D3D3D]"
                    }`}
                    style={{
                      overflowY: "auto",
                      maxHeight: "200px",
                    }}
                  >
                    <option value="" disabled>
                      Select Zone
                    </option>
                    {zones.map((zone, index) => (
                      <option key={index} value={zone.name}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                  <div className="text-sm text-red-500">{errors?.name}</div>
                </div>
              </div>
            </div>

            {/* Map: Draws the polygon for the selected zone */}
            <div className="w-full mt-20">
              <Map
                triangleCoords={triangleCoords}
                setTriangleCoords={setTriangleCoords}
              />
            </div>

            <div className="flex items-center justify-center w-full">
              <button
                type="button"
                onClick={handleSubmit}
                className="mt-6 w-[312px] py-2 text-white font-medium rounded-[4px]"
                style={{
                  background:
                    "linear-gradient(90deg, #3D68B0 1.67%, #84A8E6 47.17%, #3D68B0 100%)",
                }}
              >
                Save Zone
              </button>
            </div>
          </form>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AddZone;
