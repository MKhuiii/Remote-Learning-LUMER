"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  BookOpen,
  DollarSign,
} from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
  image: string;
  price: number;
  duration: number;
  tag: string;
  status: "Hoạt động" | "Nháp" | "Ẩn";
}

export default function CourseManagementPage() {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: "Lập trình Java cơ bản",
      description: "Học Java từ cơ bản đến nâng cao",
      image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
      price: 499000,
      duration: 180,
      tag: "Java",
      status: "Hoạt động",
    },
    {
      id: 2,
      title: "ReactJS Master",
      description: "Xây dựng ứng dụng React hiện đại",
      image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
      price: 699000,
      duration: 365,
      tag: "Frontend",
      status: "Nháp",
    },
  ]);

  const [keyword, setKeyword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  const [form, setForm] = useState<Course>({
    id: 0,
    title: "",
    description: "",
    image: "",
    price: 0,
    duration: 0,
    tag: "",
    status: "Hoạt động",
  });

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(keyword.toLowerCase()),
  );

  const handleSubmit = () => {
    if (editing) {
      setCourses(courses.map((c) => (c.id === editing.id ? form : c)));
    } else {
      setCourses([
        ...courses,
        {
          ...form,
          id: Date.now(),
        },
      ]);
    }

    resetForm();
  };

  const resetForm = () => {
    setShowModal(false);
    setEditing(null);

    setForm({
      id: 0,
      title: "",
      description: "",
      image: "",
      price: 0,
      duration: 0,
      tag: "",
      status: "Hoạt động",
    });
  };

  const handleEdit = (course: Course) => {
    setEditing(course);
    setForm(course);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc muốn xóa khóa học?")) {
      setCourses(courses.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs">
          <h1 className="text-lg font-black text-gray-900">Quản lý Khóa học</h1>

          <p className="text-xs text-gray-500 mt-1">
            Quản lý toàn bộ khóa học trên hệ thống LUMER
          </p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <BookOpen className="text-[#0066FF]" />

            <p className="text-[11px] text-gray-400 uppercase font-black mt-2">
              Tổng khóa học
            </p>

            <h2 className="text-2xl font-black text-[#0066FF]">
              {courses.length}
            </h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <DollarSign className="text-green-600" />

            <p className="text-[11px] text-gray-400 uppercase font-black mt-2">
              Tổng giá trị
            </p>

            <h2 className="text-2xl font-black text-green-600">
              {courses.reduce((sum, c) => sum + c.price, 0).toLocaleString()}đ
            </h2>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <BookOpen className="text-purple-600" />

            <p className="text-[11px] text-gray-400 uppercase font-black mt-2">
              Đang hoạt động
            </p>

            <h2 className="text-2xl font-black text-purple-600">
              {courses.filter((c) => c.status === "Hoạt động").length}
            </h2>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />

            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm khóa học..."
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-black"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#0066FF] hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
          >
            <Plus size={18} />
            Thêm khóa học
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden text-black">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="p-4 text-left text-xs">Khóa học</th>
                <th className="p-4 text-left text-xs">Tag</th>
                <th className="p-4 text-left text-xs">Giá</th>
                <th className="p-4 text-left text-xs">Thời hạn</th>
                <th className="p-4 text-left text-xs">Trạng thái</th>
                <th className="p-4 text-left text-xs">Thao tác</th>
              </tr>
            </thead>

            <tbody className="text-black">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="border-b">
                  <td className="p-4">
                    <div className="flex gap-3">
                      <img
                        src={course.image}
                        alt=""
                        className="w-20 h-14 rounded-lg object-cover"
                      />

                      <div>
                        <h3 className="font-bold text-sm">{course.title}</h3>

                        <p className="text-xs text-gray-500">
                          {course.description}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td>{course.tag}</td>

                  <td>{course.price.toLocaleString()}đ</td>

                  <td>{course.duration} ngày</td>

                  <td>
                    <span className="bg-blue-50 text-[#0066FF] px-2 py-1 rounded-md text-xs font-bold">
                      {course.status}
                    </span>
                  </td>

                  <td>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(course)}
                        className="text-[#0066FF]"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(course.id)}
                        className="text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 text-black">
            <div className="bg-white w-full max-w-2xl rounded-2xl p-6">
              <h2 className="font-black text-lg mb-5">
                {editing ? "Cập nhật khóa học" : "Thêm khóa học"}
              </h2>

              <div className="space-y-4">
                {/* Tên khóa học */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên khóa học
                  </label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        title: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#0066FF] focus:outline-none"
                  />
                </div>

                {/* Mô tả */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mô tả khóa học
                  </label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#0066FF] focus:outline-none"
                  />
                </div>

                {/* Ảnh */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL ảnh đại diện
                  </label>
                  <input
                    value={form.image}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        image: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#0066FF] focus:outline-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Giá */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Giá khóa học (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price: Number(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#0066FF] focus:outline-none"
                    />
                  </div>

                  {/* Thời hạn */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Thời hạn học (ngày)
                    </label>
                    <input
                      type="number"
                      value={form.duration}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          duration: Number(e.target.value),
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#0066FF] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Tag */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Danh mục / Tag
                  </label>
                  <input
                    value={form.tag}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        tag: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#0066FF] focus:outline-none"
                  />
                </div>

                {/* Trạng thái */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trạng thái khóa học
                  </label>

                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as Course["status"],
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-[#0066FF] focus:outline-none"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Nháp">Nháp</option>
                    <option value="Ẩn">Ẩn</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 border rounded-xl"
                >
                  Hủy
                </button>

                <button
                  onClick={handleSubmit}
                  className="bg-[#0066FF] text-white px-5 py-2 rounded-xl font-bold"
                >
                  {editing ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
