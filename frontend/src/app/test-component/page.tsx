'use client'
import VideoTracking from "@/components/VideoTracking"
import { VideoProgress } from "@/types/video"

const mockNewProgress: VideoProgress = {
    video_progress_id: "prog_new_001",
    duration_seconds: 600,       // Video dài 10 phút (600 giây)
    last_watched_second: 0,      // Chưa có tiến độ xem cũ
    max_watched_second: 0,       // Mốc xem lớn nhất hiện tại là 0
    complete_percentage: 0,      // 0% hoàn thành
    is_finished: true,          // Chưa hoàn thành (Bị kiểm soát tua vọt)
    current_points: 0            // Chưa tích lũy điểm
}

export default function Test() {
    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <h1 className="text-xl font-bold mb-6 text-center">
                Trang Kiểm Thử Video Tracking
            </h1>

            <VideoTracking
                progressData={mockNewProgress}
                onProgressUpdate={(updatedData) => {
                    console.log("Tiến độ realtime từ Video để chuẩn bị lưu DB:", updatedData)
                }}
            />
        </div>
    );
}