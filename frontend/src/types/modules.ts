import { Lesson, LessonLearningStructure } from "./lessons";

export interface Module {
    moduleId: string;
    subjectId: string;
    title: string;
    orderIndex: number;
    lessons: Lesson[];
}

export interface ModuleLearningStructure {
    title: string;
    module_id: string;
    lessons: LessonLearningStructure[];
}