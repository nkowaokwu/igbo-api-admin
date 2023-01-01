import React, {
  ReactElement,
  useEffect,
  useState,
  useRef,
} from 'react';
import {
  Box,
  Heading,
  Text,
  chakra,
} from '@chakra-ui/react';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
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
  url,
  title,
  accept,
  onFileSelect,
  seekTime,
  register,
  name,
  errors,
} : {
  url?: string,
  title?: string,
  accept?: string,
  onFileSelect: (value: any) => void,
  seekTime: number,
  register: any,
  name: string,
  errors: any,
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
      duration: mediaRef.current.getDuration(),
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
    <Box className="flex flex-col space-y-3 w-full">
      <Box width="full">
        <Box
          width="full"
          cursor={localFile ? 'default' : 'pointer'}
          onClick={clickInput}
          display="flex"
          flexDirection="column"
          alignItems="center"
          my={4}
        >
          {url || localFile ? (
            <Box className="space-y-4 w-full">
              <ReactPlayer
                url={url || localFilePath}
                ref={mediaRef}
                onReady={() => onFileSelect({ duration: Math.floor(mediaRef.current.getDuration()) })}
                controls
                width="100%"
                height="50px"
                style={{
                  overflow: 'hidden',
                  height: '50px !important',
                }}
                config={{
                  file: {
                    forceAudio: true,
                  },
                }}
              />
              <Text color="gray.600" fontSize="xs">
                <chakra.span fontSize="md" fontWeight="bold">Filename: </chakra.span>
                {title || localFile.name}
              </Text>
            </Box>
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
        <input
          disabled
          {...register('duration')}
          className="pointer-events-none invisible absolute"
        />
      </Box>
      {errors.media ? (
        <p className="error">Media is required</p>
      ) : null}
    </Box>
  );
};

FilePicker.defaultProps = {
  accept: 'video/wav,video/mov,video/mp4,audio/mp3',
};

export default FilePicker;
