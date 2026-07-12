export default function LessonPage() {
  const lessonId = "L001"; // giả lập
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Chi tiết Lesson {lessonId}</h1>
      <p>Video, nội dung, quiz gắn trong Lesson sẽ hiển thị ở đây.</p>
    </div>
  );
}
