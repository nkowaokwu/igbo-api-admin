import React, { ReactElement } from 'react';
import { Title } from 'react-admin';
import {
  Button,
  Box,
  Heading,
  Text,
} from '@chakra-ui/react';
import { RepeatClockIcon, QuestionOutlineIcon } from '@chakra-ui/icons';

const NotFound = (): ReactElement => (
  <Box className="flex flex-col justify-center items-center text-center pt-6 lg:py-12 lg:px-6">
    <Box className="flex flex-col justify-center items-center w-11/12 lg:w-8/12 lg:space-y-6 h-72">
      <Title title="Content Not Found" />
      <QuestionOutlineIcon w={12} h={12} color="gray.500" />
      <Box textAlign="center" m={1} className="lg:space-y-2">
        <Heading fontSize="xl">Requested Content Not Found</Heading>
        <Text fontSize="lg">
          Either you typed a wrong URL, or you followed a bad link.
        </Text>
        <Button leftIcon={<RepeatClockIcon />} onClick={() => window.history.back()}>Go Back</Button>
      </Box>
    </Box>
  </Box>
);

export default NotFound;
