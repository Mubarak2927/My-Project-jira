import React, { useState } from "react";
import toast from "react-hot-toast";
import { createSprint } from "../API/ProjectAPI";
import { useOutletContext } from "react-router";

const Sprint = ({ onCreated }) => {
  const { project } = useOutletContext();

  const [form, setForm] = useState({
    name: "",
    goal: "",
    start_date: "",
    end_date: "",
  });

  const setDuration = (days) => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + days);

    setForm({
      ...form,
      start_date: start.toISOString().split("T")[0],
      end_date: end.toISOString().split("T")[0],
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    if (!form.name || !form.start_date || !form.end_date) {
      toast.error("Sprint name & dates required da 😑");
      return;
    }

    const payload = {
      project_id: project._id,
      name: form.name,
      goal: form.goal,
      start_date: new Date(form.start_date)
        .toISOString()
        .split(".")[0],
      end_date: new Date(form.end_date)
        .toISOString()
        .split(".")[0],
    };

    try {
      await createSprint(payload);
      toast.success("Sprint created successfully 🚀");
      onCreated && onCreated();
    } catch (err) {
      console.error(err?.response?.data || err);
      toast.error("Sprint create failed ❌");
    }
  };

  return (
    <div className="bg-zinc-900 p-5 rounded-xl text-white max-w-md">
      <h2 className="text-xl font-semibold mb-4">Create Sprint</h2>

      <input
        type="text"
        name="name"
        placeholder="Sprint Name"
        value={form.name}
        onChange={handleChange}
        className="w-full p-2 mb-3 rounded bg-zinc-800"
      />

      <textarea
        name="goal"
        placeholder="Sprint Goal"
        value={form.goal}
        onChange={handleChange}
        className="w-full p-2 mb-3 rounded bg-zinc-800"
      />

      <div className="flex gap-2 mb-4">
        <button onClick={() => setDuration(7)} className="px-3 py-1 bg-blue-600 rounded">
          Week 1
        </button>
        <button onClick={() => setDuration(14)} className="px-3 py-1 bg-green-600 rounded">
          Week 2
        </button>
        <button onClick={() => setDuration(28)} className="px-3 py-1 bg-purple-600 rounded">
          Week 4
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="date"
          name="start_date"
          value={form.start_date}
          onChange={handleChange}
          className="w-1/2 p-2 rounded bg-zinc-800"
        />
        <input
          type="date"
          name="end_date"
          value={form.end_date}
          onChange={handleChange}
          className="w-1/2 p-2 rounded bg-zinc-800"
        />
      </div>

      <button
        onClick={handleCreate}
        className="w-full bg-orange-600 py-2 rounded font-semibold"
      >
        Create Sprint
      </button>
    </div>
  );
};

export default Sprint;
