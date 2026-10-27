export type UserRole = 'Guest' | 'Learner' | 'Teacher' | 'Admin' | 'SuperAdmin';

export type CefrLevel = 'PreA1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type VocabularyState = 'Planned' | 'InProgress' | 'Learned' | 'NeedsReview' | 'Archived';

export type PracticeDirection = 'TargetToNative' | 'NativeToTarget' | 'Mixed';

export type MaterialContentType = 'Story' | 'News' | 'BookChapter' | 'GrammarLesson' | 'AudioPodcast' | 'VideoLesson' | 'SpeakingTopic';

export type ConnectionStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Terminated';

export type AssignmentType = 'Vocabulary' | 'Grammar' | 'Reading' | 'Writing' | 'Listening' | 'Speaking' | 'Custom';

export type AssignmentStatus = 'Assigned' | 'InProgress' | 'Submitted' | 'Reviewed' | 'RevisionRequested' | 'Cancelled';

export type WritingGenre = 'Essay' | 'FormalLetter' | 'InformalLetter' | 'Email' | 'ApplicationRequest' | 'Tilxat' | 'FreeTopic';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailConfirmed: boolean;
  nativeLanguage?: string;
  targetLanguage?: string;
  currentLevel?: CefrLevel;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  nativeLanguage: string;
  avatarUrl?: string;
  bio?: string;
  dailyGoalMinutes: number;
  currentStreakDays: number;
  isPublic: boolean;
  showEmail: boolean;
  showStreak: boolean;
  showLearnedWords: boolean;
  primaryLanguageCode: string;
  primaryLevel: CefrLevel;
}

export interface PublicProfile {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  targetLanguage: string;
  level: CefrLevel;
  verifiedLearnedWordsCount: number;
  readingStoriesCompleted: number;
  booksCompleted: number;
  writingSubmissionsCount: number;
  averageWritingGrade?: number;
  listeningCompletedCount: number;
  speakingPracticesCount: number;
  streakDays: number;
}

export interface RegisteredDevice {
  id: string;
  deviceName: string;
  deviceType: string;
  platform: string;
  browser: string;
  isPwaInstalled: boolean;
  createdAtUtc: string;
  lastActiveAtUtc: string;
}

export interface VocabularyEntry {
  id: string;
  languageCode: string;
  targetWord: string;
  nativeTranslation: string;
  exampleSentence?: string;
  hint?: string;
  personalNote?: string;
  topic?: string;
  partOfSpeech?: string;
  phonetic?: string;
  state: VocabularyState;
  consecutiveCorrectCount: number;
  totalAttempts: number;
  successfulAttempts: number;
  lastAttemptAtUtc?: string;
  verifiedLearnedAtUtc?: string;
  createdAtUtc: string;
}

export interface VocabularyStats {
  totalPlanned: number;
  totalInProgress: number;
  totalLearned: number;
  totalNeedsReview: number;
  totalArchived: number;
  accuracyPercentage: number;
}

export interface PracticeQuestion {
  entryId: string;
  promptWord: string;
  directionPrompt: string;
  partOfSpeech?: string;
  topic?: string;
  hasHint: boolean;
}

export interface PracticeSession {
  sessionId: string;
  direction: PracticeDirection;
  totalQuestions: number;
  hintsRemaining: number;
  questions: PracticeQuestion[];
}

export interface PracticeAttemptResult {
  isCorrect: boolean;
  submittedAnswer: string;
  correctAnswer: string;
  exampleSentence?: string;
  consecutiveCorrect: number;
  currentState: VocabularyState;
  hintsRemaining: number;
}

export interface PracticeSessionSummary {
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracyPercentage: number;
  hintsUsed: number;
  promotedToLearnedWords: VocabularyEntry[];
  needsReviewWords: VocabularyEntry[];
}

export interface PublishedCollection {
  id: string;
  title: string;
  description: string;
  targetLanguage: string;
  level: CefrLevel;
  topic: string;
  authorName: string;
  wordCount: number;
  copyCount: number;
  createdAtUtc: string;
}

export interface LearningMaterial {
  id: string;
  contentGroupId?: string;
  title: string;
  description: string;
  contentType: MaterialContentType;
  level: CefrLevel;
  languageCode: string;
  contentBody: string;
  audioUrl?: string;
  videoUrl?: string;
  sourceUrl?: string;
  attribution?: string;
  estimatedMinutes: number;
  vocabularyListJson?: string;
  comprehensionQuestionsJson?: string;
  isCompleted: boolean;
  userScore: number;
  progressPercentage?: number;
  availableVersions?: { materialId: string; level: CefrLevel; title: string }[];
}

export interface TeacherProfile {
  userId: string;
  name: string;
  avatarUrl?: string;
  bio: string;
  qualifications: string;
  languagesTaught: string;
  cefrLevelsTaught: string;
  externalContactUrl?: string;
  hourlyRate?: number;
  teachingExperienceYears: number;
  isApproved: boolean;
}

export interface Assignment {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId: string;
  studentName: string;
  title: string;
  instructions: string;
  taskType: AssignmentType;
  level: CefrLevel;
  languageCode: string;
  dueDateUtc?: string;
  status: AssignmentStatus;
  maxScore: number;
  attachmentJson?: string;
  grade?: number;
  feedback?: string;
  createdAtUtc: string;
}

export interface WritingDraft {
  id: string;
  genre: WritingGenre;
  title: string;
  content: string;
  wordCount: number;
  characterCount: number;
  aiFeedbackJson?: string;
  isSubmitted: boolean;
  updatedAtUtc: string;
}

export interface AdminStats {
  totalUsers: number;
  verifiedUsers: number;
  activeTeachers: number;
  totalVocabularyEntries: number;
  totalMaterials: number;
  totalAssignments: number;
  totalPracticeSessions: number;
}

export type AdminDashboardStats = AdminStats;
