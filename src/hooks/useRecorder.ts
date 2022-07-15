/* From: https://codesandbox.io/s/81zkxw8qnl?file=/src/useRecorder.js:370-385 */
/* From: https://medium.com/front-end-weekly/recording-audio-in-mp3-using-reactjs-under-5-minutes-5e960defaf10 */
import { useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import Wave from 'wave-visualizer';
import MicRecorder from 'mic-recorder-to-mp3';

const MAX_AUDIO_SIZE = 1000000;
const useRecorder = (): [string, boolean, () => void, () => void] => {
  const [wave] = useState(new Wave());
  const [audioBlob, setAudioBlob] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isBlocked, setIsBlocked] = useState(true);
  const [recorder, setRecorder] = useState(null);
  const toast = useToast();

  useEffect(() => {
    // @ts-expect-error navigator
    navigator.getUserMedia({ audio: true },
      () => setIsBlocked(false),
      () => setIsBlocked(true));
  }, []);

  useEffect(() => {
    if (!isBlocked) {
      setRecorder(new MicRecorder({ bitRate: 30000 }));

      (async () => {
        // @ts-expect-error navigator
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        try {
          wave.fromStream(stream, 'canvas', {
            colors: ['red', 'white', 'blue'],
          });
          wave.fromElement('audio', 'canvas');
        } catch (err) {
          console.log('An error with Wave occurred:', err.message);
        }
      })();
    }
  }, [isBlocked]);

  const startRecording = () => {
    if (!isBlocked && recorder) {
      recorder.start().then(() => {
        setIsRecording(true);
      });
    }
  };

  const stopRecording = () => {
    if (!isBlocked && recorder) {
      recorder.stop().getMp3().then(([buffer, blob]) => {
        // @ts-expect-error File
        const file = new File(buffer, 'me-at-thevoice.mp3', {
          type: blob.type,
          lastModified: Date.now(),
        });
        // @ts-expect-error FileReader
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = (e): void | React.ReactText => {
          if (
            typeof e.target.result !== 'string'
            || !e.target.result.includes('data:audio/mp3')
          ) {
            return toast({
              title: 'Unable to record',
              description: 'Invalid file type. Must be .mp3',
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
        setIsRecording(false);
      });
    }
  };

  return [audioBlob, isRecording, startRecording, stopRecording];
};

export default useRecorder;
