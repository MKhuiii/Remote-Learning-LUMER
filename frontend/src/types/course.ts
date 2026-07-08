export interface Lesson {
    id: string;
    title: string;
    duration: string;
}

export interface Module {
    id: string;
    title: string;
    lessons: Lesson[];
}

export interface Course {
    id: string;
    title: string;
    description: string;
    category: string; // Dùng để làm bộ lọc ở mục Khám phá
    instructor: string;
    progress?: number;
    modules: Module[];
}