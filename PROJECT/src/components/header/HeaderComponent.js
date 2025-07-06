import React, { useContext } from "react";
import AuthContext from "../../hooks/AuthContext"; // <-- Import AuthContext to access user data
import Svgs from "../../assets/svgs";

const HeaderComponent = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useContext(AuthContext); // <-- Get the logged-in user

  return (
    <header className="sticky top-0 z-[100] flex w-full bg-[#E3E5E6] shadow-header-custom ">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* <!-- Hamburger Toggle BTN --> */}
          <button
            aria-controls="sidebar"
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm"
          >
            <Svgs.HamburgIcon />
          </button>
          {/* <!-- Hamburger Toggle BTN --> */}
        </div>

        <div className="flex gap-1 items-center">
          <p className="font-sans font-semibold text-[14px] text-[#565656]">
            {user?.username || "Guest"}{" "}
            {/* <-- Display username or Guest if not available */}
          </p>
          <span>
            <Svgs.SmallDropDown />
          </span>
        </div>
      </div>
    </header>
  );
};

export default HeaderComponent;
