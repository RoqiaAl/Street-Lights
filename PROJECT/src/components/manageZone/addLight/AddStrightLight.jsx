import React, { useEffect, useState } from "react";
import { Switch } from "antd";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { getAllZone, zoneServices } from "../../../services/zone";
import { createLight } from "../../../services/street-light";
import DefaultLayout from "../../header";
import Svgs from "../../../assets/svgs";
import LocationPicker from "../../manageStreetLights/locationPicker";
import useFetchData from "../../../hooks/useFetchData";
import Map from "./Map";

const AddStreetLightZone = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { data } = useFetchData(zoneServices.getLightZoneById, id);
    const { state } = useLocation();

    console.log("---data", data);
    const [isOn, setIsOn] = useState(false);
    const [applyZoneSetting, setApplyZoneSetting] = useState(false);
    const [applyControllingSetting, setApplyControllingSetting] = useState(false);
    const [location, setLocation] = useState(null); // State to store location coordinates

    const [lights, setLights] = useState([]);

    useEffect(() => {
        getAllZone().then((res) => {
            console.log("res", res);
            setLights(res?.data);
        });
    }, []);

    const handleToggle = () => {
        setApplyZoneSetting(false);
        setApplyControllingSetting(false);
        setIsOn((prevState) => !prevState);
    };

    const handleZoneSettingChange = (checked) => {
        setApplyZoneSetting(checked);
        if (checked) setApplyControllingSetting(false);
        setIsOn(false);
    };

    const handleControllingSettingChange = (checked) => {
        setApplyControllingSetting(checked);
        if (checked) setApplyZoneSetting(false);
        setIsOn(false);
    };

    const formik = useFormik({
        initialValues: {
            id: "",
            // zone: state?.id,
            address: "",
            status: "",
            applyZoneSetting: false,
            applyControllingSetting: false,
            location: null,
            brightness: 0,
        },
        validationSchema: Yup.object({
            id: Yup.string().required("ID is required"),
            // zone: Yup.string().required("Zone is required"),
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
                zone: data?.zone?._id,
                location: {
                    type: "Point",
                    coordinates: [location?.lng, location?.lat],
                }, // Include location in form data
            };
            if (applyControllingSetting) {
                localStorage.setItem("streetlightData", JSON.stringify(formData));
                navigate("lights-info");
            } else {
                await createLight(formData);
                navigate(`/view-zone/${data?.zone?._id}`);
            }
        },
    });

    console.log("lights", lights);

    const fields = [
        { label: "ID", type: "input", placeholder: "ID*", id: "id" },
        // {
        //     label: "Zone",
        //     type: "select",
        //     options: lights?.map((item) => item),
        //     id: "zone",
        // },
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
            <div className="bg-gray-100 min-h-screen">
                <h1 className="font-sans font-medium text-[32px] text-[#393838] mb-8">
                    Manage {data?.zone?.name}{" "}
                    <span className="text-base text-[#6C6A6A]">/ Add Streetlight</span>
                </h1>

                <div className="w-full flex justify-between items-center mb-6">
                    <p className="text-start font-sans font-medium text-[#4C4A4A] text-[24px]">
                        Add Streetlight
                    </p>
                    <span className="cursor-pointer">
                        <Svgs.UpArrow />
                    </span>
                </div>

                <div className="w-full h-[1px] bg-black mb-8"></div>

                <div className="p-6 bg-white rounded-lg shadow">
                    <form onSubmit={formik.handleSubmit}>
                        <div className="grid grid-cols-1 2xl:grid-cols-3 md:grid-cols-2 gap-3">
                            <div className="grid grid-cols-1 gap-4">
                                {fields.map((field, index) => (
                                    <div key={index} className="flex flex-col gap-2">
                                        <label
                                            htmlFor={field.id}
                                            className="font-medium text-gray-600 flex gap-0"
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
                                                className={`p-2 rounded-md focus:outline-none border-[2px] ${formik.touched[field.id] && formik.errors[field.id]
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
                                                className={`p-2 rounded-md focus:outline-none border-[2px] ${formik.touched[field.id] && formik.errors[field.id]
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
                                            <div className="text-red-500 text-sm">
                                                {formik.errors[field.id]}
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                            <div className="hidden 2xl:flex"></div>
                            <div className="flex justify-center items-center h-full w-full">
                                <div className="flex items-end gap-8 flex-col md:flex-row">
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
                                            <div className="flex items-center gap-2 justify-between">
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
                                                className={`p-2 rounded-md  focus:outline-none accent-black border-[2px] ${formik.touched["brightness"] && formik.errors[""]
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
                                            className={` visible:hidden p-2 rounded-md focus:outline-none border-[2px] ${formik.touched["field.id"] && formik.errors[""]
                                                ? "border-red-500"
                                                : "border-[#3D3D3D]"
                                                } `}
                                            style={{ visibility: "hidden" }}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Google Map Picker */}
                        <div className="my-4">
                            <Map
                                onLocationSelect={(coords) => {
                                    setLocation(coords);
                                    formik.setFieldValue(
                                        "address",
                                        `${coords?.lat}  ${coords?.lng}`
                                    );
                                    formik.setFieldValue("location", coords);
                                }}
                                triangleCoords={data?.zone?.location?.coordinates}
                            />
                        </div>
                        {formik.touched.location && formik.errors.location ? (
                            <div className="text-red-500 text-sm">
                                {formik.errors.location}
                            </div>
                        ) : null}
                        <div className="flex justify-between items-start mt-8 space-x-8">
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
                                    This will allow users to control the various settings for the
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

                        <div className="flex w-full justify-center items-center">
                            <button
                                type="submit"
                                className="mt-6 w-[312px] py-2 text-white font-medium rounded-[4px]"
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
            </div>
        </DefaultLayout>
    );
};

export default AddStreetLightZone;
