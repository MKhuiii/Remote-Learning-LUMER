'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import VideoTracking from '@/components/VideoTracking';
import { getLearningCourse } from '@/actions/getCourse';
import { attachStatusToLessons } from '@/actions/getLesson';
import { CourseLearningStructure } from '@/types/course';
import { SubjectLearningStructure } from '@/types/subjects';
import { ModuleLearningStructure } from '@/types/modules';
import { LessonLearningStructure } from '@/types/lessons';

// Các imports Types & Mock Data liên quan đến Notes, Quiz, Peer Review
import { CURRENT_USER, mockNotes, mockPeerReviewAssignments, mockQuizSubmissions } from '@/data/course';
import { PeerReviewAssignment, QuizSubmission } from "@/types/examinations";
import { UserLessonNote } from "@/types/progresses";
import { LessonStatus } from "@/types/statuses";
import { VideoProgress } from "@/types/video";

type TabKey = 'lecture' | 'resources' | 'notes' | 'quiz';

const SUBJECT_ACCENTS = ['#5B5FEF', '#12B886', '#F2A93B', '#E5484D', '#0EA5E9'];

const EXTENSION_COLORS: Record<string, { bg: string; text: string }> = {
  pdf: { bg: '#FDE8E8', text: '#C81E3A' },
  docx: { bg: '#E5EAFD', text: '#3F3FC9' },
  doc: { bg: '#E5EAFD', text: '#3F3FC9' },
  zip: { bg: '#FDF3DA', text: '#9A6B00' },
  xlsx: { bg: '#E1F5EA', text: '#0F8A4E' },
  pptx: { bg: '#FCE8F4', text: '#B02E7A' },
};

function extensionColor(ext: string) {
  return EXTENSION_COLORS[ext.toLowerCase()] ?? { bg: '#EEEFF6', text: '#5B5FEF' };
}

// Kiểu dữ liệu Lesson đã có field status từ API
type LessonWithStatus = LessonLearningStructure & { status?: LessonStatus };

export default function CourseLearningPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // State quản lý dữ liệu lấy từ Backend API
  const [course, setCourse] = useState<CourseLearningStructure | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State điều hướng cây thư mục bài học
  const [currentLesson, setCurrentLesson] = useState<LessonWithStatus | undefined>(undefined);
  const [currentSubject, setCurrentSubject] = useState<SubjectLearningStructure | undefined>(undefined);

  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<TabKey>('lecture');

  // State mock cho Tiến độ, Ghi chú & Quiz
  const [notes, setNotes] = useState<UserLessonNote[]>(mockNotes);
  const [noteDraft, setNoteDraft] = useState('');
  const [submissions] = useState<QuizSubmission[]>(mockQuizSubmissions);
  const [peerAssignments, setPeerAssignments] = useState<PeerReviewAssignment[]>(mockPeerReviewAssignments);
  const [gradingId, setGradingId] = useState<string | null>(null);
  const [gradingScores, setGradingScores] = useState<Record<string, number>>({});
  const [gradingComment, setGradingComment] = useState('');

  // Call Server Action để lấy dữ liệu khóa học và status của các bài học
  useEffect(() => {
    if (!id) return;

    async function fetchLearningData() {
      try {
        setLoading(true);
        setErrorMessage(null);

        // 1. Fetch cấu trúc khóa học
        const rawCourse = await getLearningCourse(id);

        // 2. Tải status song song cho toàn bộ bài học trong tất cả các môn/module bằng Server Action attachStatusToLessons
        const updatedSubjects = await Promise.all(
          rawCourse.subjects.map(async (subject) => {
            const updatedModules = await Promise.all(
              subject.modules.map(async (mod) => {
                const lessonsWithStatus = await attachStatusToLessons(mod.lessons);
                return {
                  ...mod,
                  lessons: lessonsWithStatus,
                };
              })
            );
            return {
              ...subject,
              modules: updatedModules,
            };
          })
        );

        const courseWithStatus: CourseLearningStructure = {
          ...rawCourse,
          subjects: updatedSubjects,
        };

        setCourse(courseWithStatus);

        // Khởi tạo bài học mặc định (Môn 1 -> Module 1 -> Lesson 1)
        const firstSubject = courseWithStatus.subjects[0];
        const firstModule = firstSubject?.modules[0];
        const firstLesson = firstModule?.lessons[0] as LessonWithStatus | undefined;

        if (firstSubject) {
          setCurrentSubject(firstSubject);
          setExpandedSubjects({ [firstSubject.subject_id]: true });
        }
        if (firstModule) {
          setExpandedModules({ [firstModule.module_id]: true });
        }
        if (firstLesson) {
          setCurrentLesson(firstLesson);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Không thể lấy dữ liệu khóa học');
      } finally {
        setLoading(false);
      }
    }

    fetchLearningData();
  }, [id]);

  // Phẳng hóa danh sách bài học để phục vụ việc chuyển bài kế tiếp & tính tiến độ
  const flatLessons = useMemo(() => {
    if (!course) return [] as { subject: SubjectLearningStructure; module: ModuleLearningStructure; lesson: LessonWithStatus }[];
    const flat: { subject: SubjectLearningStructure; module: ModuleLearningStructure; lesson: LessonWithStatus }[] = [];
    course.subjects.forEach((subject) => {
      subject.modules.forEach((mod) => {
        mod.lessons.forEach((lesson) => flat.push({ subject, module: mod, lesson: lesson as LessonWithStatus }));
      });
    });
    return flat;
  }, [course]);

  // Đếm số lượng bài học đã hoàn thành dựa vào status từ API /get-status/{lesson_id}
  const completedCount = flatLessons.filter(
    (f) => f.lesson.status === LessonStatus.COMPLETED
  ).length;

  const progressPercent = flatLessons.length
    ? Math.round((completedCount / flatLessons.length) * 100)
    : 0;

  const subjectAccent = (subjectId: string) => {
    const idx = (course?.subjects.findIndex((s) => s.subject_id === subjectId) ?? 0) % SUBJECT_ACCENTS.length;
    return SUBJECT_ACCENTS[idx < 0 ? 0 : idx];
  };

  const handleProgressUpdate = (updatedProgress: Partial<VideoProgress>) => {
    console.log('Video Progress Updated:', updatedProgress);
  };

  const currentVideoProgress: VideoProgress = {
    video_progress_id: currentLesson?.lesson_id ?? '',
    last_watched_second: 0,
    max_watched_second: 0,
    complete_percentage: 0,
    is_finished: false,
  };

  const selectLesson = (subject: SubjectLearningStructure, lesson: LessonWithStatus) => {
    if (lesson.status === LessonStatus.LOCKED) return;
    setCurrentSubject(subject);
    setCurrentLesson(lesson);
    setActiveTab('lecture');
  };

  const toggleSubject = (subjectId: string) =>
    setExpandedSubjects((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }));
  const toggleModule = (moduleId: string) =>
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));

  const lessonNotes = notes
    .filter((n) => n.lessonId === currentLesson?.lesson_id)
    .sort((a, b) => a.timestampSeconds - b.timestampSeconds);

  const addNote = () => {
    if (!noteDraft.trim() || !currentLesson || !course) return;
    const newNote: UserLessonNote = {
      noteId: `note-${Date.now()}`,
      userId: CURRENT_USER.userId,
      courseId: id,
      lessonId: currentLesson.lesson_id,
      timestampSeconds: 0,
      content: noteDraft.trim(),
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, newNote]);
    setNoteDraft('');
  };

  // Màn hình Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#E7E9F0] border-t-[#5B5FEF] animate-spin" />
          <span className="text-xs text-[#8A8FA3] font-medium">Đang tải không gian học tập...</span>
        </div>
      </div>
    );
  }

  // Màn hình Error / Chưa đăng ký
  if (errorMessage || !course) {
    return (
      <div className="min-h-screen bg-[#F7F8FB] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-[#ECEAF0] text-center max-w-md shadow-sm space-y-4">
          <div className="w-12 h-12 bg-[#FDE8E8] text-[#E5484D] rounded-full flex items-center justify-center mx-auto text-lg font-bold">
            !
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-[#161826]">Không thể truy cập</h3>
            <p className="text-xs text-[#565A70] mt-1.5 leading-relaxed">{errorMessage || 'Khóa học không tồn tại.'}</p>
          </div>
          <button
            onClick={() => router.push('/home')}
            className="w-full py-2.5 bg-[#5B5FEF] text-white rounded-full text-xs font-bold transition-transform hover:scale-[1.02]"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FB] flex flex-col text-[#161826]" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Sora', ui-sans-serif, system-ui, sans-serif; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes softPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(91,95,239,0.35); }
          50% { box-shadow: 0 0 0 6px rgba(91,95,239,0); }
        }
        .anim-fade-up { animation: fadeInUp 0.4s ease-out both; }
        .anim-pulse-ring { animation: softPulse 2s ease-in-out infinite; }
        .accordion-grid {
          display: grid;
          transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .accordion-grid > div { overflow: hidden; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #DEE1EC; border-radius: 999px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <Navbar />

      {/* Header thanh công cụ lớp học */}
      <div className="bg-[#12141C] text-white px-6 py-3 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2 text-[11px] font-medium text-white/40">
          <span className="text-white/70 line-clamp-1">{course.title}</span>
        </div>

        <div className="flex items-center gap-5">
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #5B5FEF 0%, #12B886 100%)',
                }}
              />
            </div>
            <span className="text-[10px] font-bold text-white/60 tabular-nums w-8">{progressPercent}%</span>
          </div>
          <button
            type="button"
            onClick={() => router.push('/home')}
            className="text-[11px] font-bold px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer"
            style={{ backgroundColor: 'rgba(229,72,77,0.12)', color: '#F17075', border: '1px solid rgba(229,72,77,0.25)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#E5484D'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(229,72,77,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = '#F17075'; }}
          >
            Rời khỏi lớp học
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-104px)]">
        {/* Sidebar Cây Thư Mục Khóa Học */}
        <div className="w-[21rem] border-r border-[#ECEAF0] bg-white flex flex-col overflow-y-auto">
          <div className="p-5 border-b border-[#ECEAF0]">
            <h2 className="font-display text-sm font-bold text-[#161826] line-clamp-2 leading-snug">{course.title}</h2>
            <p className="text-[10px] text-[#9195A8] font-semibold mt-1.5 tabular-nums">
              {completedCount}/{flatLessons.length} bài học đã hoàn thành
            </p>
          </div>

          <div className="flex-1 py-2 px-2 space-y-1.5">
            {course.subjects.map((subject, subIdx) => {
              const subjectExpanded = !!expandedSubjects[subject.subject_id];
              const accent = subjectAccent(subject.subject_id);

              return (
                <div key={subject.subject_id} className="rounded-2xl overflow-hidden bg-[#FBFBFD] border border-[#EFEFF5]">
                  <button
                    type="button"
                    onClick={() => toggleSubject(subject.subject_id)}
                    className="w-full text-left pl-4 pr-3 py-3 flex justify-between items-center gap-2 hover:bg-white transition-colors duration-200 relative"
                  >
                    <span className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: accent }} />
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider block" style={{ color: accent }}>
                        Môn {subIdx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#2B2D3D] flex items-center gap-1.5 line-clamp-1">
                        {subject.title}
                      </span>
                    </div>
                    <span
                      className="shrink-0 w-4 h-4 flex items-center justify-center transition-transform duration-300"
                      style={{ transform: subjectExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    >
                      <span className="block w-0 h-0" style={{ borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: `5px solid ${accent}` }} />
                    </span>
                  </button>

                  <div className="accordion-grid" style={{ gridTemplateRows: subjectExpanded ? '1fr' : '0fr' }}>
                    <div>
                      <div className="pb-2 px-2 space-y-1">
                        {subject.modules.map((mod, modIdx) => {
                          const isExpanded = !!expandedModules[mod.module_id];
                          return (
                            <div key={mod.module_id} className="bg-white rounded-xl border border-[#F0F0F5]">
                              <button
                                type="button"
                                onClick={() => toggleModule(mod.module_id)}
                                className="w-full text-left px-3.5 py-2.5 flex justify-between items-center transition-colors duration-200 hover:bg-[#FAFAFD] rounded-xl"
                              >
                                <span className="text-[11px] font-bold text-[#565A70] line-clamp-1">
                                  {modIdx + 1}. {mod.title}
                                </span>
                                <span className="shrink-0 w-3.5 h-3.5 rounded-full border border-[#D8DAE6] flex items-center justify-center transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                                  <span className="block w-1.5 h-[1.5px] bg-[#8A8FA3]" />
                                </span>
                              </button>

                              <div className="accordion-grid" style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}>
                                <div>
                                  <div className="pb-1.5 px-2 space-y-1">
                                    {mod.lessons.map((lessonItem) => {
                                      const lesson = lessonItem as LessonWithStatus;
                                      const isSelected = currentLesson?.lesson_id === lesson.lesson_id;
                                      const isLocked = lesson.status === LessonStatus.LOCKED;
                                      const isCompleted = lesson.status === LessonStatus.COMPLETED;

                                      return (
                                        <button
                                          key={lesson.lesson_id}
                                          type="button"
                                          disabled={isLocked}
                                          onClick={() => selectLesson(subject, lesson)}
                                          className={`w-full text-left px-2.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-2.5 ${isSelected ? 'bg-[#EEF0FE]' : isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#FAFAFD] hover:translate-x-0.5'}`}
                                        >
                                          <span className="shrink-0 relative w-3.5 h-3.5 flex items-center justify-center">
                                            {isCompleted ? (
                                              <span className="w-3 h-3 rounded-full flex items-center justify-center text-[8px] text-white font-bold" style={{ backgroundColor: '#12B886' }}>
                                                ✓
                                              </span>
                                            ) : isSelected ? (
                                              <span className="w-3 h-3 rounded-full anim-pulse-ring" style={{ backgroundColor: '#5B5FEF' }} />
                                            ) : isLocked ? (
                                              <span className="w-3 h-3 rounded-full border-2 border-[#D8DAE6]" />
                                            ) : (
                                              <span className="w-3 h-3 rounded-full border-2" style={{ borderColor: accent }} />
                                            )}
                                          </span>

                                          <span className={`flex-1 line-clamp-2 ${isSelected ? 'text-[#3F3FC9] font-bold' : 'text-[#4B4E60]'}`}>
                                            {lesson.title}
                                          </span>

                                          {lesson.is_quiz && (
                                            <span className="shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#FDF3DA', color: '#9A6B00' }}>
                                              KT
                                            </span>
                                          )}
                                          <span className="shrink-0 text-[9px] text-[#B0B3C4] font-bold tabular-nums">
                                            {lesson.duration_minutes}p
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Khung Hiển Thị Nội Dung Bài Học */}
        <div className="flex-1 overflow-y-auto bg-[#F7F8FB] flex flex-col">
          <div className="px-8 pt-8 space-y-6 flex-1 max-w-4xl">
            <div className="space-y-1.5 pb-2">
              <span
                className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{
                  color: currentSubject ? subjectAccent(currentSubject.subject_id) : '#5B5FEF',
                  backgroundColor: currentSubject ? `${subjectAccent(currentSubject.subject_id)}14` : '#EEF0FE',
                }}
              >
                {currentSubject?.title ?? 'Bài học'}
              </span>
              <h1 className="font-display text-2xl font-bold text-[#161826] leading-tight">
                {currentLesson ? currentLesson.title : 'Vui lòng chọn một bài học bên danh sách'}
              </h1>
            </div>

            {/* Các Tab Nội Dung */}
            <div className="flex gap-1 relative">
              {(
                [
                  ['lecture', 'Bài giảng'],
                  ['resources', 'Tài liệu'],
                  ['notes', `Ghi chú${lessonNotes.length ? ` · ${lessonNotes.length}` : ''}`],
                  ...(currentLesson?.is_quiz ? [['quiz', 'Bài kiểm tra'] as [TabKey, string]] : []),
                ] as [TabKey, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative px-4 py-2.5 text-xs font-bold transition-colors duration-200 ${activeTab === key ? 'text-[#161826]' : 'text-[#B0B3C4] hover:text-[#565A70]'}`}
                >
                  {label}
                  <span
                    className="absolute left-4 right-4 -bottom-px h-[2px] rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: activeTab === key ? '#5B5FEF' : 'transparent',
                      transform: activeTab === key ? 'scaleX(1)' : 'scaleX(0)',
                    }}
                  />
                </button>
              ))}
              <span className="absolute left-0 right-0 bottom-0 h-px bg-[#ECEAF0]" />
            </div>

            {/* TAB BÀI GIẢNG */}
            {activeTab === 'lecture' && (
              <div key="lecture" className="anim-fade-up space-y-6 pb-10">
                {currentLesson ? (
                  <VideoTracking
                    progressData={currentVideoProgress}
                    onProgressUpdate={handleProgressUpdate}
                  />
                ) : (
                  <div
                    className="w-full aspect-video rounded-[28px] flex flex-col items-center justify-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #1B1E33 0%, #12141C 55%, #1E1440 100%)' }}
                  >
                    <div className="z-10 text-center space-y-4">
                      <p className="text-xs font-bold text-white/85 tracking-wide">Vui lòng chọn một bài học</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB TÀI LIỆU */}
            {activeTab === 'resources' && (
              <div key="resources" className="anim-fade-up space-y-2 pb-10">
                <p className="text-xs text-[#B0B3C4] font-medium py-8 text-center">Bài học này chưa có tài liệu đính kèm.</p>
              </div>
            )}

            {/* TAB GHI CHÚ */}
            {activeTab === 'notes' && (
              <div key="notes" className="anim-fade-up space-y-5 pb-10">
                <div className="flex gap-2">
                  <input
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Viết ghi chú cho bài học này..."
                    className="flex-1 text-xs bg-white border border-[#E7E9F0] rounded-full px-4 py-3 focus:outline-none focus:border-[#5B5FEF] transition-colors duration-200"
                    onKeyDown={(e) => e.key === 'Enter' && addNote()}
                  />
                  <button onClick={addNote} className="text-white text-xs font-bold px-5 rounded-full transition-transform duration-200 hover:scale-[1.03]" style={{ background: 'linear-gradient(135deg, #6C6FF2, #4A4DDB)' }}>Lưu</button>
                </div>

                {lessonNotes.length ? (
                  <div className="relative pl-5 space-y-4">
                    <span className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-[#ECEAF0]" />
                    {lessonNotes.map((note) => (
                      <div key={note.noteId} className="relative">
                        <span className="absolute -left-5 top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#F7F8FB]" style={{ backgroundColor: '#5B5FEF' }} />
                        <div className="bg-white border border-[#ECEAF0] rounded-2xl px-4 py-3">
                          <span className="text-[9px] font-bold text-[#5B5FEF] block mb-1 tabular-nums">
                            {Math.floor(note.timestampSeconds / 60)}:{String(note.timestampSeconds % 60).padStart(2, '0')}
                          </span>
                          <p className="text-xs text-[#3E4054]">{note.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#B0B3C4] font-medium py-8 text-center">Bạn chưa có ghi chú nào.</p>
                )}
              </div>
            )}

            {/* TAB BÀI KIỂM TRA */}
            {activeTab === 'quiz' && currentLesson?.is_quiz && (
              <div key="quiz" className="anim-fade-up space-y-7 pb-10">
                <div className="bg-white border border-[#ECEAF0] rounded-2xl p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-[#161826]">{currentLesson.title}</h3>
                      <p className="text-[11px] text-[#565A70] mt-1">Hoàn thành bài kiểm tra để đánh giá kiến thức đã học.</p>
                    </div>
                  </div>

                  <button className="mt-6 text-white text-xs font-bold py-3 px-6 rounded-full w-full transition-transform duration-200 hover:scale-[1.01]" style={{ background: 'linear-gradient(135deg, #6C6FF2, #4A4DDB)' }}>
                    Bắt đầu làm bài
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}