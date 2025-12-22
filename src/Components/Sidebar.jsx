import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DigitalyLogo from "../assets/Digi.png";
import {
  FolderKanban,
  CalendarPlus,
  Users,
  LogOut,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Home,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(true);
  const isHomeActive = location.pathname === "/home";

  const isProjectManagementActive =
    location.pathname === "/projects" ||
    location.pathname.startsWith("/projects/");

  const activeProjectId = location.pathname.startsWith("/projects/")
    ? location.pathname.split("/")[2]
    : null;

  // useEffect(() => {
  //   if (activeProjectId) setShowProjects(true);
  // }, [activeProjectId]);

  return (
    <>
      <div
        className={`h-screen bg-[#0f0f10] text-gray-300 flex flex-col
        transition-all duration-300
        ${collapsed ? "w-[72px]" : "w-[260px]"}`}
      >
        {/* Toggle */}
        <div className="flex justify-end p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            {collapsed ? <ChevronsRight /> : <ChevronsLeft />}
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 px-4 mb-6">
          <div className=" w-10 h-10 rounded-xl flex items-center justify-center">
            <img src={DigitalyLogo} alt="" />
          </div>
          {!collapsed && (
            <h1 className="text-xl font-semibold text-white">Digitaly</h1>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-2">
          <SidebarItem
            icon={<Home />}
            label="Home"
            collapsed={collapsed}
            active={isHomeActive}
            onClick={() => navigate("/home")}
          />

          <SidebarItem
            icon={<FolderKanban />}
            label="Projects Management"
            collapsed={collapsed}
            active={isProjectManagementActive}
            onClick={() => navigate("/projects")}
          />

          <SidebarItem
            icon={<CalendarPlus />}
            label="Sprints"
            collapsed={collapsed}
          />

          <SidebarItem icon={<Users />} label="Teams" collapsed={collapsed} />
        </nav>

        {/* Logout */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 m-3 px-3 py-2
          rounded-xl bg-red-600 text-white justify-center"
        >
          <LogOut size={18} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </>
  );
};

const SidebarItem = ({ icon, label, collapsed, onClick, active }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-3
    rounded-xl w-full
    ${active ? "bg-blue-600 text-white" : "hover:bg-gray-800"}`}
  >
    {icon}
    {!collapsed && <span>{label}</span>}
  </button>
);
export default Sidebar;
