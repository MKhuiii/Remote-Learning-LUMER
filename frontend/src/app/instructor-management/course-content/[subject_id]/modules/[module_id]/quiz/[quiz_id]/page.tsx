export default function ModuleQuizPage() {
  const quizId = "Q002"; // giả lập
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Chi tiết Quiz {quizId}</h1>
      <p>
        Danh sách câu hỏi, điểm số, cấu hình quiz trong Module sẽ hiển thị ở
        đây.
      </p>
    </div>
  );
}
