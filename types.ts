
export enum LearningMode {
  TEXTBOOK = 'TEXTBOOK',
  ADVANCED = 'ADVANCED',
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface TestContent {
  title: string;
  questions: Question[];
}
