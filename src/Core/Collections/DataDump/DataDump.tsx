import React, { FormEvent, ReactElement, useEffect, useState } from 'react';
import { compact } from 'lodash';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  Heading,
  Text,
  Tooltip,
  Progress,
  Link,
  useToast,
  chakra,
  VStack,
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { LuHardDriveUpload } from 'react-icons/lu';
import { FilePicker, Textarea } from 'src/shared/primitives';
import { Confirmation } from 'src/shared/components';
import Collections from 'src/shared/constants/Collection';
import Views from 'src/shared/constants/Views';
import actionsMap from 'src/shared/constants/actionsMap';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import { FileDataType } from 'src/Core/Collections/TextImages/types';
import UploadStatus from './UploadStats';
import type StatusType from './StatusType';

type SentenceData = {
  igbo: string;
  origin?: SuggestionSourceEnum;
  type?: SentenceTypeEnum;
};

const isDataCollectionLink = 'http://localhost:3030/#/exampleSuggestions';

const DataDump = (): ReactElement => {
  const [textareaValue, setTextareaValue] = useState('');
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [successes, setSuccesses] = useState<StatusType[][]>([]);
  const [failures, setFailures] = useState([]);
  const [fileData, setFileData] = useState<SentenceData[]>([]);
  const [totalSentences, setTotalSentences] = useState(-1);
  const [isUploading, setIsUploading] = useState(false);
  const [isCopyAndPasteVisible] = useState(false);
  const toast = useToast();
  const isDataPresent = textareaValue.length || fileData?.length;
  const action = {
    ...actionsMap.BulkUploadExamples,
    content:
      `Are you sure you want to upload ${totalSentences} example suggestions at once? ` +
      'This will take a few minutes to complete.',
    executeAction: async ({ data, onProgressSuccess, onProgressFailure }) => {
      setIsUploading(true);
      await actionsMap.BulkUploadExamples.executeAction({
        data,
        onProgressSuccess,
        onProgressFailure,
      });
      setIsUploading(false);
    },
  };

  const handleFileSelect = (e: FileDataType) => {
    setTextareaValue(e.fileContent || '');
  };

  const handleChangeTextarea = (e) => {
    setTextareaValue(e.target.value);
  };

  const onProgressSuccess = (message) => {
    const updatedSuccesses = [...successes];
    updatedSuccesses.push(message);
    setSuccesses((prevSuccesses) => {
      const updatedSuccesses = [...prevSuccesses];
      updatedSuccesses.push(message);
      return updatedSuccesses;
    });
  };

  const onProgressFailure = (message) => {
    const updatedFailures = [...failures];
    updatedFailures.push(message);
    setFailures(updatedFailures);
    toast({
      title: 'An error occurred',
      description: 'Bulk upload for a batch has failed.',
      status: 'error',
      duration: 4000,
      isClosable: true,
    });
  };

  const handleCalculateSentenceCount = () => {
    const trimmedTextareaValue = textareaValue.trim();
    const separatedSentences = compact(trimmedTextareaValue.split(/\n/));
    const payload = separatedSentences.map((text) => ({ igbo: text.trim() }));
    setTotalSentences(payload.length + fileData?.length);
  };

  const handleCloseConfirmation = () => {
    setIsConfirmationOpen(false);
    setSuccesses([]);
    setFailures([]);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsConfirmationOpen(true);
    } catch (err) {
      toast({
        title: 'An error occurred',
        description: 'Unable to submit bulk upload example sentences request.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    const updatedFileData = [...fileData];
    setFileData(updatedFileData);
  }, []);

  useEffect(() => {
    handleCalculateSentenceCount();
  }, [textareaValue, fileData]);

  return (
    <>
      <Confirmation
        collection={Collections.DATA_DUMP}
        resource={Collections.DATA_DUMP}
        action={action}
        onClose={handleCloseConfirmation}
        isOpen={isConfirmationOpen}
        view={Views.SHOW}
        actionHelpers={{
          data: { file: fileData, text: textareaValue },
          onProgressFailure,
          onProgressSuccess,
        }}
      />
      <Box className="space-y-3" width="700px" p={4}>
        <Heading>Bulk Upload Example Sentences</Heading>
        <Text fontFamily="Silka">
          Upload a new-line separated text file or copy and paste your text. Each line will be uploaded as a unique
          Example sentence.
        </Text>

        <Text fontSize="sm" fontWeight="bold" fontFamily="Silka">
          View all uploaded sentences by viewing the{' '}
          <Link href={isDataCollectionLink} color="blue.500">
            Example Suggestions list
          </Link>
          .
        </Text>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <VStack alignItems="start" width="full" gap={4}>
            {/* TODO: toggle between copy and paste, select a language or default to project language */}
            <FilePicker type="text" onFileSelect={handleFileSelect} className="w-full" />
            {isCopyAndPasteVisible ? (
              <Textarea
                data-test="data-dump-textarea"
                value={textareaValue}
                onChange={handleChangeTextarea}
                placeholder="Copy and paste new-line separated sentences"
              />
            ) : null}
            {totalSentences ? (
              <Text fontSize="sm" color="gray.500" fontStyle="italic">
                Total sentences to be uploaded: {totalSentences}
              </Text>
            ) : null}
            <Box className="w-full flex flex-col lg:flex-row justify-between items-start space-y-4 lg:space-y-0">
              <Box className="w-full lg:w-8/12">
                {textareaValue && fileData?.length ? (
                  <Text className="space-x-2 mb-2">
                    <WarningIcon boxSize={3} color="orange.600" />
                    <chakra.span color="orange.600" fontSize="xs">
                      {`Both an uploaded file and text within the text area have been provided. 
                    Both sources of data will be uploaded.`}
                    </chakra.span>
                  </Text>
                ) : null}
                <Box className="w-full flex flex-col">
                  <Tooltip
                    label={
                      !textareaValue.length
                        ? 'Each Igbo sentence will be uploaded to the Igbo API data set as an example sentence'
                        : 'Disabled because there are not example sentences to upload'
                    }
                  >
                    <Box className="w-full lg:w-4/12">
                      <Button
                        type="submit"
                        isDisabled={!isDataPresent}
                        isLoading={isUploading}
                        rightIcon={<LuHardDriveUpload />}
                      >
                        Upload sentences
                      </Button>
                    </Box>
                  </Tooltip>
                  {totalSentences ? (
                    <Box className="w-full lg:w-6/12">
                      <Text fontWeight="bold">Uploaded examples</Text>
                      <Box className="w-full flex flex-row space-x-6 items-center">
                        <Progress
                          value={!totalSentences ? 0 : Math.floor((successes.flat().length / totalSentences) * 100)}
                          colorScheme="blue"
                          size="lg"
                          width="full"
                          height="8px"
                          borderRadius="full"
                        />
                        <Text fontFamily="Silka" className="w-4/12">
                          {`${successes.flat().length} / ${totalSentences}`}
                        </Text>
                      </Box>
                    </Box>
                  ) : null}
                </Box>
              </Box>
            </Box>
          </VStack>
        </form>
        {Boolean(totalSentences) ? (
          <Accordion allowMultiple width="full" my={6} borderColor="transparent">
            <AccordionItem>
              <Tooltip label="Result statues statuses from the bulk upload.">
                <AccordionButton>
                  <Box className="w-full flex flex-row items-center">
                    <Text fontWeight="bold">Bulk example sentence upload results</Text>
                    <AccordionIcon />
                  </Box>
                </AccordionButton>
              </Tooltip>
              <AccordionPanel>
                {successes.map((success, index) => (
                  <UploadStatus statuses={success} index={index} />
                ))}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        ) : null}
      </Box>
    </>
  );
};

export default DataDump;
