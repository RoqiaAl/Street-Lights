import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { deleteLight } from "../../../services/street-light";
import Svgs from "../../../assets/svgs";
import DefaultLayout from "../../header";
import CustomTable from "../../common/CustomTable";
import { deleteZone, getAllZone } from "../../../services/zone";

const AllZone = () => {
    const [lights, setLights] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [refetch, setRefetch] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        getAllZone().then((res) => {
            console.log(res);
            setLights(res?.data);
        });
    }, [refetch]);

    // Define table headers
    const headers = [
        "Name",
        "delete",
        "update",
        "view",
    ];

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = async () => {
        try {
            await deleteZone(selectedRow._id);
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

    // // State to manage toggles and selections per row
    // const [rows, setRows] = useState([
    //   { id: 1, toggle1: false, toggle2: false, selected: false },
    //   { id: 2, toggle1: false, toggle2: false, selected: false },
    //   { id: 3, toggle1: false, toggle2: false, selected: false },
    //   { id: 4, toggle1: false, toggle2: false, selected: false },
    // ]);




    // Custom Yes/No Toggle component

    const data = lights?.map((row) => {
        return [
            <p>{row?.name}</p>
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
            <div
                style={{ cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}
                onClick={() =>
                    navigate(`/edit-zone/${row?._id}`, {
                        state: {
                            light: row,
                        },
                    })
                }
            >
                <Svgs.EditIcon />
            </div>,
            <div
                style={{ cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center" }}
                onClick={() =>
                    navigate(`/view-zone/${row?._id}`, {
                        state: {
                            light: row,
                        },
                    })
                }
            >
                <Svgs.ViewIcon />
            </div>


        ];
    });

    return (
        <DefaultLayout>
            <div className="overflow-auto w-full">
                <h1 className="font-sans font-medium text-[32px] text-[#393838] mb-8">
                    All Zone{" "}
                </h1>
                <div className="bg-white p-6 w-full flex flex-col justify-start items-start">
                    <div className="w-full flex justify-between items-center">
                        <p className="text-start font-sans font-medium text-[#4C4A4A] text-[24px]">
                            All Zone
                        </p>
                        <span className="cursor-pointer">
                            <Svgs.UpArrow />
                        </span>
                    </div>
                    <div className="w-full h-[1px] bg-black mt-6 mb-8"></div>
                    <div className="w-full border border-[#e6e8ea] rounded-[10px] mt-8">
                        <CustomTable headers={headers} data={data} />
                    </div>
                    {/* <div className="flex gap-2 items-center mt-5">
            <Checkbox checked={selectAll} onChange={handleSelectAll} />
            <p className="font-medium text-[14px] text-black">Select All</p>
          </div> */}
                    {/* <button
              className="w-[143px] h-[37.61px] rounded-[4px] text-white font-normal text-[15px] mt-8"
              style={{
                background:
                  "linear-gradient(90deg, #3D68B0 1.67%, #84A8E6 47.17%, #3D68B0 100%)",
              }}
            >
              Delete Selected
            </button> */}
                </div>
            </div>
            <Modal
                title="Delete Zone"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                okText="Delete"
                okType="danger"
            >
                <p>Are you sure you want to delete this Zone?</p>
            </Modal>
            <ToastContainer position="top-right" autoClose={2000} />
        </DefaultLayout>
    );
};

export default AllZone;
