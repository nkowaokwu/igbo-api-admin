enum ProjectType {
  UNSPECIFIED = 'UNSPECIFIED',
  // ⭐️ The provided dataset is predefined prompts that will be recorded answer for
  // FREE_SPEECH = 'FREE_SPEECH',
  // ⭐️ The provided dataset is a bunch of audio that we would like to transcribe
  // AUDIO_TRANSCRIPTION = 'AUDIO_TRANSCRIPTION',
  // The provided dataset is a bunch of text we would like to record audio for
  TEXT_AUDIO_ANNOTATION = 'TEXT_AUDIO_ANNOTATION',
  // The provided dataset is a bunch of text we would like to translate
  TRANSLATION = 'TRANSLATION',
  // ⭐️ The provided dataset is a bunch of images that we want to transcribe the text for
  // IMAGE_TRANSCRIPTION = 'IMAGE_TRANSCRIPTION',
  // ⭐️ The provided dataset is a bunch of images that we would like to create captions for
  // CAPTION_GENERATION = 'CAPTION_GENERATION',
  // ⭐️ The provided dataset is a bunch of sentences that we want to label the sentiment for
  // SENTIMENT_ANALYSIS = 'TEXT_CLASSIFICATION',
  // ⭐️ The provided dataset is a bunch of sentences that we want to label entities of
  // NAMED_ENTITY_RECOGNITION = 'NAMED_ENTITY_RECOGNITION',
  // The provided dataset is a bunch of words that we want to add more lexically dense information
  LEXICAL = 'LEXICAL',
}

export default ProjectType;
