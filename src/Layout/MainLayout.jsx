import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Components/Sidebar";

const MainLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1  bg-gray-200 p-6  h-screen overflow-y-auto">
        <Outlet  />
      </div>
    </div>
  );
};

export default MainLayout;
