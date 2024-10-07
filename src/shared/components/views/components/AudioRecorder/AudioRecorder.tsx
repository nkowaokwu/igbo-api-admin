import React, { ReactElement, useEffect, useState } from 'react';
import { has, get } from 'lodash';
import { Record } from 'react-admin';
import { useToast } from '@chakra-ui/react';
import { DEFAULT_EXAMPLE_RECORD, DEFAULT_WORD_RECORD } from 'src/shared/constants';
import { Example, Word } from 'src/backend/controllers/utils/interfaces';
import RecorderBase from './RecorderBase';

const AudioRecorder = ({
  path,
  getFormValues,
  setPronunciation,
  record,
  originalRecord: originalRecordProp,
  formTitle = 'Word Pronunciation',
  formTooltip = 'Record the audio for the headword only one time. You are able to record over pre-existing recordings.',
  warningMessage,
  hideTitle = false,
}: {
  path: string;
  getFormValues: (key: string) => any;
  setPronunciation: (path: string, value: any) => any;
  record: Record | Example | Word;
  originalRecord: Record;
  formTitle?: string;
  formTooltip?: string;
  warningMessage?: string;
  hideTitle?: boolean;
}): ReactElement => {
  const originalRecord =
    record.originalWordId || record.originalExampleId
      ? originalRecordProp
      : record?.associatedWords
      ? DEFAULT_EXAMPLE_RECORD
      : DEFAULT_WORD_RECORD;
  const valuePath = path.endsWith('audio')
    ? path
    : path.startsWith('dialects')
    ? `${path}.pronunciation`
    : 'pronunciation';
  const [pronunciationValue, setPronunciationValue] = useState(null);
  const toast = useToast();

  /* Resets the audio pronunciation to its original value */
  const resetRecording = () => {
    const pronunciationPath = valuePath;
    const originalPronunciationValue = path.startsWith('dialects')
      ? get(originalRecord, `${pronunciationPath}`)
      : originalRecord.pronunciation;
    setPronunciation(valuePath, originalPronunciationValue);
    setPronunciationValue(getFormValues(valuePath));
    toast({
      title: 'Reset Audio Pronunciation',
      description: 'The audio pronunciation for this slot has been reset to its original value',
      status: 'info',
      duration: 9000,
      isClosable: true,
    });
  };

  /* Grabbing the default pronunciation value for the word or example document */
  useEffect(() => {
    const recordHasPronunciationField =
      has(record, 'pronunciation') || has(record, 'source') || has(record, 'translations');

    if (recordHasPronunciationField && !pronunciationValue) {
      setPronunciationValue(get(record, valuePath));
    }
  }, [record]);

  /** Listen to changes to the audioBlob for the
   * current pronunciation and saves it. If getFormValues
   * doesn't have a pronunciation key living on the object yet,
   * the platform will not overwrite the pronunciationValue
   * with undefined.
   * */
  const stopRecording = (audioBlob) => {
    const base64data = audioBlob;
    if (base64data) {
      setPronunciation(valuePath, base64data);
      setPronunciationValue(getFormValues(valuePath));
    }
  };

  return (
    <RecorderBase
      path={path}
      formTitle={formTitle}
      formTooltip={formTooltip}
      warningMessage={warningMessage}
      hideTitle={hideTitle}
      onStopRecording={stopRecording}
      onResetRecording={resetRecording}
      audioValue={pronunciationValue}
    />
  );
};

export default AudioRecorder;
