/* From: https://codesandbox.io/s/81zkxw8qnl?file=/src/useRecorder.js:370-385 */
import { useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import Wave from 'wave-visualizer';

const MAX_AUDIO_SIZE = 100000;
const requestRecorder = async (wave) => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  try {
    wave.fromStream(stream, 'canvas', {
      colors: ['red', 'white', 'blue'],
    });
    wave.fromElement('audio', 'canvas');
  } catch (err) {
    console.log('An error with Wave occurred:', err.message);
  }
  return new window.MediaRecorder(stream);
};

const useRecorder = (): [string, boolean, () => void, () => void] => {
  const [wave] = useState(new Wave());
  const [audioBlob, setAudioBlob] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState(null);
  const toast = useToast();

  useEffect(() => {
    // Lazily obtain recorder first time we're recording.
    if (recorder === null) {
      if (isRecording) {
        requestRecorder(wave).then(setRecorder, console.error);
      }
      return;
    }

    // Manage recorder state.
    if (isRecording) {
      recorder.start();
    } else if (!isRecording && recorder.state !== 'inactive') {
      recorder.stop();
    }

    // Obtain the audio when ready.
    const handleData = ({ data: audioData }) => {
      const reader = new FileReader();
      reader.readAsDataURL(audioData);
      reader.onloadend = (e) => {
        if (
          typeof e.target.result !== 'string'
          || !e.target.result.includes('data:audio/webm')
        ) {
          return toast({
            title: 'Unable to record',
            description: 'Invalid file type. Must be .webm',
            status: 'warning',
            duration: 9000,
            isClosable: true,
          });
        }
        if (e.target.result?.length > MAX_AUDIO_SIZE) {
          return toast({
            title: 'Unable to record',
            description: 'Audio is too large - 100Kb maximum. Shorten your recording.',
            status: 'warning',
            duration: 9000,
            isClosable: true,
          });
        }
        return setAudioBlob(reader.result);
      };
    };

    recorder.addEventListener('dataavailable', handleData);
    // eslint-disable-next-line consistent-return
    return () => recorder.removeEventListener('dataavailable', handleData);
  }, [recorder, isRecording]);

  const startRecording = () => {
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  return [audioBlob, isRecording, startRecording, stopRecording];
};

export default useRecorder;
