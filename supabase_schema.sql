CREATE TABLE IF NOT EXISTS audit_logs (
    "Id" uuid NOT NULL,
    "UserId" uuid,
    "Action" text NOT NULL,
    "EntityName" text NOT NULL,
    "EntityId" text,
    "Details" text,
    "IpAddress" text,
    "TimestampUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_audit_logs" PRIMARY KEY ("Id")
);


CREATE TABLE IF NOT EXISTS content_groups (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "ContentType" integer NOT NULL,
    "LanguageCode" text NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_content_groups" PRIMARY KEY ("Id")
);


CREATE TABLE IF NOT EXISTS email_verification_codes (
    "Id" uuid NOT NULL,
    "Email" text NOT NULL,
    "Code" text NOT NULL,
    "ExpiresAtUtc" timestamp with time zone NOT NULL,
    "IsUsed" boolean NOT NULL,
    "AttemptCount" integer NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_email_verification_codes" PRIMARY KEY ("Id")
);


CREATE TABLE IF NOT EXISTS password_reset_tokens (
    "Id" uuid NOT NULL,
    "Email" text NOT NULL,
    "Token" text NOT NULL,
    "ExpiresAtUtc" timestamp with time zone NOT NULL,
    "IsUsed" boolean NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_password_reset_tokens" PRIMARY KEY ("Id")
);


CREATE TABLE IF NOT EXISTS users (
    "Id" uuid NOT NULL,
    "Email" character varying(256) NOT NULL,
    "NormalizedEmail" character varying(256) NOT NULL,
    "PasswordHash" text NOT NULL,
    "FirstName" character varying(100) NOT NULL,
    "LastName" character varying(100) NOT NULL,
    "Role" integer NOT NULL,
    "EmailConfirmed" boolean NOT NULL,
    "IsActive" boolean NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "LastLoginAtUtc" timestamp with time zone,
    CONSTRAINT "PK_users" PRIMARY KEY ("Id")
);


CREATE TABLE IF NOT EXISTS learning_materials (
    "Id" uuid NOT NULL,
    "ContentGroupId" uuid,
    "Title" text NOT NULL,
    "Description" text NOT NULL,
    "ContentType" integer NOT NULL,
    "Level" integer NOT NULL,
    "LanguageCode" text NOT NULL,
    "ContentBody" text NOT NULL,
    "AudioUrl" text,
    "VideoUrl" text,
    "SourceUrl" text,
    "Attribution" text,
    "EstimatedMinutes" integer NOT NULL,
    "VocabularyListJson" text,
    "ComprehensionQuestionsJson" text,
    "IsPublished" boolean NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "UpdatedAtUtc" timestamp with time zone,
    CONSTRAINT "PK_learning_materials" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_learning_materials_content_groups_ContentGroupId" FOREIGN KEY ("ContentGroupId") REFERENCES content_groups ("Id") ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS ai_conversations (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "Title" text NOT NULL,
    "LanguageCode" text NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_ai_conversations" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_ai_conversations_users_UserId" FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS assignments (
    "Id" uuid NOT NULL,
    "TeacherId" uuid NOT NULL,
    "StudentId" uuid NOT NULL,
    "Title" text NOT NULL,
    "Instructions" text NOT NULL,
    "TaskType" integer NOT NULL,
    "Level" integer NOT NULL,
    "LanguageCode" text NOT NULL,
    "DueDateUtc" timestamp with time zone,
    "Status" integer NOT NULL,
    "MaxScore" numeric NOT NULL,
    "AttachmentJson" text,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_assignments" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_assignments_users_StudentId" FOREIGN KEY ("StudentId") REFERENCES users ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_assignments_users_TeacherId" FOREIGN KEY ("TeacherId") REFERENCES users ("Id") ON DELETE RESTRICT
);


CREATE TABLE IF NOT EXISTS in_app_notifications (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "Title" text NOT NULL,
    "Message" text NOT NULL,
    "Type" integer NOT NULL,
    "LinkUrl" text,
    "IsRead" boolean NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_in_app_notifications" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_in_app_notifications_users_UserId" FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS personal_vocabulary_entries (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "LanguageCode" text NOT NULL,
    "TargetWord" character varying(150) NOT NULL,
    "NativeTranslation" character varying(250) NOT NULL,
    "ExampleSentence" text,
    "Hint" text,
    "PersonalNote" text,
    "Topic" text,
    "PartOfSpeech" text,
    "Phonetic" text,
    "State" integer NOT NULL,
    "ConsecutiveCorrectCount" integer NOT NULL,
    "TotalAttempts" integer NOT NULL,
    "SuccessfulAttempts" integer NOT NULL,
    "HintAssistedAttempts" integer NOT NULL,
    "LastAttemptAtUtc" timestamp with time zone,
    "VerifiedLearnedAtUtc" timestamp with time zone,
    "SourcePublicCollectionEntryId" uuid,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_personal_vocabulary_entries" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_personal_vocabulary_entries_users_UserId" FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS practice_sessions (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "LanguageCode" text NOT NULL,
    "Direction" integer NOT NULL,
    "TotalQuestions" integer NOT NULL,
    "CorrectCount" integer NOT NULL,
    "HintsUsed" integer NOT NULL,
    "IsCompleted" boolean NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "CompletedAtUtc" timestamp with time zone,
    CONSTRAINT "PK_practice_sessions" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_practice_sessions_users_UserId" FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS published_vocabulary_collections (
    "Id" uuid NOT NULL,
    "AuthorUserId" uuid NOT NULL,
    "Title" text NOT NULL,
    "Description" text NOT NULL,
    "TargetLanguage" text NOT NULL,
    "Level" integer NOT NULL,
    "Topic" text NOT NULL,
    "IsPublished" boolean NOT NULL,
    "CopyCount" integer NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_published_vocabulary_collections" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_published_vocabulary_collections_users_AuthorUserId" FOREIGN KEY ("AuthorUserId") REFERENCES users ("Id") ON DELETE RESTRICT
);


CREATE TABLE IF NOT EXISTS registered_devices (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "DeviceName" text NOT NULL,
    "DeviceType" text NOT NULL,
    "Platform" text NOT NULL,
    "Browser" text NOT NULL,
    "IsPwaInstalled" boolean NOT NULL,
    "InstallMethod" text,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "LastActiveAtUtc" timestamp with time zone NOT NULL,
    "IsRevoked" boolean NOT NULL,
    CONSTRAINT "PK_registered_devices" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_registered_devices_users_UserId" FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS teacher_profiles (
    "UserId" uuid NOT NULL,
    "Bio" text NOT NULL,
    "Qualifications" text NOT NULL,
    "LanguagesTaught" text NOT NULL,
    "CefrLevelsTaught" text NOT NULL,
    "ExternalContactUrl" text,
    "HourlyRate" numeric,
    "TeachingExperienceYears" integer NOT NULL,
    "IsApproved" boolean NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_teacher_profiles" PRIMARY KEY ("UserId"),
    CONSTRAINT "FK_teacher_profiles_users_UserId" FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS user_learning_languages (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "LanguageCode" text NOT NULL,
    "CurrentLevel" integer NOT NULL,
    "IsPrimary" boolean NOT NULL,
    "StartedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_user_learning_languages" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_user_learning_languages_users_UserId" FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS user_profiles (
    "UserId" uuid NOT NULL,
    "NativeLanguage" text NOT NULL,
    "AvatarUrl" text,
    "Bio" text,
    "DailyGoalMinutes" integer NOT NULL,
    "CurrentStreakDays" integer NOT NULL,
    "LastActiveDateUtc" timestamp with time zone,
    "IsPublic" boolean NOT NULL,
    "ShowEmail" boolean NOT NULL,
    "ShowStreak" boolean NOT NULL,
    "ShowLearnedWords" boolean NOT NULL,
    "ShowStudyStatistics" boolean NOT NULL,
    CONSTRAINT "PK_user_profiles" PRIMARY KEY ("UserId"),
    CONSTRAINT "FK_user_profiles_users_UserId" FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS writing_drafts (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "Genre" integer NOT NULL,
    "Title" text NOT NULL,
    "Content" text NOT NULL,
    "WordCount" integer NOT NULL,
    "CharacterCount" integer NOT NULL,
    "AiFeedbackJson" text,
    "IsSubmitted" boolean NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "UpdatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_writing_drafts" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_writing_drafts_users_UserId" FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS material_progress_records (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "MaterialId" uuid NOT NULL,
    "IsCompleted" boolean NOT NULL,
    "Score" integer NOT NULL,
    "ProgressPercentage" integer NOT NULL,
    "LastAccessedAtUtc" timestamp with time zone NOT NULL,
    "CompletedAtUtc" timestamp with time zone,
    CONSTRAINT "PK_material_progress_records" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_material_progress_records_learning_materials_MaterialId" FOREIGN KEY ("MaterialId") REFERENCES learning_materials ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_material_progress_records_users_UserId" FOREIGN KEY ("UserId") REFERENCES users ("Id") ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS ai_messages (
    "Id" uuid NOT NULL,
    "ConversationId" uuid NOT NULL,
    "Role" text NOT NULL,
    "Content" text NOT NULL,
    "TokenCount" integer NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_ai_messages" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_ai_messages_ai_conversations_ConversationId" FOREIGN KEY ("ConversationId") REFERENCES ai_conversations ("Id") ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS assignment_submissions (
    "Id" uuid NOT NULL,
    "AssignmentId" uuid NOT NULL,
    "StudentId" uuid NOT NULL,
    "Content" text NOT NULL,
    "Version" integer NOT NULL,
    "SubmittedAtUtc" timestamp with time zone NOT NULL,
    "TeacherGrade" numeric,
    "TeacherFeedback" text,
    "RubricCriteriaScoresJson" text,
    "GradedAtUtc" timestamp with time zone,
    CONSTRAINT "PK_assignment_submissions" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_assignment_submissions_assignments_AssignmentId" FOREIGN KEY ("AssignmentId") REFERENCES assignments ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_assignment_submissions_users_StudentId" FOREIGN KEY ("StudentId") REFERENCES users ("Id") ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS practice_attempts (
    "Id" uuid NOT NULL,
    "SessionId" uuid NOT NULL,
    "VocabularyEntryId" uuid NOT NULL,
    "Direction" integer NOT NULL,
    "SubmittedAnswer" text NOT NULL,
    "IsCorrect" boolean NOT NULL,
    "HintUsed" boolean NOT NULL,
    "AttemptedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_practice_attempts" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_practice_attempts_personal_vocabulary_entries_VocabularyEnt~" FOREIGN KEY ("VocabularyEntryId") REFERENCES personal_vocabulary_entries ("Id") ON DELETE CASCADE,
    CONSTRAINT "FK_practice_attempts_practice_sessions_SessionId" FOREIGN KEY ("SessionId") REFERENCES practice_sessions ("Id") ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS published_vocabulary_collection_entries (
    "Id" uuid NOT NULL,
    "CollectionId" uuid NOT NULL,
    "TargetWord" text NOT NULL,
    "NativeTranslation" text NOT NULL,
    "ExampleSentence" text,
    "PartOfSpeech" text,
    "Phonetic" text,
    "Topic" text,
    CONSTRAINT "PK_published_vocabulary_collection_entries" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_published_vocabulary_collection_entries_published_vocabular~" FOREIGN KEY ("CollectionId") REFERENCES published_vocabulary_collections ("Id") ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS teacher_student_connections (
    "Id" uuid NOT NULL,
    "TeacherId" uuid NOT NULL,
    "StudentId" uuid NOT NULL,
    "Status" integer NOT NULL,
    "Notes" text,
    "RequestedAtUtc" timestamp with time zone NOT NULL,
    "RespondedAtUtc" timestamp with time zone,
    "TeacherProfileUserId" uuid,
    CONSTRAINT "PK_teacher_student_connections" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_teacher_student_connections_teacher_profiles_TeacherProfile~" FOREIGN KEY ("TeacherProfileUserId") REFERENCES teacher_profiles ("UserId"),
    CONSTRAINT "FK_teacher_student_connections_users_StudentId" FOREIGN KEY ("StudentId") REFERENCES users ("Id") ON DELETE RESTRICT,
    CONSTRAINT "FK_teacher_student_connections_users_TeacherId" FOREIGN KEY ("TeacherId") REFERENCES users ("Id") ON DELETE RESTRICT
);


CREATE INDEX IF NOT EXISTS "IX_ai_conversations_UserId" ON ai_conversations ("UserId");


CREATE INDEX IF NOT EXISTS "IX_ai_messages_ConversationId" ON ai_messages ("ConversationId");


CREATE INDEX IF NOT EXISTS "IX_assignment_submissions_AssignmentId" ON assignment_submissions ("AssignmentId");


CREATE INDEX IF NOT EXISTS "IX_assignment_submissions_StudentId" ON assignment_submissions ("StudentId");


CREATE INDEX IF NOT EXISTS "IX_assignments_StudentId" ON assignments ("StudentId");


CREATE INDEX IF NOT EXISTS "IX_assignments_TeacherId" ON assignments ("TeacherId");


CREATE INDEX IF NOT EXISTS "IX_audit_logs_TimestampUtc" ON audit_logs ("TimestampUtc");


CREATE INDEX IF NOT EXISTS "IX_email_verification_codes_Email_Code" ON email_verification_codes ("Email", "Code");


CREATE INDEX IF NOT EXISTS "IX_in_app_notifications_UserId_IsRead" ON in_app_notifications ("UserId", "IsRead");


CREATE INDEX IF NOT EXISTS "IX_learning_materials_ContentGroupId" ON learning_materials ("ContentGroupId");


CREATE INDEX IF NOT EXISTS "IX_learning_materials_ContentType_LanguageCode_Level" ON learning_materials ("ContentType", "LanguageCode", "Level");


CREATE INDEX IF NOT EXISTS "IX_material_progress_records_MaterialId" ON material_progress_records ("MaterialId");


CREATE UNIQUE INDEX IF NOT EXISTS "IX_material_progress_records_UserId_MaterialId" ON material_progress_records ("UserId", "MaterialId");


CREATE UNIQUE INDEX IF NOT EXISTS "IX_password_reset_tokens_Token" ON password_reset_tokens ("Token");


CREATE UNIQUE INDEX IF NOT EXISTS "IX_personal_vocabulary_entries_UserId_LanguageCode_TargetWord" ON personal_vocabulary_entries ("UserId", "LanguageCode", "TargetWord");


CREATE INDEX IF NOT EXISTS "IX_practice_attempts_SessionId" ON practice_attempts ("SessionId");


CREATE INDEX IF NOT EXISTS "IX_practice_attempts_VocabularyEntryId" ON practice_attempts ("VocabularyEntryId");


CREATE INDEX IF NOT EXISTS "IX_practice_sessions_UserId" ON practice_sessions ("UserId");


CREATE INDEX IF NOT EXISTS "IX_published_vocabulary_collection_entries_CollectionId" ON published_vocabulary_collection_entries ("CollectionId");


CREATE INDEX IF NOT EXISTS "IX_published_vocabulary_collections_AuthorUserId" ON published_vocabulary_collections ("AuthorUserId");


CREATE INDEX IF NOT EXISTS "IX_registered_devices_UserId" ON registered_devices ("UserId");


CREATE INDEX IF NOT EXISTS "IX_teacher_student_connections_StudentId" ON teacher_student_connections ("StudentId");


CREATE UNIQUE INDEX IF NOT EXISTS "IX_teacher_student_connections_TeacherId_StudentId" ON teacher_student_connections ("TeacherId", "StudentId");


CREATE INDEX IF NOT EXISTS "IX_teacher_student_connections_TeacherProfileUserId" ON teacher_student_connections ("TeacherProfileUserId");


CREATE INDEX IF NOT EXISTS "IX_user_learning_languages_UserId_LanguageCode" ON user_learning_languages ("UserId", "LanguageCode");


CREATE UNIQUE INDEX IF NOT EXISTS "IX_users_NormalizedEmail" ON users ("NormalizedEmail");


CREATE INDEX IF NOT EXISTS "IX_writing_drafts_UserId" ON writing_drafts ("UserId");


