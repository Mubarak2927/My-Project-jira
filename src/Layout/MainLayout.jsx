import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Sidebar";

const MainLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1  bg-gray-200 p-6 overflowy-y-auto h-[100vh]">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
