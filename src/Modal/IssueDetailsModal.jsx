import React from "react";
import { X } from "lucide-react";

const IssueDetailsModal = ({ issue, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start overflow-y-auto">

            {/* Modal Container */}
            <div className="bg-white w-full max-w-6xl mt-10 rounded-lg shadow-xl relative">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div className="flex items-center gap-3">
                        <span className="text-sm px-2 py-1 rounded bg-blue-100 text-blue-700">
                            {issue.type}
                        </span>
                        <h2 className="text-xl font-semibold">
                            {issue.name}
                        </h2>
                    </div>

                    <button onClick={onClose}>
                        <X className="w-6 h-6 text-gray-500 hover:text-black" />
                    </button>
                </div>

                {/* Body */}
                <div className="grid grid-cols-12 gap-6 p-6">

                    {/* LEFT SECTION */}
                    <div className="col-span-8 space-y-6">

                        {/* Description */}
                        <div>
                            <h3 className="font-semibold mb-2">Description</h3>
                            <div className="min-h-[120px] border rounded p-3 text-sm text-gray-600">
                                {issue.description || "No description added"}
                            </div>
                        </div>

                        {/* Discussion */}
                        <div>
                            <h3 className="font-semibold mb-2">Discussion</h3>
                            <textarea
                                placeholder="Add a comment..."
                                className="w-full min-h-[100px] border rounded p-3 text-sm outline-none"
                            />
                            <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                Comment
                            </button>
                        </div>
                    </div>

                    {/* RIGHT SECTION */}
                    <div className="col-span-4 space-y-4">

                        <InfoRow label="Status" value={issue.status} />
                        <InfoRow label="Project Key" value={issue.project_key || "-"} />
                        <InfoRow label="Sprint" value={issue.sprint?.name || "Backlog"} />
                        <InfoRow label="Priority" value={issue.priority || "2"} />
                        <InfoRow label="Created At" value={issue.created_at || "-"} />

                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({ label, value }) => (
    <div className="border rounded p-3">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium">{value}</p>
    </div>
);

export default IssueDetailsModal;
