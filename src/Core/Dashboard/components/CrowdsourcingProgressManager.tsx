import React, { ReactElement } from 'react';
import { first } from 'lodash';
import { Box, Heading, Text, chakra } from '@chakra-ui/react';
import { getAuth } from 'firebase/auth';
import IgboSoundboxViews from 'src/shared/constants/IgboSoundboxViews';
import TranslateIcon from 'src/shared/icons/TranslateIcon';
import DataEntryFlow from 'src/Core/Dashboard/components/DataEntryFlow';

interface CrowdsourcingOption {
  icon: string | ReactElement;
  title: string;
  subtitle: string;
  hash: string;
  backgroundImage: string;
  state?: IgboSoundboxViews;
}

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
          {crowdsourcingOptions.map((option) => (
            <DataEntryFlow key={option.title} {...option} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default CrowdsourcingProgressManager;
