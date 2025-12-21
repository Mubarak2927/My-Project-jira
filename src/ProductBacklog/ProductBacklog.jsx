import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Epic from "./Epic";
import { createEpic, getEpic, getIssues, createIssues } from "../API/ProjectAPI";
import toast, { Toaster } from "react-hot-toast";
import Backlog from "./Backlog";

const ProductBacklog = () => {
  const { project } = useOutletContext();

  const [epics, setEpics] = useState([]);
  const [selectedEpic, setSelectedEpic] = useState(null);

  // ⚡ Backlog state
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: "task",
    title: "",
    description: "",
    epicId: "",
    priority: "",
    storyPoints: "",
  });

  // Load epics
  useEffect(() => {
    if (project?.id) loadEpics();
  }, [project]);

  const loadEpics = async () => {
    try {
      const data = await getEpic(project.id);
      setEpics(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Load issues
  useEffect(() => {
    if (project?.id) fetchIssues();
  }, [project]);

  const fetchIssues = async () => {
    try {
      const data = await getIssues(project.id);
      setIssues(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle epic creation
  const handleEpicCreate = async (epicData) => {
    try {
      const payload = {
        ...epicData,
        project_id: project.id,
      };
      const newEpic = await createEpic(payload);
      toast.success("Epic Created Successfully");
      setEpics((prev) => [...prev, newEpic]);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle adding issue
  const handleAdd = async () => {
    if (!form.title) return alert("Title required");

    setLoading(true);
    try {
      const res=await createIssues({
        project_id: project.id,
        name: form.title,
        description: form.description,
        type: form.type.toLowerCase(),
        priority: form.priority.toLowerCase(),
       epic_id: form.epicId || null, 
        story_points: form.type === "story" ? form.storyPoints : null,
      });
      console.log('create task' ,res)
      toast.success("Task Created Successfully");


      setForm({
        type: "task",
        title: "",
        description: "",
        epicId: "",
        priority: "",
        storyPoints: "",
      });

      fetchIssues();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <Toaster position="top-right" />
      </div>

      <div className="space-y-6 flex gap-6">
        <Epic
          epics={epics}
          onCreate={handleEpicCreate}
          selectedEpic={selectedEpic}
          onSelectEpic={setSelectedEpic}
        />

        <Backlog
          projectId={project?.id}
          epics={epics}
          selectedEpic={selectedEpic}
          issues={issues}
          form={form}
          setForm={setForm}
          handleAdd={handleAdd}
          loading={loading}
        />
      </div>
    </>
  );
};

export default ProductBacklog;
