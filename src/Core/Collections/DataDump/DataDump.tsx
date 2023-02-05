import React, {
  FormEvent,
  ReactElement,
  useEffect,
  useState,
} from 'react';
import compact from 'lodash/compact';
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
} from '@chakra-ui/react';
import { Textarea } from 'src/shared/primitives';
import { Confirmation } from 'src/shared/components';
import Collections from 'src/shared/constants/Collections';
import Views from 'src/shared/constants/Views';
import actionsMap from 'src/shared/constants/actionsMap';
import UploadStatus from './UploadStats';
import type StatusType from './StatusType';

// eslint-disable-next-line max-len
const isDataCollectionLink = 'http://localhost:3030/#/exampleSuggestions?displayedFilters=%5B%5D&filter=%7B%22isDataCollection%22%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals';
const DataDump = (): ReactElement => {
  const [textareaValue, setTextareaValue] = useState('');
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [successes, setSuccesses] = useState<StatusType[][]>([]);
  const [failures, setFailures] = useState([]);
  const [totalSentences, setTotalSentences] = useState(-1);
  const toast = useToast();
  const action = {
    ...actionsMap.BulkUploadExamples,
    content: `Are you sure you want to upload ${totalSentences} example suggestions at once? `
    + 'This will take a few minutes to complete.',
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
    console.log('Failure message:', message);
    const updatedFailures = [...failures];
    updatedFailures.push(message);
    setFailures(updatedFailures);
    toast({
      title: 'An error occurred',
      description: 'Unable to bulk upload example sentences.',
      status: 'error',
      duration: 4000,
      isClosable: true,
    });
  };

  const handleCalculateSentenceCount = () => {
    const trimmedTextareaValue = textareaValue.trim();
    const separatedSentences = compact(trimmedTextareaValue.split(/\n/));
    const payload = separatedSentences.map((text) => ({ igbo: text.trim() }));
    setTotalSentences(payload.length);
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
        description: 'Unable to bulk upload example sentences.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    handleCalculateSentenceCount();
  }, [textareaValue]);

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
          data: textareaValue,
          onProgressFailure,
          onProgressSuccess,
        }}
      />
      <Box className="space-y-3">
        <Heading>Bulk Upload Example Suggestions</Heading>
        <Text fontFamily="Silka">
          {`This page expects a list of newline-separated sentences that
          will be bulk uploaded to the Igbo API dataset.`}
        </Text>
        <Text fontSize="sm" fontWeight="bold" fontFamily="Silka">
          {'Want to see all data dumped example suggestions? Use the '}
          <Link href={isDataCollectionLink} color="green">
            {'\'Is Data Collection\' Filter'}
          </Link>
          .
        </Text>
        <form onSubmit={handleFormSubmit}>
          <Textarea
            data-test="data-dump-textarea"
            value={textareaValue}
            onChange={handleChangeTextarea}
            placeholder="Sentences separated either by periods or new lines"
          />
          <Box className="w-full flex flex-row justify-between items-center mt-5">
            <Tooltip
              label={!textareaValue.length
                ? 'Each Igbo sentence will be uploaded to the Igbo API data set as an example sentence'
                : 'Disabled because there are not example sentences to upload'}
            >
              <Box className="w-full lg:w-4/12">
                <Button type="submit" disabled={!textareaValue.length}>
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
                  <Text fontFamily="Silka" className="w-4/12">{`${successes.flat().length} / ${totalSentences}`}</Text>
                </Box>
              </Box>
            ) : null}
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
