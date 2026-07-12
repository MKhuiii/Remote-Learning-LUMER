import { useState } from "react";

interface Module {
  module_id: string;
  title: string;
}

export default function ModuleManager({ subjectId }: { subjectId: string }) {
  const [modules, setModules] = useState<Module[]>([]);
  const [newTitle, setNewTitle] = useState("");

  const addModule = () => {
    const newModule = { module_id: Math.random().toString(), title: newTitle };
    setModules([...modules, newModule]);
    setNewTitle("");
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Modules</h2>
      <ul className="mb-3">
        {modules.map((m) => (
          <li key={m.module_id} className="border p-2 rounded mb-2">
            {m.title}
          </li>
        ))}
      </ul>
      <input
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        placeholder="Tên Module"
        className="border p-2 rounded mr-2"
      />
      <button
        onClick={addModule}
        className="bg-green-600 text-white px-3 py-1 rounded"
      >
        Thêm Module
      </button>
    </div>
  );
}
