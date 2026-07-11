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
  course_id: string;
  curriculum_id: string;
  instructor_id: string;
  title: string;
  course_type: string;
  description: string | null;
  price: number;
  image_url: string | null;
  created_at?: string;
  status_id: string;
}