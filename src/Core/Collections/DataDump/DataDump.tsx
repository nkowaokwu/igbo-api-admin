import React, { ReactElement, useEffect, useState } from 'react';
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
  Link,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Controller, useForm } from 'react-hook-form';
import { LuHardDriveUpload } from 'react-icons/lu';
import Select from 'react-select';
import { FilePicker, Textarea } from 'src/shared/primitives';
import { Confirmation } from 'src/shared/components';
import Collections from 'src/shared/constants/Collection';
import Views from 'src/shared/constants/Views';
import actionsMap from 'src/shared/constants/actionsMap';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import { FileDataType } from 'src/Core/Collections/TextImages/types';
import LanguageLabels from 'src/backend/shared/constants/LanguageLabels';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import { JOIN_SLACK_URL } from 'src/Core/constants';
import UploadStatus from './UploadStats';
import type StatusType from './StatusType';
import DataDumpResolver from './DataDumpResolver';

type SentenceData = {
  igbo: string;
  origin?: SuggestionSourceEnum;
  type?: SentenceTypeEnum;
};

const isDataCollectionLink = 'http://localhost:3030/#/exampleSuggestions';

const DataDump = (): ReactElement => {
  const [textareaValue, setTextareaValue] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageEnum>();
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
      `Are you sure you want to upload ${totalSentences} sentences at once? ` +
      'This will take a few minutes to complete.',
    executeAction: async ({ data, onProgressSuccess, onProgressFailure }) => {
      setIsUploading(true);
      try {
        await actionsMap.BulkUploadExamples.executeAction({
          data,
          onProgressSuccess,
          onProgressFailure,
        });
      } finally {
        setIsUploading(false);
      }
    },
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      types: [],
      languages: [],
      license: null,
    },
    ...DataDumpResolver(),
    mode: 'onChange',
  });

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

  const onSubmit = async () => {
    try {
      setIsConfirmationOpen(true);
    } catch (err) {
      toast({
        title: 'An error occurred',
        description: 'Unable to submit bulk upload sentences request.',
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
          data: { file: fileData, text: textareaValue, language: selectedLanguage },
          onProgressFailure,
          onProgressSuccess,
        }}
      />
      <Box className="space-y-3" width="700px" p={4}>
        <Heading>Bulk Upload Sentences</Heading>
        <Text fontFamily="Silka">
          Upload a new-line separated text file or copy and paste your text. Each line will be uploaded as a unique
          sentence.
        </Text>

        <Text fontSize="sm" fontWeight="bold" fontFamily="Silka">
          View all uploaded sentences by viewing the{' '}
          <Link href={isDataCollectionLink} color="blue.500">
            Sentence Drafts list
          </Link>
          .
        </Text>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <VStack alignItems="start" width="full" gap={4}>
            <VStack alignItems="start" gap={0} width="full">
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
            </VStack>
            <VStack alignItems="start" gap={4} width="full">
              <Text fontWeight="medium">Options</Text>
              <VStack alignItems="start" gap={0} width="full">
                <Controller
                  name="language"
                  control={control}
                  render={({ field: props }) => (
                    <Select
                      {...props}
                      className="w-full"
                      isDisabled={!isDataPresent}
                      placeholder="Select the sentences' language"
                      options={Object.values(LanguageLabels).filter(
                        (label) => label.value !== LanguageEnum.UNSPECIFIED,
                      )}
                      onChange={({ value }) => setSelectedLanguage(value)}
                    />
                  )}
                />
              </VStack>
              <Text fontSize="xs" color="gray.600">
                Don&apos;t see your language? Request to support a new language via our{' '}
                <Link href={JOIN_SLACK_URL} target="_blank" textDecoration="underline">
                  Slack
                  <ExternalLinkIcon />
                </Link>
                .
              </Text>
              {errors.language && <Text className="error">Language is required.</Text>}
            </VStack>
            <Button
              type="submit"
              variant="primary"
              _hover={{ backgroundColor: 'black' }}
              _active={{ backgroundColor: 'black' }}
              _focus={{ backgroundColor: 'black' }}
              isDisabled={!isDataPresent}
              isLoading={isUploading}
              rightIcon={<LuHardDriveUpload />}
            >
              Upload sentences
            </Button>
            {isUploading ? (
              <Text fontSize="sm" color="gray.600">
                Don&apos;t leave this page while uploading data.
              </Text>
            ) : null}
          </VStack>
        </form>
        {Boolean(totalSentences) ? (
          <Accordion allowMultiple width="full" my={6} borderColor="transparent">
            <AccordionItem>
              <Tooltip label="Result statues statuses from the bulk upload.">
                <AccordionButton>
                  <Box className="w-full flex flex-row items-center">
                    <Text fontWeight="bold">Bulk sentence upload results</Text>
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
