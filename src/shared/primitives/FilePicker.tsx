import React, {
  ReactElement,
  useEffect,
  useState,
  useRef,
} from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import NoteAddIcon from '@material-ui/icons/NoteAdd';
import ReactPlayer from 'react-player';

const iconStyle = { height: 100, width: 100 };

const getBase64 = (file) => (
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = (error) => {
      reject(`Error: ${error}`); // eslint-disable-line
    };
  })
);

const FilePicker = ({
  accept,
  onFileSelect,
  seekTime,
  register,
  name,
} : {
  accept?: string,
  onFileSelect: (value: any) => void,
  seekTime: number,
  register: any,
  name: string,
}): ReactElement => {
  const [localFile, setLocalFile] = useState<File>(null);
  const [localFilePath, setLocalFilePath] = useState<string>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<ReactPlayer>(null);

  const clickInput = () => {
    inputRef.current.click();
  };

  const handleOnChange = async ({ target } : { target: HTMLInputElement }) => {
    const file = target.files[0];
    if (!file) {
      console.log('Failed to get file');
    }
    const filePath = URL.createObjectURL(file);
    const base64 = await getBase64(file);
    setLocalFile(file);
    setLocalFilePath(filePath);
    onFileSelect({
      file,
      filePath,
      base64,
    });
  };

  useEffect(() => {
    if (accept.includes('*')) {
      throw new Error('accept parameter is too broad');
    }
  }, []);

  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.seekTo(seekTime);
    }
  }, [seekTime]);

  return (
    <>
      <Box
        width="lg"
        height="md"
        backgroundColor="white"
        borderRadius="lg"
        cursor={localFile ? 'default' : 'pointer'}
        onClick={clickInput}
        textAlign="center"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        my={4}
        className="space-y-4"
      >
        {localFile ? (
          <>
            <ReactPlayer
              url={localFilePath}
              controls
              ref={mediaRef}
              height="auto"
              width="auto"
              style={{
                borderRadius: 10,
                overflow: 'hidden',
              }}
            />
            <Text>{localFile.name}</Text>
          </>
        ) : (
          <>
            <NoteAddIcon style={iconStyle} />
            <Heading as="h2" fontSize="xl">Select an Audio or Video file to upload</Heading>
            <Text>or drag and drop it here.</Text>
          </>
        )}
      </Box>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleOnChange}
        disabled={localFile}
        {...register(name)}
        className="pointer-events-none invisible absolute"
      />
    </>
  );
};

FilePicker.defaultProps = {
  accept: 'video/wav,video/mov,video/mp4,audio/mp3',
};

export default FilePicker;
