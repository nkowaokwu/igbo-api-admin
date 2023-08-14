/* From: https://codesandbox.io/s/81zkxw8qnl?file=/src/useRecorder.js:370-385 */
/* From: https://medium.com/front-end-weekly/recording-audio-in-mp3-using-reactjs-under-5-minutes-5e960defaf10 */
import { useEffect, useRef, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import Wave from 'wave-visualizer';
import MicRecorder from 'mic-recorder-to-mp3';

const MAX_AUDIO_SIZE = 5000000;
const useRecorder = (): [string, boolean, () => void, () => void, number] => {
  const [wave] = useState(new Wave());
  const [audioBlob, setAudioBlob] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isBlocked, setIsBlocked] = useState(true);
  const [recorder, setRecorder] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const durationRef = useRef<NodeJS.Timer>();
  const toast = useToast();

  useEffect(() => {
    window.navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => setIsBlocked(false))
      .catch(() => setIsBlocked(true));
  }, []);

  useEffect(() => {
    if (!isBlocked) {
      setRecorder(new MicRecorder({ bitRate: 30000 }));

      (async () => {
        const stream = await window.navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => {
          toast({
            title: 'Microphone access denied',
            position: 'top-right',
            variant: 'left-accent',
            description: 'You must grant microphone permission to record',
            status: 'error',
            duration: 30000,
            isClosable: true,
          });
        });
        try {
          wave.fromStream(stream, 'canvas', {
            colors: ['#777777'],
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
        setRecordingDuration(0);
        durationRef.current = setInterval(() => {
          setRecordingDuration((prevRecordingDuration) => prevRecordingDuration + 1);
        }, 1000);
      });
    } else if (isBlocked) {
      toast({
        title: 'Microphone access denied',
        position: 'top-right',
        variant: 'left-accent',
        description: 'You must grant microphone permission to record',
        status: 'error',
        duration: 30000,
        isClosable: true,
      });
    }
  };

  const stopRecording = () => {
    if (!isBlocked && recorder) {
      recorder
        .stop()
        .getMp3()
        .then(([buffer, blob]) => {
          const file = new File(buffer, 'me-at-thevoice.mp3', {
            type: blob.type,
            lastModified: Date.now(),
          });
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onloadend = (e): void | React.ReactText => {
            if (typeof e.target.result !== 'string' || !e.target.result.includes('data:audio/mp3')) {
              return toast({
                title: 'Unable to record',
                position: 'top-right',
                variant: 'left-accent',
                description: 'Invalid file type. Must be .mp3',
                status: 'warning',
                duration: 9000,
                isClosable: true,
              });
            }
            if (e.target.result?.length > MAX_AUDIO_SIZE) {
              return toast({
                title: 'Unable to record',
                position: 'top-right',
                variant: 'left-accent',
                description: 'Audio is too large - 500Kb maximum. Shorten your recording.',
                status: 'warning',
                duration: 9000,
                isClosable: true,
              });
            }
            return setAudioBlob(reader.result);
          };
          setIsRecording(false);
          if (durationRef.current) {
            clearInterval(durationRef.current);
          }
        });
    } else if (!isBlocked) {
      toast({
        title: 'Microphone access denied',
        position: 'top-right',
        variant: 'left-accent',
        description: 'Unable to stop recording. You must grant microphone permission to record',
        status: 'error',
        duration: 30000,
        isClosable: true,
      });
    }
  };

  return [audioBlob, isRecording, startRecording, stopRecording, recordingDuration];
};

export default useRecorder;
