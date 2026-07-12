import Link from "next/link";

interface Subject {
  subject_id: string;
  title: string;
}

export default function SubjectDashboard() {
  const subjects: Subject[] = [
    { subject_id: "S001", title: "HTML & CSS" },
    { subject_id: "S002", title: "JavaScript" },
  ];
  const instructorSubjects = ["S001"]; // giả lập giảng viên được phân công

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý Subject</h1>
      <div className="grid grid-cols-2 gap-4">
        {subjects
          .filter((s) => instructorSubjects.includes(s.subject_id))
          .map((subject) => (
            <div key={subject.subject_id} className="border p-4 rounded shadow">
              <h3 className="font-semibold">{subject.title}</h3>
              <Link
                href={`/instructor-management/subject-content/${subject.subject_id}`}
                className="mt-2 inline-block bg-blue-500 text-white px-3 py-1 rounded"
              >
                Quản lý Subject
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
}
