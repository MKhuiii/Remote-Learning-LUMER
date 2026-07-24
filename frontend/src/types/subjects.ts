import { SubjectStatus } from "./statuses";
import { Module, ModuleLearningStructure } from "./modules";

export interface Subject {
    subjectId: string;
    courseId: string;
    title: string;
    description: string;
    orderIndex: number;
    statusId: SubjectStatus;
    modules: Module[];
}

export interface SubjectLearningStructure {
    title: string;
    subject_id: string;
    modules: ModuleLearningStructure[];
}
