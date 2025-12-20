import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Sidebar";

const MainLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 h-screen bg-gray-200 p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
