import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { DatePicker } from "antd";
import { useLocation } from "react-router-dom";
import DefaultLayout from "../../header";
import { zoneServices } from "../../../services/zone";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getErrorMessage } from "../../../utils";
import useFetchData from "../../../hooks/useFetchData";
import dayjs from "dayjs";


const LightsInfoZoneEdit = () => {
    const location = useLocation();
    const isUpdate = location.state?.isUpdate || false;
    const { id } = useParams()
    const { data } = useFetchData(zoneServices.getZoneById, id)

    console.log('---data', data)
    const navigate = useNavigate();
    const [streetlightData, setStreetlightData] = useState(null);
    const [dateTimes, setDateTimes] = useState([
        { startDateTime: null, endDateTime: null, BrightnessLevel: "" },
    ]);
    const [brightness, setBrightness] = useState();
    const [errors, setErrors] = useState({});

    const [isOn, setIsOn] = useState(false);
    useEffect(() => {
        setDateTimes(
            data?.dateTimes?.length > 0
                ? data?.dateTimes?.map((item) => ({
                    ...item,
                    startDateTime: item.startDateTime ? dayjs(item.startDateTime) : null,
                    endDateTime: item.endDateTime ? dayjs(item.endDateTime) : null,
                    BrightnessLevel: item.BrightnessLevel,
                }))
                : [{ startDateTime: null, endDateTime: null, BrightnessLevel: "" }]
        );
        setIsOn(data?.isPoweredOn || false);
        setBrightness(data?.BrightnessLevel || 0);
    }, [data]);




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
                        BrightnessLevel: item.BrightnessLevel,
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
                dayjs.isDayjs(item.startDateTime) &&
                dayjs.isDayjs(item.endDateTime) &&
                item.endDateTime.isBefore(item.startDateTime)
            ) {
                newErrors[`endDateTime_${index}`] =
                    "End Date & Time must be after Start Date & Time";
            }
            if (
                index > 0 &&
                item.startDateTime &&
                dateTimes[index - 1].endDateTime &&
                dayjs.isDayjs(item.startDateTime) &&
                dayjs.isDayjs(dateTimes[index - 1].endDateTime) &&
                item.startDateTime.isBefore(dateTimes[index - 1].endDateTime)
            ) {
                newErrors[`startDateTime_${index}`] =
                    "Start Date & Time must be after the previous End Date & Time";
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSave = async () => {
        if (!validateFields()) return;

        const formattedDateTimes = dateTimes.map((item) => ({
            startDateTime: item.startDateTime
                ? item.startDateTime.format("YYYY-MM-DD h:mm A")
                : "",
            endDateTime: item.endDateTime
                ? item.endDateTime.format("YYYY-MM-DD h:mm A")
                : "",
            BrightnessLevel: item.BrightnessLevel,
        }));

        const updatedData = {
            ...streetlightData,
            BrightnessLevel: brightness,
            isPoweredOn: isOn,
            location: {
                type: "Polygon",
                coordinates: streetlightData?.triangleCoords,
            },
            dateTimes: formattedDateTimes,
        };

        zoneServices
            .updateZoneService(id, updatedData)
            .then(() => {
                localStorage.removeItem("zoneData");
                navigate("/all-zone");
            })
            .catch((error) => {
                console.log('errr', error);
                toast.error(getErrorMessage(error));
            });
    };

    const handleSaveWithoutDate = async () => {
        const updatedData = {
            ...streetlightData,
            BrightnessLevel: brightness,
            isPoweredOn: isOn,
            location: {
                type: "Polygon",
                coordinates: streetlightData?.triangleCoords,
            },
        };

        zoneServices
            .updateZoneService(id, updatedData)
            .then(() => {
                localStorage.removeItem("zoneData");
                navigate("/all-zone");
            })
            .catch((error) => {
                console.log('errr', error);
                toast.error(getErrorMessage(error));
            });
    };

    const handleAddTimeSlot = () => {
        setDateTimes([
            ...dateTimes,
            { startDateTime: null, endDateTime: null, BrightnessLevel: "" },
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
            <div className="bg-gray-100 min-h-screen">
                <h1 className="text-2xl font-semibold text-[#393838] mb-6">
                    Zone Information
                </h1>

                <div className="flex flex-col gap-6  w-full">
                    <div className="flex ">
                        <div className="flex items-end gap-8 flex-col md:flex-row">
                            <div className="flex   items-center gap-6">
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
                    </div>
                    {
                        isOn && (
                            <div className="flex bg-white p-6 rounded-xl shadow-md flex-col">
                                <div className="flex items-center justify-between gap-2">
                                    <label className="font-medium text-gray-600 mb-1">
                                        Brightness
                                    </label>
                                    <p className="text-sm">{brightness == "" ? 0 : brightness}%</p>
                                </div>
                                <input
                                    type="range"
                                    step={1}
                                    placeholder="1-100"
                                    value={brightness == "" ? 0 : brightness}
                                    onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                                    className="p-2 border-2 border-[#3D3D3D] rounded-md h-[44px] accent-black"
                                    min="1"
                                    max="100"
                                />
                                {errors[`brightness_`] && (
                                    <span className="text-red-500 text-sm">
                                        {errors[`brightness_$`]}
                                    </span>
                                )}
                            </div>
                        )
                    }

                    <div className="flex  ">
                        <div className="flex items-end gap-8 flex-col md:flex-row">
                            <div className="flex  items-center gap-6">
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
                    </div>
                </div>
                <div className=" mt-6">
                    {!isOn && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            {dateTimes.map((item, index) => (
                                <div key={index} className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="flex flex-col">
                                        <label className="font-medium text-gray-600 mb-1">
                                            Start Date & Time
                                        </label>
                                        <DatePicker
                                            showTime
                                            value={item?.startDateTime || null} // item?.startDateTime is already dayjs

                                            onChange={(dateTime) =>
                                                handleChange(index, "startDateTime", dateTime)
                                            }
                                            format="YYYY-MM-DD h:mm A"
                                            className="w-full border-2 border-[#3D3D3D] rounded-md h-[44px]"
                                        />
                                        {errors[`startDateTime_${index}`] && (
                                            <span className="text-red-500 text-sm">
                                                {errors[`startDateTime_${index}`]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="font-medium text-gray-600 mb-1">
                                            End Date & Time
                                        </label>
                                        <DatePicker
                                            showTime
                                            value={item?.endDateTime || null} // item?.startDateTime is already dayjs

                                            onChange={(dateTime) =>
                                                handleChange(index, "endDateTime", dateTime)
                                            }
                                            format="YYYY-MM-DD h:mm A"
                                            className="w-full border-2 border-[#3D3D3D] rounded-md h-[44px]"
                                        />
                                        {errors[`endDateTime_${index}`] && (
                                            <span className="text-red-500 text-sm">
                                                {errors[`endDateTime_${index}`]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center justify-between gap-2">
                                            <label className="font-medium text-gray-600 mb-1">
                                                Brightness
                                            </label>
                                            <p className="text-sm">
                                                {item.BrightnessLevel === 0 ? 0 : item.BrightnessLevel}%
                                            </p>
                                        </div>
                                        <input
                                            type="range"
                                            step={1}
                                            placeholder="1-100"
                                            value={item.BrightnessLevel === 0 ? 0 : item.BrightnessLevel}
                                            onChange={(e) =>
                                                handleChange(
                                                    index,
                                                    "BrightnessLevel",
                                                    parseInt(e.target.value, 10)
                                                )
                                            }
                                            className="p-2 border-2 border-[#3D3D3D] rounded-md h-[44px] accent-black"
                                            min="1"
                                            max="100"
                                        />
                                        {errors[`BrightnessLevel${index}`] && (
                                            <span className="text-red-500 text-sm">
                                                {errors[`BrightnessLevel${index}`]}
                                            </span>
                                        )}
                                    </div>

                                    <div className="col-span-3 flex justify-end">
                                        {dateTimes.length > 1 && (
                                            <button
                                                onClick={() => handleRemoveTimeSlot(index)}
                                                className="text-red-500 text-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={handleAddTimeSlot}
                                className="px-4 py-2 mb-4 text-white font-medium rounded-md bg-blue-500"
                            >
                                Add Another Time Slot
                            </button>
                        </div>
                    )}

                    <div className="flex mt-4 justify-center">
                        <button
                            onClick={() => {
                                if (isOn) {
                                    handleSaveWithoutDate();
                                } else {
                                    handleSave();
                                }
                            }}
                            className="px-8 py-2 text-white font-medium rounded-md"
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

export default LightsInfoZoneEdit;
