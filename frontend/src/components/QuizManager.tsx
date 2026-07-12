import { useState } from "react";

interface Quiz {
  quiz_id: string;
  title: string;
}

export default function QuizManager({
  subjectId,
  moduleId,
}: {
  subjectId: string;
  moduleId?: string;
}) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [newTitle, setNewTitle] = useState("");

  const addQuiz = () => {
    const newQuiz = { quiz_id: Math.random().toString(), title: newTitle };
    setQuizzes([...quizzes, newQuiz]);
    setNewTitle("");
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Quizzes</h2>
      <ul className="mb-3">
        {quizzes.map((q) => (
          <li key={q.quiz_id} className="border p-2 rounded mb-2">
            {q.title}
          </li>
        ))}
      </ul>
      <input
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        placeholder="Tên Quiz"
        className="border p-2 rounded mr-2"
      />
      <button
        onClick={addQuiz}
        className="bg-blue-600 text-white px-3 py-1 rounded"
      >
        Thêm Quiz
      </button>
    </div>
  );
}
