import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';

export interface MergedOrRejectedEmailData {
  to: [string];
  suggestionType: string;
  submissionLink?: string;
  origin: SuggestionSourceEnum;
  [key: string]: any;
}

export interface SuggestionsReminderData {
  to: [string];
  totalSuggestionsCount: number;
  wordSuggestionsCount: number;
  exampleSuggestionsCount: number;
}

export interface EmailMessage {
  from?: {
    email: string;
    name: string;
  };
  to: string[];
  templateId: string;
  dynamic_template_data: any;
}

export interface NewUserData {
  newUserEmail: string;
}

export interface ConstructedMessage extends EmailMessage {
  reply_to: {
    email: string;
    name: string;
  };
  personalizations: {
    to: [
      {
        email: string;
      },
    ];
  }[];
}
