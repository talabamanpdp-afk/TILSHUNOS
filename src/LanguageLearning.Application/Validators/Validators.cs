using FluentValidation;
using LanguageLearning.Application.DTOs;

namespace LanguageLearning.Application.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6)
            .WithMessage("Password must be at least 6 characters long.");
        RuleFor(x => x.ConfirmPassword).Equal(x => x.Password)
            .WithMessage("Passwords do not match.");
    }
}

public class CreateVocabularyEntryRequestValidator : AbstractValidator<CreateVocabularyEntryRequest>
{
    public CreateVocabularyEntryRequestValidator()
    {
        RuleFor(x => x.TargetWord).NotEmpty().MaximumLength(150);
        RuleFor(x => x.NativeTranslation).NotEmpty().MaximumLength(250);
        RuleFor(x => x.LanguageCode).NotEmpty().MaximumLength(10);
    }
}

public class StartPracticeSessionRequestValidator : AbstractValidator<StartPracticeSessionRequest>
{
    public StartPracticeSessionRequestValidator()
    {
        RuleFor(x => x.LanguageCode).NotEmpty();
        RuleFor(x => x.SessionSize).InclusiveBetween(3, 50)
            .WithMessage("Session size must be between 3 and 50 questions.");
    }
}

public class SubmitPracticeAnswerRequestValidator : AbstractValidator<SubmitPracticeAnswerRequest>
{
    public SubmitPracticeAnswerRequestValidator()
    {
        RuleFor(x => x.SessionId).NotEmpty();
        RuleFor(x => x.EntryId).NotEmpty();
    }
}

public class SaveDraftRequestValidator : AbstractValidator<SaveDraftRequest>
{
    public SaveDraftRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Content).NotEmpty();
    }
}

public class CreateAssignmentRequestValidator : AbstractValidator<CreateAssignmentRequest>
{
    public CreateAssignmentRequestValidator()
    {
        RuleFor(x => x.StudentId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Instructions).NotEmpty();
        RuleFor(x => x.LanguageCode).NotEmpty();
        RuleFor(x => x.MaxScore).GreaterThan(0);
    }
}
