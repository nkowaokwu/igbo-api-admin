import React, { ReactElement, useEffect, useState, useRef } from 'react';
import { compact } from 'lodash';
import { Box, Text, chakra, Image } from '@chakra-ui/react';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import ReactPlayer from 'react-player';
import { FileDataType } from 'src/Core/Collections/TextImages/types';

const ACCEPT_TYPE = {
  image: 'image/png,image/jpg,image/jpeg',
  media: 'video/wav,video/mp4,audio/wav,audio/mp3',
};

const getBase64 = (file): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = (error) => {
      reject(`Error: ${error}`); // eslint-disable-line
    };
  });

const FileName = ({ fileName }: { fileName: string }) => (
  <Text color="gray.600" fontSize="xs">
    <chakra.span fontSize="md" fontWeight="bold">
      Filename:{' '}
    </chakra.span>
    {fileName}
  </Text>
);

const FilePicker = ({
  url,
  title,
  onFileSelect,
  seekTime,
  name,
  type,
  register = () => ({}),
  errors = {},
  multiple = false,
  fileLimit = 1,
  showFileName = true,
  className = '',
}: {
  url?: string;
  title?: string;
  onFileSelect: (value: any) => void;
  seekTime?: number;
  register?: (value: string) => any;
  name: string;
  type: 'image' | 'media';
  errors?: Record<string, unknown>;
  multiple?: boolean;
  fileLimit?: number;
  showFileName?: boolean;
  className?: string;
}): ReactElement => {
  const [localFile, setLocalFile] = useState<File>(null);
  const [localFilePath, setLocalFilePath] = useState<string>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<ReactPlayer>(null);

  const handleFile = async (file: File, index: number): Promise<FileDataType | null> => {
    try {
      if (!file) {
        // console.log('Failed to get file');
      }
      if (index >= fileLimit) {
        return null;
      }
      const filePath = URL.createObjectURL(file);
      const base64 = await getBase64(file);
      setLocalFile(file);
      setLocalFilePath(filePath);
      return {
        file,
        filePath,
        base64,
        ...(type === 'media' ? { duration: mediaRef.current.getDuration() } : {}),
      };
    } catch (err) {
      inputRef.current.value = null;
      return null;
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const fileData = compact(await Promise.all(Array.from(e.dataTransfer.files).map(handleFile)));
    onFileSelect(multiple ? fileData : fileData[0]);
  };

  const handleOnChange = async ({ target }: { target: HTMLInputElement }) => {
    const fileData = compact(await Promise.all(Array.from(target.files).map(handleFile)));
    onFileSelect(multiple ? fileData : fileData[0]);
  };

  const clickInput = () => {
    inputRef.current.click();
  };

  useEffect(() => {
    if (mediaRef.current && typeof seekTime === 'number') {
      mediaRef.current.seekTo(seekTime);
    }
  }, [seekTime]);

  return (
    <Box
      className={`flex flex-col space-y-3 p-12 ${!localFile ? 'border-dashed border-2 border-gray-300' : ''} 
       rounded-md file-picker ${!localFile && isDragging ? 'drag-active' : ''} ${className}`}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
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
          {(url || localFile) && type === 'media' ? (
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
              {showFileName ? <FileName fileName={title || localFile.name} /> : null}
            </Box>
          ) : (url || localFile) && type === 'image' ? (
            <>
              <Image src={url || localFilePath} maxWidth="580px" width="full" />
              {showFileName ? <FileName fileName={title || localFile.name} /> : null}
            </>
          ) : (
            <Box className="space-y-4 flex flex-col justify-center items-center">
              <DriveFolderUploadIcon fontSize="large" color="disabled" />
              <Text fontFamily="heading" textAlign="center">
                Drag & Drop or <chakra.span color="blue.500">Choose file</chakra.span> to upload
              </Text>
              {multiple ? (
                <Text fontSize="sm" color="gray.500" fontFamily="heading">
                  You can upload up to {fileLimit} files.
                </Text>
              ) : null}
            </Box>
          )}
        </Box>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_TYPE[type]}
          onChange={handleOnChange}
          disabled={localFile}
          multiple={multiple}
          {...register(name)}
          data-test="file-picker-input"
          className="pointer-events-none invisible absolute"
        />
        <input disabled {...register('duration')} className="pointer-events-none invisible absolute" />
      </Box>
      {errors.media ? <p className="error">Media is required</p> : null}
    </Box>
  );
};

export default FilePicker;
