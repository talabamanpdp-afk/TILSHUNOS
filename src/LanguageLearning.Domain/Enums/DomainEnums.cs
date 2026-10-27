namespace LanguageLearning.Domain.Enums;

public enum UserRole
{
    Guest = 0,
    Learner = 1,
    Teacher = 2,
    Admin = 3,
    SuperAdmin = 4
}

public enum CefrLevel
{
    PreA1 = 0,
    A1 = 1,
    A2 = 2,
    B1 = 3,
    B2 = 4,
    C1 = 5,
    C2 = 6
}

public enum VocabularyState
{
    Planned = 0,
    InProgress = 1,
    Learned = 2,
    NeedsReview = 3,
    Archived = 4
}

public enum PracticeDirection
{
    TargetToNative = 1,
    NativeToTarget = 2,
    Mixed = 3
}

public enum MaterialContentType
{
    Story = 1,
    News = 2,
    BookChapter = 3,
    GrammarLesson = 4,
    AudioPodcast = 5,
    VideoLesson = 6,
    SpeakingTopic = 7
}

public enum ConnectionStatus
{
    Pending = 0,
    Accepted = 1,
    Rejected = 2,
    Terminated = 3
}

public enum AssignmentType
{
    Vocabulary = 1,
    Grammar = 2,
    Reading = 3,
    Writing = 4,
    Listening = 5,
    Speaking = 6,
    Custom = 7
}

public enum AssignmentStatus
{
    Assigned = 0,
    InProgress = 1,
    Submitted = 2,
    Reviewed = 3,
    RevisionRequested = 4,
    Cancelled = 5
}

public enum WritingGenre
{
    Essay = 1,
    FormalLetter = 2,
    InformalLetter = 3,
    Email = 4,
    ApplicationRequest = 5,
    Tilxat = 6,
    FreeTopic = 7
}

public enum NotificationType
{
    System = 1,
    Assignment = 2,
    TeacherConnection = 3,
    Grade = 4,
    Streak = 5
}
