import React, { ReactElement } from 'react';
import { Title } from 'react-admin';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  Text,
  Link,
} from '@chakra-ui/react';
import { WarningIcon, RepeatClockIcon } from '@chakra-ui/icons';
import { SOFTWARE_ENGINEERS_SLACK_CHANNEL } from '../constants';

const Error = ({ errorInfo }: { errorInfo: any }): ReactElement => (
  <Box className="flex flex-col justify-center items-center text-center pt-6 lg:py-12 lg:px-6">
    <Box className="w-11/12 lg:w-8/12">
      <Title title="An Error Occurred" />
      <WarningIcon w={12} h={12} color="red.500" />
      <Text fontSize="4xl">Uh oh! Something went wrong on this page</Text>
      <Text fontSize="2xl">
        {'Try logging out and refreshing the page. If the problem persists, please reach out to our '}
        <Link href={SOFTWARE_ENGINEERS_SLACK_CHANNEL} color="teal.500" isExternal>
          engineers.
        </Link>
      </Text>
      {process.env.NODE_ENV !== 'production' && (
        <Accordion allowMultiple className="w-full my-6">
          <AccordionItem>
            <AccordionButton>
              <Box className="w-full flex flex-row items-center">
                <Text>Details</Text>
                <AccordionIcon />
              </Box>
            </AccordionButton>
            <AccordionPanel>
              {errorInfo.componentStack}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
      <div>
        <Button
          onClick={() => window.history.go(-1)}
          leftIcon={<RepeatClockIcon />}
          colorScheme="teal"
        >
          Go back
        </Button>
      </div>
    </Box>
  </Box>
);

export default Error;
