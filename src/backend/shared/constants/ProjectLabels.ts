import ProjectType from 'src/backend/shared/constants/ProjectType';

const ProjectLabels = {
  [ProjectType.UNSPECIFIED]: {
    value: ProjectType.UNSPECIFIED,
    label: 'Unspecified',
  },
  // [ProjectType.AUDIO_TRANSCRIPTION]: {
  //   value: ProjectType.AUDIO_TRANSCRIPTION,
  //   label: 'Audio-to-Text Transcription',
  // },
  [ProjectType.TEXT_AUDIO_ANNOTATION]: {
    value: ProjectType.TEXT_AUDIO_ANNOTATION,
    label: 'Text-to-Audio Recording',
  },
  // [ProjectType.FREE_SPEECH]: {
  //   value: ProjectType.FREE_SPEECH,
  //   label: 'Freeform Audio Recording',
  // },
  [ProjectType.TRANSLATION]: {
    value: ProjectType.TRANSLATION,
    label: 'Text Translation',
  },
  // [ProjectType.IMAGE_TRANSCRIPTION]: {
  //   value: ProjectType.IMAGE_TRANSCRIPTION,
  //   label: 'Image Transcription',
  // },
  // [ProjectType.CAPTION_GENERATION]: {
  //   value: ProjectType.CAPTION_GENERATION,
  //   label: 'Image Captioning',
  // },
  // [ProjectType.SENTIMENT_ANALYSIS]: {
  //   value: ProjectType.SENTIMENT_ANALYSIS,
  //   label: 'Sentiment Analysis',
  // },
  // [ProjectType.NAMED_ENTITY_RECOGNITION]: {
  //   value: ProjectType.NAMED_ENTITY_RECOGNITION,
  //   label: 'Named Entity Recognition',
  // },
  [ProjectType.LEXICAL]: {
    value: ProjectType.LEXICAL,
    label: 'Lexical Dictionary',
  },
};

export default ProjectLabels;
