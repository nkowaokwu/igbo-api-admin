import React, { ReactElement } from 'react';
import { getAuth } from 'firebase/auth';
import { first } from 'lodash';
import {
  Box,
  Button,
  Heading,
  Text,
} from '@chakra-ui/react';
import IgboSoundboxViews from 'src/shared/constants/IgboSoundboxViews';

type CrowdsourcingOption = {
  icon: string,
  title: string,
  hash: string,
  state?: IgboSoundboxViews,
};

const crowdsourcingOptions: CrowdsourcingOption[] = [
  {
    icon: '🎙',
    title: 'Record Igbo audio',
    hash: '#/igboSoundbox',
    state: IgboSoundboxViews.RECORD,
  },
  {
    icon: '✅',
    title: 'Verify recorded Igbo audio',
    hash: '#/igboSoundbox',
    state: IgboSoundboxViews.VERIFY,
  },
  {
    icon: '✍🏾',
    title: 'Add Igbo definitions',
    hash: '#/igboDefinitions',
  },
];

const handleNavigation = ({
  hash,
  state,
}: {
  hash: string,
  state?: IgboSoundboxViews,
}) => {
  const handledState = state ? `?igboSoundboxView=${state}` : '';
  window.location.href = `${window.location.origin}/${handledState}${hash}`;
};

const auth = getAuth();
const CrowdsourcingProgressManager = (): ReactElement => {
  const { currentUser } = auth;
  return (
    <Box
      className="flex flex-col justify-start items-center p-3 space-y-4 relative gradient-background"
      borderTopLeftRadius="lg"
    >
      <Box className="flex flex-col items-center space-y-2">
        <Text fontFamily="heading" fontWeight="bold" color="gray.700">
          {`Ndeewo, ${first((currentUser?.displayName || '').split(' '))}`}
        </Text>
        <Heading as="h1" fontFamily="sans-serif" textAlign="center" fontSize="xl">
          Kedụ ụdị enyemaaka ị chọrọ inye anyị?
        </Heading>
      </Box>
      <Box className="w-full flex flex-col justify-start items-start space-y-4">
        <Box className="w-full flex flex-row justify-start items-center">
          <Button
            className="flex flex-row justify-start items-center relative l-0 b-0 space-x-2"
            borderRadius="full"
            textAlign="center"
            height="16"
            onClick={() => handleNavigation({ hash: '#/leaderboard' })}
            backgroundColor="white"
            boxShadow="sm"
            _hover={{
              backgroundColor: 'green.100',
            }}
            _active={{
              backgroundColor: 'green.100',
            }}
            _focus={{
              backgroundColor: 'green.100',
            }}

          >
            <Text fontSize="3xl">🏆</Text>
            <Text
              color="gray.800"
              fontSize="md"
              fontWeight="bold"
              fontFamily="Silka"
            >
              Leaderboard
            </Text>
          </Button>
        </Box>
        <Heading as="h2" fontSize="xl">Data Entry Options</Heading>
        <Box className="w-full flex flex-row flex-wrap justify-center items-center gap-4">
          {crowdsourcingOptions.map(({
            icon,
            title,
            hash,
            state,
          }) => (
            <Button
              cursor="pointer"
              borderRadius="xl"
              backgroundColor="white"
              className="flex flex-col justify-center"
              boxShadow="lg"
              height={['200px', '225px']}
              width={['170px', '200px']}
              textAlign="center"
              onClick={() => handleNavigation({ hash, state })}
              _hover={{
                background: 'green.100',
              }}
              _active={{
                background: 'green.100',
              }}
              _focus={{
                background: 'green.100',
              }}
            >
              <Text fontSize={['3xl', '6xl']}>{icon}</Text>
              <Text
                color="gray.800"
                fontSize="md"
                fontWeight="bold"
                fontFamily="Silka"
                whiteSpace="break-spaces"
              >
                {title}
              </Text>
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default CrowdsourcingProgressManager;
