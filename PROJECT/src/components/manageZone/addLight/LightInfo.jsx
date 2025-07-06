import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { DatePicker } from "antd";
import { useLocation } from "react-router-dom";
import { createLight, updateLight } from "../../../services/street-light";
import DefaultLayout from "../../header";
import useFetchData from "../../../hooks/useFetchData";
import { zoneServices } from "../../../services/zone";

const ZoneLightsInfo = () => {
    const location = useLocation();
    const { id } = useParams();
    const { data } = useFetchData(zoneServices.getLightZoneById, id);
    const isUpdate = location.state?.isUpdate || false;
    const navigate = useNavigate();
    const [streetlightData, setStreetlightData] = useState(null);
    const [dateTimes, setDateTimes] = useState([
        { startDateTime: null, endDateTime: null, brightness: "" },
    ]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const savedData = JSON.parse(localStorage.getItem("streetlightData"));
        if (savedData) {
            setStreetlightData(savedData);
            console.log("savedData.dateTimes", savedData.dateTimes);
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

    const handleSave = async () => {
        if (!validateFields()) return;

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
            dateTimes: formattedDateTimes,
        };

        if (isUpdate) {
            await updateLight(streetlightData._id, updatedData);
        } else {
            await createLight(updatedData);
        }
        localStorage.removeItem("streetlightData");
        navigate(`/view-zone/${data?.zone?._id}`);
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
            <div className="bg-gray-100 min-h-screen">
                <h1 className="text-2xl font-semibold text-[#393838] mb-6">
                    Streetlight Information
                </h1>

                {streetlightData ? (
                    <>
                        <p className="text-lg font-medium text-[#4C4A4A] mb-2">
                            Streetlight Details:
                        </p>
                        <div className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-4 gap-4">
                            <div className="flex flex-col gap-4">
                                <p className="text-black text-[16px] font-semibold">ID:</p>
                                <span className="text-[#4C4A4A] text-[14px]">
                                    {streetlightData.id}
                                </span>
                            </div>

                            <div className="flex flex-col gap-4">
                                <p className="text-black text-[16px] font-semibold">
                                    Address:{" "}
                                </p>
                                <span className="text-[#4C4A4A] text-[14px]">
                                    {streetlightData.address}
                                </span>
                            </div>
                            <div className="flex flex-col gap-4">
                                <p className="text-black text-[16px] font-semibold">Status: </p>
                                <span className="text-[#4C4A4A] text-[14px]">
                                    {streetlightData.status}
                                </span>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500">No streetlight data found.</p>
                )}

                <div className="bg-white p-6 rounded-lg shadow">
                    {dateTimes.map((item, index) => (
                        <div key={index} className="grid grid-cols-3 gap-4 mb-6">
                            <div className="flex flex-col">
                                <label className="font-medium text-gray-600 mb-1">
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
                                    value={item.endDateTime}
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
                                        {item.brightness == "" ? 0 : item.brightness}%
                                    </p>
                                </div>
                                <input
                                    type="range"
                                    step={1}
                                    placeholder="1-100"
                                    value={item.brightness == "" ? 0 : item.brightness}
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
                                    <span className="text-red-500 text-sm">
                                        {errors[`brightness_${index}`]}
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

                    <div className="flex justify-center">
                        <button
                            onClick={handleSave}
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
        </DefaultLayout>
    );
};

export default ZoneLightsInfo;
