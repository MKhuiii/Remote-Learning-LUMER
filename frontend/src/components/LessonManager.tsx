import { useState } from "react";

interface Lesson {
  lesson_id: string;
  title: string;
}

export default function LessonManager({
  subjectId,
  moduleId,
}: {
  subjectId: string;
  moduleId: string;
}) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [newTitle, setNewTitle] = useState("");

  const addLesson = () => {
    const newLesson = { lesson_id: Math.random().toString(), title: newTitle };
    setLessons([...lessons, newLesson]);
    setNewTitle("");
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Lessons</h2>
      <ul className="mb-3">
        {lessons.map((l) => (
          <li key={l.lesson_id} className="border p-2 rounded mb-2">
            {l.title}
          </li>
        ))}
      </ul>
      <input
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        placeholder="Tên Lesson"
        className="border p-2 rounded mr-2"
      />
      <button
        onClick={addLesson}
        className="bg-purple-600 text-white px-3 py-1 rounded"
      >
        Thêm Lesson
      </button>
    </div>
  );
}
