import React, { useState } from "react";
import Sidebar from "./Sidebar";
import HeaderComponent from "./HeaderComponent";

const DefaultLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-gray-100">
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isCustomerView={true}
        />

        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <HeaderComponent
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 responsive-cls">
              {children}
            </div>
          </main>
          <div className="bg-[#E3E5E6] shadow-header-custom h-[62px] w-full flex items-center justify-center  mt-auto text-xs "></div>
        </div>
      </div>
    </div>
  );
};

export default DefaultLayout;
