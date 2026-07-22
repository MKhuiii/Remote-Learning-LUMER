import { TagName } from "@/types/tag";

const COURSE_API_URL = process.env.NEXT_PUBLIC_COURSE_BACKEND_URL || "http://localhost:8000";

/**
 * Lấy top 5 tags nổi bật từ Backend
 */
export async function getTop5Tags(): Promise<TagName[]> {
    try {
        const response = await fetch(`${COURSE_API_URL}/tags/top-5`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch top tags: ${response.statusText}`);
        }

        const data: TagName[] = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching top 5 tags:", error);
        return [];
    }
}