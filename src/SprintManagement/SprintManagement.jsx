import { Toaster } from "react-hot-toast";
import { NavLink, Outlet } from "react-router-dom";

const SprintManagement = () => {
  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-semibold mb-6">
        Sprint Management
      </h1>

      {/* Tabs */}
      <div className="flex gap-6 border-b mb-6">
        <Tab to="sprints" label="Sprints" />
        <Tab to="board" label="Board" />
        <Tab to="backlog" label="Product Backlog Items" />
        <Tab to="list" label="Work Items" />
        <Tab to="completed" label="Completed Sprint" />
      </div>

      {/* TAB CONTENT */}
      <Outlet />
    </div>
  );
};

const Tab = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative px-4 py-3 text-sm font-medium
      ${isActive
        ? "text-blue-600"
        : "text-gray-500 hover:text-gray-800"
      }`
    }
  >
    {({ isActive }) => (
      <>
        {label}
        <span
          className={`absolute left-0 -bottom-[1px] h-[2px] w-full
          ${isActive ? "bg-blue-600" : "bg-transparent"
            }`}
        />
      </>
    )}
  </NavLink>
);

export default SprintManagement;
