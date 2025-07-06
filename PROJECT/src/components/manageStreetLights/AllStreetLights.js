import React, { useEffect, useState } from "react";
import { Modal } from "antd";
import CustomTable from "../common/CustomTable";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DefaultLayout from "../header";
import Svgs from "../../assets/svgs";
import { deleteLight, getAllLights } from "../../services/street-light";
import { useNavigate } from "react-router-dom";
import Map from "./Map";
import io from "socket.io-client";

// إنشاء اتصال Socket.io
const socket = io("http://localhost:8900");

const AllStreetLights = () => {
  const [lights, setLights] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [refetch, setRefetch] = useState(0);

  const [isOn, setIsOn] = useState(false);

  const handleToggle = () => {
    setIsOn((prevState) => !prevState);
  };

  const navigate = useNavigate();

  useEffect(() => {
    // الاستماع لتحديث البيانات من الخادم عبر الـ Socket.io
    socket.on("dataUpdated", () => {
      console.log("Data updated, refetching...");
      setRefetch((prev) => prev + 1);
    });

    // تنظيف الاتصال
    return () => {
      socket.off("dataUpdated");
    };
  }, []);

  useEffect(() => {
    // جلب جميع بيانات الإضاءة
    getAllLights()
      .then((res) => {
        if (res && res.data) {
          setLights(res.data);
        } else {
          console.error("Unexpected response structure:", res);
          toast.error("Failed to fetch streetlights. Please try again later.");
        }
      })
      .catch((error) => {
        console.error("Error fetching streetlights:", error);
        toast.error("An error occurred while fetching streetlights.");
      });
  }, [refetch]);

  // تعريف رؤوس الجدول
  const headers = [
    "ID",
    "Status",
    "Zone",
    "Location",
    "On / Off",
    "Brightness",
    "Delete",
    "Update",
    "Zone Setting",
    "Controlling Profile",
  ];

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    try {
      await deleteLight(selectedRow._id);
      setRefetch((prev) => prev + 1);
      setIsModalOpen(false);
      toast.success("Street light deleted successfully");
    } catch (error) {
      toast.error("Failed to delete street light");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const data = lights.map((row) => {
    return [
      <div className="flex items-center gap-2">
        <p>{row.lightid}</p>
      </div>,
      row.status,
      row?.zone,
      <p>{row.address}</p>,
      <p>{row?.isOn ? "ON" : "OFF"}</p>,
      `${row.brightness}%`,
      <div
        style={{ cursor: "pointer" }}
        onClick={() => {
          setSelectedRow(row);
          showModal();
        }}
      >
        <Svgs.DeleteIcon />
      </div>,
      <div
        style={{ cursor: "pointer" }}
        onClick={() =>
          navigate("/update-lights", {
            state: {
              light: row,
            },
          })
        }
      >
        <Svgs.EditIcon />
      </div>,
      <p>{row?.applyZoneSetting ? "Applied" : "Not Applied"}</p>,
      <p>{row?.applyControllingSetting ? "Applied" : "Not Applied"}</p>,
    ];
  });

  return (
    <DefaultLayout>
      <div className="w-full overflow-auto">
        <div className="flex items-center justify-between">
          <h1 className="font-sans font-medium text-[32px] text-[#393838] mb-8">
            Manage Streetlight{" "}
            <span className="text-base text-[#6C6A6A]">/All Streetlight</span>
          </h1>
          <div className="flex items-center justify-center ">
            <div className="flex flex-col items-end gap-8 md:flex-row">
              <div className="flex flex-col items-start">
                <label className="text-black text-[20px] font-semibold mt-1 text-left">
                  Map View
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
        </div>
        <div className="flex flex-col items-start justify-start w-full p-6 mt-3 bg-white">
          <div className="flex items-center justify-between w-full">
            <p className="text-start font-sans font-medium text-[#4C4A4A] text-[24px]">
              All Streetlight
            </p>
            <span className="cursor-pointer">
              <Svgs.UpArrow />
            </span>
          </div>
          <div className="w-full h-[1px] bg-black mt-6 mb-8"></div>
          <div className="w-full border border-[#e6e8ea] rounded-[10px] mt-8">
            {lights.length === 0 ? (
              <p>No streetlights available to display on the map.</p>
            ) : isOn ? (
              <Map
                data={lights.map((item) => ({
                  lightid: item.lightid,
                  status: item.status,
                  zone: item.zone,
                  brightness: item.brightness,
                  location: item.location?.coordinates,
                  isOn: item.isOn, // تمرير حالة التشغيل
                }))}
              />
            ) : (
              <CustomTable headers={headers} data={data} />
            )}
          </div>
        </div>
      </div>
      <Modal
        title="Delete Street light"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Delete"
        okType="danger"
      >
        <p>Are you sure you want to delete this street light?</p>
      </Modal>
      <ToastContainer limit={1} position="top-right" autoClose={2000} />
    </DefaultLayout>
  );
};

export default AllStreetLights;
