import React, { useState } from "react";
import { useParams } from "react-router-dom";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div className="p-6">
      {/* Project Header */}
      <h1 className="text-2xl font-semibold mb-6">
        Project ID: {projectId}
      </h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        {["summary", "backlog", "board"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize
              ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-black"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white p-4 rounded-xl shadow">
        {activeTab === "summary" && <Summary />}
        {activeTab === "backlog" && <Backlog />}
        {activeTab === "board" && <Board />}
      </div>
    </div>
  );
};

export default ProjectDetails;
