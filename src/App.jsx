import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./Pages/Login";
import MainLayout from "./Layout/MainLayout";
import Home from "./Pages/Home";

// Project Management

// Project Details Layout
import ProjectLayout from "./ProjectPages/ProjectDetails";
import ProfileSummary from "./ProjectPages/ProfileSummary";
import BoardView from "./ProjectPages/BoardView";
import ProductBacklog from "./ProductBacklog/ProductBacklog";
import Lists from "./ProjectPages/Lists";
import Goals from "./ProjectPages/Goals";
import Sprint from "./ProductBacklog/Sprint";
import ProjectManagement from "./Pages/ProjectManagement";
import CompleteSprint from "./ProductBacklog/CompleteSprint";
import WorkItemCreate from "./Modal/WorkItemCreate";
import EmployeeMangement from "./Pages/EmployeeMangement";
import EpicCreate from "./Modal/EpicCreate";
import MyProfile from "./Pages/MyProfile";
import Docs from "./Pages/Docs";
import BacklogBin from "./RecycleBin/BacklogBin";
import RecycleBin from "./RecycleBin/RecycleBin";
import SprintManagemnt from "./Pages/SprintManagement";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

       <Route element={<MainLayout />}>
  <Route path="/home" element={<Home />} />

  <Route path="/projects" element={<ProjectManagement />} />
  <Route path="/sprints" element={<SprintManagemnt  />} />
  <Route path="/employees" element={<EmployeeMangement />} />
  <Route path="/employees/me" element={<MyProfile />} />
<Route path="/recycle-bin" element={<RecycleBin />} />
 <Route path="/backlog-bin" element={<BacklogBin />} />

  {/* ✅ GLOBAL DOCS */}
  <Route path="/docs" element={<Docs />} />

  <Route path="/projects/:projectId" element={<ProjectLayout />}>
  <Route index element={<Navigate to="summary" replace />} />

  <Route path="summary" element={<ProfileSummary />} />
  <Route path="backlog" element={<ProductBacklog />} />

  {/* 🔥 BACKLOG BIN MUST BE HERE */}
  <Route path="backlog-bin" element={<BacklogBin />} />

  <Route path="board" element={<BoardView />} />
  <Route path="lists" element={<Lists />} />
  <Route path="goals" element={<Goals />} />
  <Route path="sprints" element={<Sprint />} />
  <Route path="docs" element={<Docs />} />

  

  <Route path="completesprint" element={<CompleteSprint />} />
  <Route path="work-items/new/:type" element={<WorkItemCreate />} />
  <Route path="work-items/new/:type" element={<EpicCreate />} />
</Route>

</Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;
