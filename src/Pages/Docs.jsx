import React, { useState } from "react";
import { Upload, Folder, FileText } from "lucide-react";

const Docs = () => {
  const [docs, setDocs] = useState({});
  const [folderName, setFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "application/pdf" || !folderName.trim()) return;

    setDocs((prev) => ({
      ...prev,
      [folderName]: [...(prev[folderName] || []), file],
    }));

    setSelectedFolder(folderName);
    setFolderName("");
  };

  return (
    <div className="h-[93vh] rounded-2xl bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6 ">
        <h1 className="text-3xl font-bold text-gray-800">📂 Documents</h1>
       
      </div>

      {/* Upload Card */}
      <div className="bg-white p-5 rounded-xl shadow-lg flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Enter folder name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-2 rounded-lg cursor-pointer text-sm font-medium">
          <Upload size={18} />
          Upload PDF
          <input
            type="file"
            accept="application/pdf"
            hidden
            onChange={handleUpload}
          />
        </label>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Folders Section */}
        <div className="col-span-4">
          <h2 className="text-gray-700 font-semibold mb-3">Folders</h2>

          {Object.keys(docs).length === 0 && (
            <div className="bg-white rounded-xl p-4 shadow text-gray-400 text-sm">
              No folders yet. Upload a PDF to create a folder.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {Object.keys(docs).map((folder) => (
              <div
                key={folder}
                onClick={() => setSelectedFolder(folder)}
                className={`bg-white rounded-xl p-4 flex items-center justify-between cursor-pointer transition transform hover:-translate-y-1 shadow-sm
                ${
                  selectedFolder === folder
                    ? "border-2 border-blue-500 shadow-md"
                    : "border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Folder className="text-blue-600" />
                  <span className="font-medium text-gray-800">{folder}</span>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                  {docs[folder].length}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Files Section */}
        <div className="col-span-8">
          {!selectedFolder ? (
            <div className="bg-white p-6 rounded-xl shadow text-gray-500 text-sm flex items-center justify-center h-60">
              Select a folder to view PDFs
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-gray-700 font-semibold mb-4">
                Files in{" "}
                <span className="text-blue-600">{selectedFolder}</span>
              </h2>

              <div className="grid grid-cols-3 gap-5">
                {docs[selectedFolder].map((file, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 flex items-center gap-3 hover:shadow-md transition transform hover:-translate-y-1"
                  >
                    <FileText className="text-red-500" size={22} />
                    <span className="text-gray-700 text-sm truncate">
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Docs;
