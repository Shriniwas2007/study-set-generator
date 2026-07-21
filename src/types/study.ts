export interface Flashcard {
  question: string;
  answer: string;
}

export interface MindMapPoint {
  point: string;
}

export interface MindMapSubtopic {
  point: string;
  subtopics: MindMapPoint[];
}

export interface MindMapBranch {
  point: string;
  subtopics: MindMapSubtopic[];
}

export interface MindMap {
  topic: string;
  subtopics: MindMapBranch[];
}

export interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface StudyPlanDay {
  date: string;
  topics: string[];
  tasks: string[];
}

export interface StudyPackage {
  flashcards: Flashcard[];
  mindMap: MindMap;
  quiz: QuizQuestion[];
  studyPlan: StudyPlanDay[];
}

export interface DeadlineEntry {
  topic: string;
  dueDate: string;
}

export interface GenerateRequestPayload {
  studyStartDate: string;
  deadlines: DeadlineEntry[];
  materialText?: string;
}
