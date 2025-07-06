import React, { useState } from "react";
import DefaultLayout from "../../header";
import Svgs from "../../../assets/svgs";
import useFetchData from "../../../hooks/useFetchData";
import { useNavigate, useParams } from "react-router-dom";
import { zoneServices } from "../../../services/zone";
import { Modal, Spin } from "antd";
import CustomTable from "../../common/CustomTable";
import { toast, ToastContainer } from "react-toastify";
import { deleteLight } from "../../../services/street-light";




const ViewZone = () => {
    const { id } = useParams()
    const [refetch, setRefetch] = useState(0);
    const { data, loading } = useFetchData(zoneServices.getLightZoneById, id, refetch)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    console.log('--data---', data)

    const navigate = useNavigate()

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        try {
            await deleteLight(selectedRow._id);
            setRefetch((prev) => prev + 1);
            setIsModalOpen(false);
            toast.success("zone deleted successfully");
        } catch (error) {
            toast.error("Failed to delete zone");
        }
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const headers = [
        "light id",
        "delete",
    ];
    const data_ = data?.lights?.map((row) => {
        return [
            <p>{row?.lightid}</p>
            ,
            <div
                style={{ cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}
                onClick={() => {
                    setSelectedRow(row);
                    showModal();
                }}
            >
                <Svgs.DeleteIcon />
            </div>,




        ];
    });
    return (
        <DefaultLayout>
            {
                loading ? <Spin size="large" /> : <div className="bg-gray-100 min-h-screen">
                    <h1 className="font-sans font-medium text-[32px] text-[#393838] mb-8">
                        Manage Zone{" "}
                        <span className="text-base text-[#6C6A6A]">/ View Zone</span>
                    </h1>

                    <div className="w-full flex justify-between items-center mb-6">
                        <p className="text-start font-sans font-medium text-[#4C4A4A] text-[24px]">
                            View Zone
                        </p>
                        <span className="cursor-pointer">
                            <Svgs.UpArrow />
                        </span>
                    </div>

                    <div className="w-full h-[1px] bg-black mb-8"></div>
                    <>
                        <p className="text-lg font-medium text-[#4C4A4A] mb-2">
                            Zone Details:
                        </p>
                        <div className="bg-white p-6 rounded-lg shadow mb-8 grid grid-cols-4 gap-4">

                            <div className="flex flex-col gap-4">
                                <p className="text-black text-[16px] font-semibold">Zone: </p>
                                <span className="text-[#4C4A4A] text-[14px]">
                                    {data?.zone?.name}
                                </span>
                            </div>
                            <div className="flex flex-col gap-4">
                                <p className="text-black text-[16px] font-semibold">
                                    Powered On:{" "}
                                </p>
                                <span className="text-[#4C4A4A] text-[14px]">
                                    {data?.zone?.isPoweredOn ? "ON" : "OFF"}
                                </span>
                            </div>
                            <div className="flex flex-col gap-4">
                                <p className="text-black text-[16px] font-semibold">BrightnessLevel: </p>
                                <span className="text-[#4C4A4A] text-[14px]">
                                    {!data?.zone?.isPoweredOn ? 0 : data?.zone?.BrightnessLevel}
                                </span>
                            </div>

                        </div>
                    </>

                    <div className="p-6 bg-white rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <p className="text-lg font-medium text-[#4C4A4A] mb-2">
                                Light Details:
                            </p>
                            <button
                                type="submit"
                                className=" w-auto px-2 py-2 text-white font-medium rounded-[4px]"
                                style={{
                                    background:
                                        "linear-gradient(90deg, #3D68B0 1.67%, #84A8E6 47.17%, #3D68B0 100%)",
                                }}
                                onClick={() => navigate('add', { state: { id: data?.zone?._id } })}
                            >
                                Add Streetlight
                            </button>
                        </div>
                        <div className="w-full border border-[#e6e8ea] rounded-[10px] mt-8">
                            <CustomTable headers={headers} data={data_} />
                        </div>
                    </div>
                </div>
            }
            <Modal
                title="Delete Street Light"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Delete"
                okType="danger"
            >
                <p>Are you sure you want to delete this Street light?</p>
            </Modal>
            <ToastContainer limit={1} position="top-right" autoClose={2000} />
        </DefaultLayout>
    );
};

export default ViewZone;
