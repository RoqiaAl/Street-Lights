import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DefaultLayout from "../../header";
import Svgs from "../../../assets/svgs";
import useForm from "../../../hooks/validation";
import Map from "../addzone/Map";
import useFetchData from "../../../hooks/useFetchData";
import { zoneServices } from "../../../services/zone";


const initialValues = {
    name: "",
}
const validationRules = {
    name: (value) => value ? '' : 'This Field is Required',

}

const EditZone = () => {
    const navigate = useNavigate();
    const { id } = useParams()
    const { data } = useFetchData(zoneServices.getZoneById, id)

    console.log('---data', data)

    const { values, errors, handleOnChange, validateAllFields, setFormValues } = useForm(initialValues, validationRules)
    const [triangleCoords, setTriangleCoords] = useState([])



    useEffect(() => {

        setFormValues({
            name: data?.name || ''
        })
        setTriangleCoords(data?.location?.coordinates || [])
    }, [data]);

    const handleSubmit = () => {
        const formData = {
            ...values,
            triangleCoords

        }
        localStorage.setItem("zoneData", JSON.stringify(formData));
        navigate("light");
    }
    return (
        <DefaultLayout>
            <div className="bg-gray-100 min-h-screen">
                <h1 className="font-sans font-medium text-[32px] text-[#393838] mb-8">
                    Manage Zone{" "}
                    <span className="text-base text-[#6C6A6A]">/ Edit Zone</span>
                </h1>

                <div className="w-full flex justify-between items-center mb-6">
                    <p className="text-start font-sans font-medium text-[#4C4A4A] text-[24px]">
                        Edit Zone
                    </p>
                    <span className="cursor-pointer">
                        <Svgs.UpArrow />
                    </span>
                </div>

                <div className="w-full h-[1px] bg-black mb-8"></div>

                <div className="p-6 bg-white rounded-lg shadow">
                    <form >
                        <div className="grid grid-cols-1 2xl:grid-cols-3 md:grid-cols-2 gap-3">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label
                                        className="font-medium text-gray-600 flex gap-0"
                                    >
                                        Name                                        <span className="mt-1">
                                            <Svgs.RoundStar />
                                        </span>
                                    </label>

                                    <input
                                        // id={field.id}
                                        name={'name'}
                                        type="text"
                                        placeholder='Name'
                                        onChange={handleOnChange}
                                        value={values.name}
                                        className={`p-2 rounded-md focus:outline-none border-[2px] ${errors.name
                                            ? "border-red-500"
                                            : "border-[#3D3D3D]"
                                            }`}
                                    />
                                    <div className="text-red-500 text-sm">
                                        {errors?.name}
                                    </div>
                                </div>

                            </div>

                        </div>

                        {/* Google Map Picker */}
                        <div className="w-full mt-20">

                            <Map
                                setTriangleCoords={setTriangleCoords}
                                triangleCoords={triangleCoords}

                            />

                        </div>


                        <div className="flex w-full justify-center items-center">
                            <button
                                onClick={handleSubmit}
                                className="mt-6 w-[312px] py-2 text-white font-medium rounded-[4px]"
                                style={{
                                    background:
                                        "linear-gradient(90deg, #3D68B0 1.67%, #84A8E6 47.17%, #3D68B0 100%)",
                                }}
                            >
                                Edit Zone
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DefaultLayout>
    );
};

export default EditZone;
