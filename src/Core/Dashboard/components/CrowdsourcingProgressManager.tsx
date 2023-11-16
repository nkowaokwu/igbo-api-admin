import React, { ReactElement } from 'react';
import { first } from 'lodash';
import { Box, Button, Heading, Image, Show, Text, chakra } from '@chakra-ui/react';
import { getAuth } from 'firebase/auth';
import IgboSoundboxViews from 'src/shared/constants/IgboSoundboxViews';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import TranslateIcon from 'src/shared/icons/TranslateIcon';

type CrowdsourcingOption = {
  icon: string | ReactElement;
  title: string;
  subtitle: string;
  hash: string;
  backgroundImage: string;
  state?: IgboSoundboxViews;
};

const crowdsourcingOptions: CrowdsourcingOption[] = [
  {
    icon: '🎙',
    title: 'Record Igbo audio for example Igbo sentences',
    subtitle: 'Read Igbo sentences and record them out loud to build the largest Igbo audio library',
    hash: '#/igboSoundbox',
    backgroundImage: 'https://nkowaokwu.s3.us-west-1.amazonaws.com/assets/images/igboAPIEditorPlatform/microphone.png',
    state: IgboSoundboxViews.RECORD,
  },
  {
    icon: '✅',
    title: 'Verify recorded Igbo audio',
    subtitle: 'Listen to Igbo recordings from other contributors and verify the recordings are correct',
    hash: '#/igboSoundbox',
    backgroundImage: 'https://nkowaokwu.s3.us-west-1.amazonaws.com/assets/images/igboAPIEditorPlatform/idea-splash.png',
    state: IgboSoundboxViews.VERIFY,
  },
  {
    icon: '✍🏾',
    title: 'Add Igbo definitions',
    subtitle: 'Add Igbo definitions to existing word entries in the largest Igbo dictionary',
    hash: '#/igboDefinitions',
    backgroundImage: 'https://nkowaokwu.s3.us-west-1.amazonaws.com/assets/images/igboAPIEditorPlatform/verify.png',
  },
  // {
  //   icon: '🇳🇬',
  //   title: 'Add Igbo sentences',
  //   subtitle: 'Add Igbo sentences to contribute to the largest Igbo dictionary',
  //   hash: '#/igboDefinitions',
  //   backgroundImage: 'https://nkowaokwu.s3.us-west-1.amazonaws.com/assets/images/igboAPIEditorPlatform/verify.png',
  // },
  {
    icon: <TranslateIcon boxSize={8} />,
    title: 'Translate Igbo sentences',
    subtitle: 'Translate Igbo sentences to English to improve Igbo translation technology',
    hash: '#/translate',
    backgroundImage:
      'https://nkowaokwu.s3.us-west-1.amazonaws.com/assets/images/igboAPIEditorPlatform/speech_bubbles.png',
  },
  {
    icon: '📸',
    title: 'Upload images of Igbo text',
    subtitle: 'Upload images that contain Igbo text to be later annotated',
    hash: '#/igboTextImages',
    backgroundImage: 'https://nkowaokwu.s3.us-west-1.amazonaws.com/assets/images/igboAPIEditorPlatform/verify.png',
  },
];

const handleNavigation = ({ hash, state }: { hash: string; state?: IgboSoundboxViews }) => {
  const handledState = state ? `?igboSoundboxView=${state}` : '';
  window.location.href = `${window.location.origin}/${handledState}${hash}`;
};

const auth = getAuth();
const CrowdsourcingProgressManager = (): ReactElement => {
  const { currentUser } = auth;

  return (
    <Box className="flex flex-col justify-start items-center p-3 space-y-4 relative" borderTopLeftRadius="lg">
      <Box className="w-full">
        <Heading as="h2" fontSize="2xl" mb={4}>
          Dashboard
        </Heading>
        <Text fontFamily="heading" fontWeight="bold" color="gray.700">
          {`Ndeewo, ${first((currentUser?.displayName || '').split(' '))} `}
          <chakra.span fontWeight="normal">Kedụ ụdị enyemaaka ị chọrọ inye anyị?</chakra.span>
        </Text>
      </Box>
      <Box className="w-full flex flex-col justify-start items-start space-y-4">
        <Box className="w-full flex flex-col md:flex-row flex-wrap justify-start items-center gap-8 lg:gap-24">
          {crowdsourcingOptions.map(({ icon, subtitle, title, hash, state, backgroundImage }) => (
            <Box
              key={title}
              className="bg-gray-100 lg:bg-white space-y-4 flex flex-col justify-start items-start relative"
              borderWidth="1px"
              borderColor={{ base: 'gray.200', md: 'white' }}
              borderRadius="md"
              p={2}
              width={{ base: 'full', lg: '326px' }}
            >
              <Show below="md">
                <Image src={backgroundImage} userSelect="none" className="absolute bottom-0 right-0" />
              </Show>
              <Box
                className={`flex flex-row lg:flex-col justify-start items-center 
                lg:items-start space-y-0 lg:space-y-4 space-x-2 lg:space-x-0`}
              >
                <Box
                  className="bg-gray-200 rounded-md flex flex-row justify-center items-center"
                  width={{ base: '64px', md: '94px' }}
                  height={{ base: '64px', md: '94px' }}
                >
                  {typeof icon === 'string' ? <Text fontSize={{ base: '3xl', lg: '5xl' }}>{icon}</Text> : icon}
                </Box>
                <Text fontWeight="bold" fontFamily="Silka" fontSize={{ base: 'md', md: 'lg' }}>
                  {title}
                </Text>
              </Box>
              <Text fontFamily="Silka" fontSize={{ base: 'md', md: 'lg' }} className=" w-8/12 md:w-full">
                {subtitle}
              </Text>
              <Button
                cursor="pointer"
                borderRadius="md"
                height={{ base: 12, md: 14 }}
                px={3}
                backgroundColor="primary"
                color="white"
                textAlign="center"
                onClick={() => handleNavigation({ hash, state })}
                rightIcon={<ArrowForwardIcon color="white" />}
                _hover={{
                  backgroundColor: 'primary',
                }}
                _active={{
                  backgroundColor: 'primary',
                }}
                _focus={{
                  backgroundColor: 'primary',
                }}
              >
                Start here
              </Button>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default CrowdsourcingProgressManager;
