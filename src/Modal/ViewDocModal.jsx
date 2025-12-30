import React from "react";
import { X, Download } from "lucide-react";

const BASE_URL = "https://pmtoolapidev.digitaly.live/api/v1"; 

const ViewDocModal = ({ doc, onClose }) => {
  if (!doc) return null;

  const fileUrl = `${BASE_URL}/${doc.file_path}`;

  const isPDF = doc.content_type === "application/pdf";
  const isImage = doc.content_type?.startsWith("image/");

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-[85%] h-[85%] rounded-2xl p-4 relative shadow-xl flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="font-bold text-lg truncate">{doc.name}</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 mt-3 overflow-hidden">

          {/* ✅ PDF */}
          {isPDF && (
            <iframe
              src={fileUrl}
              title={doc.name}
              className="w-full h-full rounded-lg border"
            />
          )}

          {/* ✅ Image */}
          {isImage && (
            <div className="flex justify-center items-center h-full">
              <img
                src={fileUrl}
                alt={doc.name}
                className="max-h-full max-w-full rounded-lg"
              />
            </div>
          )}

          {/* ❌ Others */}
          {!isPDF && !isImage && (
            <div className="flex flex-col justify-center items-center h-full gap-4 text-gray-600">
              <p>Preview not available for this file type</p>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600"
              >
                <Download size={18} />
                Open / Download File
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ViewDocModal;
