import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout & Pages
import Login from "./Pages/Login";
import MainLayout from "./Layout/MainLayout";
import Home from "./Pages/Home";

// Project Management
import ProjectManagement from "./Pages/ProjectManagement";
import EmployeeMangement from "./Pages/EmployeeMangement";
import MyProfile from "./Pages/MyProfile";
import Docs from "./Pages/Docs";

// Project Details Layout
import ProjectLayout from "./ProjectPages/ProjectDetails";
import ProfileSummary from "./ProjectPages/ProfileSummary";
import BoardView from "./ProjectPages/BoardView";
import ProductBacklog from "./ProductBacklog/ProductBacklog";
import Lists from "./ProjectPages/Lists";
import Goals from "./ProjectPages/Goals";
import Sprint from "./ProductBacklog/Sprint";
import CompleteSprint from "./ProductBacklog/CompleteSprint";

// Modals
import WorkItemCreate from "./Modal/WorkItemCreate";
import EpicCreate from "./Modal/EpicCreate";

// Recycle Bin
import BacklogBin from "./RecycleBin/BacklogBin";
import RecycleBin from "./RecycleBin/RecycleBin";

// Global Sprint Management
import SprintManagement from "./SprintManagement/SprintManagement";
import CommonSprints from "./SprintManagement/CommonSprints";
import CommomLists from "./SprintManagement/CommomLists";
import CommonBoard from "./SprintManagement/CommonBoard";
import CommonCompleteSprint from "./SprintManagement/CommonCompleteSprint";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* MainLayout wraps all authenticated pages */}
        <Route element={<MainLayout />}>

          {/* Home */}
          <Route path="/home" element={<Home />} />

          {/* Projects */}
          <Route path="/projects" element={<ProjectManagement />} />

          {/* Employees */}
          <Route path="/employees" element={<EmployeeMangement />} />
          <Route path="/employees/me" element={<MyProfile />} />

          {/* Recycle Bin */}
          <Route path="/recycle-bin" element={<RecycleBin />} />
          <Route path="/backlog-bin" element={<BacklogBin />} />

          {/* Global Docs */}
          <Route path="/docs" element={<Docs />} />

          {/* Global Sprint Management (Sidebar Click) */}
          <Route path="/sprints" element={<SprintManagement />}>
            <Route index element={<Navigate to="sprints" replace />} />
            <Route path="sprints" element={<CommonSprints />} />
            <Route path="board" element={<CommonBoard />} />
            <Route path="list" element={<CommomLists />} />
            <Route path="completed" element={<CommonCompleteSprint />} />
          </Route>

          {/* Project Details */}
          <Route path="/projects/:projectId" element={<ProjectLayout />}>
            <Route index element={<Navigate to="summary" replace />} />
            <Route path="summary" element={<ProfileSummary />} />
            <Route path="backlog" element={<ProductBacklog />} />

            {/* Backlog Bin inside project */}
            <Route path="backlog-bin" element={<BacklogBin />} />

            <Route path="board" element={<BoardView />} />
            <Route path="lists" element={<Lists />} />
            <Route path="goals" element={<Goals />} />
            <Route path="sprints" element={<Sprint />} />
            <Route path="completesprint" element={<CompleteSprint />} />

            {/* Modals */}
            <Route path="work-items/new/:type" element={<WorkItemCreate />} />
            <Route path="work-items/new/:type" element={<EpicCreate />} />

            {/* Docs inside project */}
            <Route path="docs" element={<Docs />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
