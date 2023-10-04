import React, { ReactElement, useEffect, useState } from 'react';
import { compact, noop } from 'lodash';
import { Box, Heading, Link, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import NavbarWrapper from 'src/Core/Collections/components/NavbarWrapper';
import { ActivityButton, FilePicker, Textarea } from 'src/shared/primitives';
import { FileDataType } from 'src/Core/Collections/TextImages/types';
import SubmitBatchButton from 'src/Core/Collections/components/SubmitBatchButton';
import { attachTextImages, postTextImages } from 'src/shared/DataCollectionAPI';
import Completed from 'src/Core/Collections/components/Completed';
import CrowdsourcingType from 'src/backend/shared/constants/CrowdsourcingType';

type IgboTextPayloadType = FileDataType & {
  igbo: string;
};

const FILE_LIMIT = 5;
const IGBO_TEXT_IMAGES_EXAMPLE =
  'https://github.com/nkowaokwu/igbo-ocr/blob/main/tesstrain/data/ibo-ground-truth/Aghu1.png?raw=true';

const IgboTextImages = (): ReactElement => {
  const [isLoading, setIsLoading] = useState(false);
  const [fileData, setFileData] = useState<IgboTextPayloadType[]>(null);
  const [fileDataIndex, setFileDataIndex] = useState(-1);
  const [visitedFileDataIndex, setVisitedFileDataIndex] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const toast = useToast();

  const currentFileData = fileData?.[fileDataIndex] || { filePath: '', file: { name: '' }, igbo: '' };
  const isCompleteEnabled = visitedFileDataIndex && fileData?.length;

  const handleFileSelect = (fileObjects: FileDataType[]) => {
    setFileData(fileObjects.map((fileObject) => ({ ...fileObject, igbo: '' })));
    setFileDataIndex(0);
  };
  const handleTranscriptionChange = (e) => {
    const updatedFileData = [...fileData];
    updatedFileData[fileDataIndex].igbo = e.target.value;
    setFileData(updatedFileData);
  };
  const handlePrevious = () => {
    setFileDataIndex(fileDataIndex - 1);
    (document.querySelector('[data-test="igbo-image-transcription-textarea"]') as HTMLTextAreaElement).focus();
  };
  const handleNext = () => {
    setFileDataIndex(fileDataIndex + 1);
    (document.querySelector('[data-test="igbo-image-transcription-textarea"]') as HTMLTextAreaElement).focus();
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const textImagesPayload = fileData.map(({ igbo }) => ({ igbo }));
      const textImageIds = await postTextImages(textImagesPayload);
      const mediaPayload = compact(
        fileData.map(({ file, igbo }) => {
          const textImageIdIndex = textImageIds.findIndex(({ igbo: transcription }) => transcription === igbo);
          if (textImageIdIndex !== -1) {
            return { id: textImageIds[textImageIdIndex].id, file };
          }
          return null;
        }),
      );
      if (mediaPayload.length !== fileData.length) {
        console.log('An error occurred where the associated text image document cannot be attached to an image.');
      }
      const attachedStatuses = await attachTextImages(mediaPayload);
      console.log(attachedStatuses);
      toast({
        title: 'Success',
        position: 'top-right',
        variant: 'left-accent',
        description: 'Text images have been uploaded',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      setIsComplete(true);
    } catch (err) {
      toast({
        title: 'Error',
        position: 'top-right',
        variant: 'left-accent',
        description: 'An error occurred while upload text images',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fileDataIndex === fileData?.length - 1) {
      setVisitedFileDataIndex(true);
    }
  }, [fileDataIndex, fileData]);

  useEffect(() => {
    if (!isComplete) {
      setFileData(null);
      setFileDataIndex(-1);
    }
  }, [isComplete]);

  return !isComplete ? (
    <Box className="w-11/12 lg:w-full flex flex-col items-center h-full lg:h-auto" my={0} mx="auto">
      <Box className="w-full flex flex-col justify-center items-center space-y-4">
        <NavbarWrapper>
          <Heading fontFamily="Silka" textAlign="center" width="full" fontSize="3xl" my="4">
            Igbo Text Images
          </Heading>
        </NavbarWrapper>
        <Text fontFamily="Silka" mt={4} textAlign="center">
          Upload screenshot images of Igbo text.{' '}
          <Link textDecoration="underline" href={IGBO_TEXT_IMAGES_EXAMPLE} target="_blank">
            Click here for an example.
            <ExternalLinkIcon boxSize="3" ml={1} />
          </Link>
        </Text>
        <Box className="flex flex-col lg:flex-row justify-center items-center space-y-12 lg:space-y-0 lg:space-x-12">
          <FilePicker
            type="image"
            showFileName={false}
            onFileSelect={handleFileSelect}
            fileLimit={FILE_LIMIT}
            multiple
            {...(currentFileData
              ? {
                  url: currentFileData.filePath,
                  title: currentFileData.file.name,
                }
              : {})}
            className="flex-1"
          />
          {fileData?.length ? (
            <Box className="flex-1">
              <Text fontWeight="bold" fontFamily="heading">
                Igbo transcription
              </Text>
              <Textarea
                className="w-7/12"
                rows={2}
                fontFamily="heading"
                data-test="igbo-image-transcription-textarea"
                placeholder="Igbo transcription of text"
                value={currentFileData.igbo}
                onChange={handleTranscriptionChange}
              />
            </Box>
          ) : null}
        </Box>
        {fileData?.length ? (
          <Text fontFamily="Silka" fontWeight="bold">
            {`${fileDataIndex + 1} / ${fileData.length}`}
          </Text>
        ) : null}
        {fileData?.length ? (
          <>
            <SubmitBatchButton
              isLoading={isLoading}
              onClick={handleSubmit}
              isDisabled={!isCompleteEnabled}
              aria-label="Complete recordings"
            />
            {fileData?.length > 1 ? (
              <Box className="flex flex-row justify-center items-center space-x-6">
                <ActivityButton
                  tooltipLabel="Previous Igbo text image"
                  onClick={fileDataIndex === 0 ? noop : handlePrevious}
                  icon={<ArrowBackIcon color="gray" />}
                  aria-label="Previous Igbo definition"
                  isDisabled={fileDataIndex === 0}
                  left={0}
                />
                <ActivityButton
                  tooltipLabel="Next Igbo text image"
                  onClick={fileDataIndex === fileData?.length - 1 ? noop : handleNext}
                  colorScheme="green"
                  icon={<ArrowForwardIcon color="white" />}
                  aria-label="Previous Igbo definition"
                  isDisabled={fileDataIndex === fileData?.length - 1}
                  right={0}
                />
              </Box>
            ) : null}
          </>
        ) : null}
      </Box>
    </Box>
  ) : (
    <Completed type={CrowdsourcingType.UPLOAD_TEXT_IMAGE} setIsComplete={setIsComplete} setIsDirty={noop} />
  );
};

export default IgboTextImages;
