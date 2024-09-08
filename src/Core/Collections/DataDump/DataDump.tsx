import React, { FormEvent, ReactElement, useEffect, useState } from 'react';
import { compact, has, trim } from 'lodash';
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
  Switch,
  useToast,
  chakra,
} from '@chakra-ui/react';
import { InfoIcon, WarningIcon } from '@chakra-ui/icons';
import pluralize from 'pluralize';
import { Textarea } from 'src/shared/primitives';
import { Confirmation } from 'src/shared/components';
import Collections from 'src/shared/constants/Collection';
import Views from 'src/shared/constants/Views';
import actionsMap from 'src/shared/constants/actionsMap';
import SentenceType from 'src/backend/shared/constants/SentenceType';
import SentenceTypeEnum from 'src/backend/shared/constants/SentenceTypeEnum';
import SentenceMetaDataDropdown from 'src/Core/Collections/DataDump/SentenceMetaDataDropdown';
import SuggestionSourceEnum from 'src/backend/shared/constants/SuggestionSourceEnum';
import SuggestionSource from 'src/backend/shared/constants/SuggestionSource';
import UploadStatus from './UploadStats';
import type StatusType from './StatusType';

const isValidJSON = (data) => {
  try {
    return JSON.parse(data).every((line) => has(line, 'igbo'));
  } catch {
    return false;
  }
};
const isValidCSV = (data) => {
  const lines = data.split('\n');
  const columns = lines[0].split(',');
  return columns.includes('igbo') && lines.every((line) => line.split(',').length >= columns.length);
};

type SentenceData = {
  igbo: string;
  origin?: SuggestionSourceEnum;
  type?: SentenceTypeEnum;
};

const isDataCollectionLink =
  // eslint-disable-next-line max-len
  'http://localhost:3030/#/exampleSuggestions?displayedFilters=%5B%5D&filter=%7B%22isDataCollection%22%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals';
const DataDump = (): ReactElement => {
  const [textareaValue, setTextareaValue] = useState('');
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [successes, setSuccesses] = useState<StatusType[][]>([]);
  const [failures, setFailures] = useState([]);
  const [fileData, setFileData] = useState<SentenceData[]>([]);
  const [isExample, setIsExample] = useState(false);
  const [sentenceType, setSentenceType] = useState<SentenceTypeEnum>(SentenceTypeEnum.DATA_COLLECTION);
  const [suggestionSource, setSuggestionSource] = useState<SuggestionSourceEnum>(SuggestionSourceEnum.INTERNAL);
  const [totalSentences, setTotalSentences] = useState(-1);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();
  const isDataPresent = textareaValue.length || fileData?.length;
  const action = {
    ...actionsMap.BulkUploadExamples,
    content:
      `Are you sure you want to upload ${totalSentences} example suggestions at once? ` +
      'This will take a few minutes to complete.',
    executeAction: async ({ data, onProgressSuccess, onProgressFailure }) => {
      setIsUploading(true);
      await actionsMap.BulkUploadExamples.executeAction({ data, onProgressSuccess, onProgressFailure });
      setIsUploading(false);
    },
  };

  const handleExampleDocumentType = (event) => {
    setIsExample(event.target.checked);
  };

  const handleChangeTextarea = (e) => {
    setTextareaValue(e.target.value);
  };

  const handleSelectSuggestionSource = (e) => {
    const selectedSuggestionSource = e.target.value as SuggestionSourceEnum;
    setSuggestionSource(selectedSuggestionSource);
  };

  const handleSelectSentenceType = (e) => {
    const selectedSentenceType = e.target.value as SentenceTypeEnum;
    setSentenceType(selectedSentenceType);
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
    // const { response } = message;
    // console.log('Failure message:', response.data);
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

  const omitNonCleanExamples = (event) => {
    const { result } = event.target;
    if (typeof result === 'string') {
      if (isValidJSON(result)) {
        const jsonData = JSON.parse(result) || [];
        if (Array.isArray(jsonData)) {
          const omittedData = [];
          const cleanedData = jsonData.reduce((finalData, data) => {
            const isDataClean = trim(data.igbo);
            if (isDataClean) {
              finalData.push({
                ...data,
                type: sentenceType,
                origin: suggestionSource,
              });
            } else {
              omittedData.push(data);
            }
            return finalData;
          }, []);
          setFileData(cleanedData);
        }
      } else if (isValidCSV(result)) {
        const lines = result.split('\n');
        const columns = lines[0].split(',');
        const finalFinalData = lines.reduce((finalLines, line) => {
          const values = line.split(',');
          finalLines.push(
            columns.reduce(
              (finalObject, column, index) => ({
                ...finalObject,
                [column]: values[index],
              }),
              {},
            ),
          );
          return finalLines;
        }, []);
        setFileData(finalFinalData);
      } else {
        // console.log('Invalid file uploaded');
      }
    }
  };

  const handleFileUpload = (e) => {
    const dataDumpFile = e.target.files[0];
    if (dataDumpFile) {
      const reader = new FileReader();
      reader.readAsText(dataDumpFile, 'utf-8');
      reader.onload = omitNonCleanExamples;
    }
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
    const updatedFileData = [...fileData].map((sentence) => ({
      ...sentence,
      origin: suggestionSource,
      type: sentenceType,
    }));
    setFileData(updatedFileData);
  }, [suggestionSource, sentenceType]);

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
          data: { file: fileData, text: textareaValue, isExample },
          onProgressFailure,
          onProgressSuccess,
        }}
      />
      <Box className="space-y-3 p-4">
        <Heading>Bulk Upload Sentences</Heading>
        <Text fontFamily="Silka">
          {`This page expects a list of newline-separated sentences that
          will be bulk uploaded to the Igbo API dataset.`}
        </Text>
        <Text fontSize="sm" fontWeight="bold" fontFamily="Silka">
          {'Want to see all data dumped examples or example suggestions? Use the '}
          <Link href={isDataCollectionLink} color="green">
            &apos;Is Data Collection&apos; Filter
          </Link>
          .
        </Text>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <Textarea
            data-test="data-dump-textarea"
            value={textareaValue}
            onChange={handleChangeTextarea}
            placeholder="Sentences separated either by periods or new lines"
          />
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
                    <Button colorScheme="purple" type="submit" isDisabled={!isDataPresent} isLoading={isUploading}>
                      Bulk upload sentences
                    </Button>
                  </Box>
                </Tooltip>
                {totalSentences > -1 ? (
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
            <Box className="w-full lg:w-4/12 flex flex-row justify-end items-center">
              <details className="cursor-pointer">
                <Tooltip label="Click here to see data uploading alternatives">
                  <summary className="lg:text-right mb-2">
                    <chakra.span m="2" fontWeight="bold">
                      More data upload options
                    </chakra.span>
                  </summary>
                </Tooltip>
                <Box className="space-y-2">
                  <Box className="space-y-2 p-4 rounded-md" backgroundColor="gray.200">
                    <Text fontWeight="bold">Select a JSON or CSV file to bulk upload example sentences.</Text>
                    <input type="file" name="data-dump" accept=".json,.csv" onChange={handleFileUpload} />
                    {fileData.length ? (
                      <Text color="green.600" className="space-x-2">
                        <InfoIcon boxSize={3} />
                        <chakra.span fontStyle="italic">
                          {`${pluralize('example sentence', fileData.length, true)} 
                          from this file will be uploaded`}
                        </chakra.span>
                      </Text>
                    ) : null}
                  </Box>
                  <Tooltip label="Either upload these sentences as either Examples or Example Suggestions">
                    <Box className="flex flex-row justify-start items-center space-x-2">
                      <Text fontWeight="bold" color={!isExample ? '' : 'gray.300'}>
                        Example Suggestion
                      </Text>
                      <Switch onChange={handleExampleDocumentType} />
                      <Text fontWeight="bold" color={isExample ? '' : 'gray.300'}>
                        Example
                      </Text>
                    </Box>
                  </Tooltip>
                  {isExample ? (
                    <Text className="italic" fontSize="sm">
                      These sentences will become examples.
                    </Text>
                  ) : (
                    <Text className="italic" fontSize="sm">
                      These sentences will become example suggestions.
                    </Text>
                  )}
                </Box>
                <SentenceMetaDataDropdown
                  values={Object.values(SuggestionSource).filter(({ isSelectable }) => isSelectable)}
                  onChange={handleSelectSuggestionSource}
                  defaultValue={suggestionSource}
                  title="Suggestion Source"
                  description="The digital origin the text originated from"
                  data-test="suggestion-origin-dropdown"
                />
                <SentenceMetaDataDropdown
                  values={Object.values(SentenceType).filter(({ isSelectable }) => isSelectable)}
                  onChange={handleSelectSentenceType}
                  defaultValue={sentenceType}
                  title="Sentence Type"
                  description="The type of sentence"
                  data-test="sentence-type-dropdown"
                />
              </details>
            </Box>
          </Box>
        </form>
        {totalSentences > -1 ? (
          <Accordion allowMultiple className="w-full my-6">
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
