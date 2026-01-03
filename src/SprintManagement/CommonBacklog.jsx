import React, { useState, useEffect } from "react";
import {
    getGlobalBacklog,
    getGlobalSprints,
    assignIssuesToGlobalSprint,
    getIssueComments,
    IssueComments,
    getAllUsers,
} from "../API/projectAPI";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import toast from "react-hot-toast";
import BacklogModal from "../Modal/BacklogModal"; // ✅ modal import

const CommonBacklog = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIssues, setSelectedIssues] = useState([]);
    const [selectedSprint, setSelectedSprint] = useState("");
    const [sprints, setSprints] = useState([]);
    const [users, setUsers] = useState([])

    /* 🔥 MODAL RELATED STATES */
    const [modalIssue, setModalIssue] = useState(null);
    const [issueComments, setIssueComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const itemsPerPage = 10;
    useEffect(() => {
        const fetchIssues = async () => {
            try {
                setLoading(true);
                const data = await getGlobalBacklog();
                console.log(data, "API DATA");

                const taskOnly = data.filter(
                    (issue) => issue.type?.toLowerCase() === "task"
                );

                setIssues(taskOnly);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchIssues();
    }, []);


    useEffect(() => {
        const fetchSprints = async () => {
            try {
                const data = await getGlobalSprints();
                setSprints(data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSprints();
    }, []);

    const filteredIssues = issues.filter(
        (issue) =>
            issue.name.toLowerCase().includes(search.toLowerCase()) ||
            issue.type.toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredIssues.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const goNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const goPrev = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleCheckboxChange = (issueId) => {
        setSelectedIssues((prev) =>
            prev.includes(issueId)
                ? prev.filter((id) => id !== issueId)
                : [...prev, issueId]
        );
    };

    const handleAssignSprintClick = async () => {
        if (!selectedSprint) {
            toast.error("Please select a sprint");
            return;
        }

        const sprintId = selectedSprint;

        const issueIds = selectedIssues.filter((id) => id != null);

        if (issueIds.length === 0) {
            toast.error("Select at least one issue");
            return;
        }

        console.log("Assigning issues:", issueIds, "to sprint:", sprintId);

        try {
            await assignIssuesToGlobalSprint(sprintId, issueIds);

            setIssues((prev) =>
                prev.map((issue) =>
                    issueIds.includes(issue.id)
                        ? { ...issue, sprint_id: sprintId }
                        : issue
                )
            );

            setSelectedIssues([]);
            setSelectedSprint("");
            toast.success("Task assigned successfully");
        } catch (err) {
            console.error(err.response || err);
            toast.error("Failed to assign issues");
        }
    };



    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers(); // API call
                setUsers(data); // store array of users
            } catch (err) {
                console.error(err);
                toast.error("Failed to fetch users");
            }
        };

        fetchUsers();
    }, []);

    /* 🔥 NAME CLICK → MODAL OPEN */
    const openIssueModal = async (issue) => {
        setModalIssue(issue);
        try {
            const res = await getIssueComments(issue.id);
            setIssueComments(res || []);
        } catch (err) {
            console.error(err);
        }
    };

    /* 🔥 ADD COMMENT (REUSED IN MODAL) */
    const handleAddComment = async () => {
        if (!newComment.trim() || !modalIssue) return;

        try {
            await IssueComments(modalIssue.id, newComment);
            setNewComment("");
            const res = await getIssueComments(modalIssue.id);
            setIssueComments(res || []);
            toast.success("Comment added");
        } catch (err) {
            console.error(err);
            toast.error("Failed to add comment");
        }
    };

    if (loading) return <div className="text-black">Loading Lists...</div>;

    return (
        <div className="">
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl font-semibold">Lists</h1>
                <input
                    type="text"
                    placeholder="Search by name or type..."
                    className="px-4 py-2 rounded placeholder:text-gray-400 border outline-none"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                />
            </div>

            {currentItems.length === 0 ? (
                <p>No issues found.</p>
            ) : (
                <div className="overflow-x-auto rounded-2xl shadow-md">
                    <table className="w-full">
                        <thead className="bg-gray-400 text-white">
                            <tr>
                                <th className="px-6 py-3 text-center text-xs font-medium uppercase">
                                    Select
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium uppercase">
                                    SI No
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium uppercase">
                                    Project key
                                </th>

                                <th className="px-6 py-3 text-center text-xs font-medium uppercase">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium uppercase">
                                    Assign
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium uppercase">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium uppercase">
                                    Status
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-300">
                            {currentItems.map((issue, index) => (
                                <tr key={issue.id}>
                                    <td className="px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIssues.includes(issue.id)}
                                            onChange={() => handleCheckboxChange(issue.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-3 text-sm text-center">
                                        {startIndex + index + 1}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-center">
                                        {issue.project_key || issue.project?.key || "-"}
                                    </td>

                                    <td className="px-6 py-3 text-sm text-center">
                                        <p
                                            className="hover:underline cursor-pointer w-fit"
                                            onClick={() => openIssueModal(issue)}
                                        >
                                            {issue.name}
                                        </p>
                                    </td>

                                    <td className="px-6 py-3 text-sm text-center">
                                        {issue.assignee_id || "-" }
                                    </td>
                                    <td className="px-6 py-3 text-sm text-center">
                                        {issue.type}
                                    </td>
                                    <td className="px-6 py-3 text-sm text-center">
                                        {issue.status}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL */}
            {modalIssue && (
                <BacklogModal
                    modalIssue={modalIssue}
                    setModalIssue={setModalIssue}
                    issueComments={issueComments}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    users={users}
                    handleAddComment={handleAddComment}
                />
            )}

            <div className="flex items-center justify-end gap-2 mt-4">
                <select
                    value={selectedSprint}
                    onChange={(e) => setSelectedSprint(e.target.value)}
                    className="px-4 py-2 rounded border outline-none"
                >
                    <option value="">Select Sprint</option>
                    {sprints.map((sprint) => (
                        <option key={sprint.id} value={sprint.id}>
                            {sprint.name}
                        </option>
                    ))}
                </select>

                <button
                    onClick={handleAssignSprintClick}
                    className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 shadow"
                >
                    Assign Sprint
                </button>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-end mt-4 gap-4">
                    <button
                        onClick={goPrev}
                        disabled={currentPage === 1}
                        className="px-4 py-2 cursor-pointer rounded disabled:opacity-50"
                    >
                        <ChevronsLeft />
                    </button>
                    <span className="px-4 py-2">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={goNext}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 cursor-pointer rounded disabled:opacity-60"
                    >
                        <ChevronsRight />
                    </button>
                </div>
            )}
        </div>
    );
};

export default CommonBacklog;
