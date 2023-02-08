import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import Card from '../Card';
import {
  IGBO_API_VOLUNTEER_HOME_BASE,
  DICTIONARY_EDITING_STANDARDS_URL,
  VOICE_OVER_RECORDERS_SLACK_CHANNEL,
  EDITORS_TRANSLATORS_SLACK_CHANNEL,
  SOFTWARE_ENGINEERS_SLACK_CHANNEL,
} from '../../../constants';

const Community = () => (
  <>
    <Box className="flex flex-col items-center text-center my-5">
      <Text fontSize="3xl" fontWeight="bold" fontFamily="Silka">Community</Text>
      <Text fontSize="lg" className="w-11/12 lg:w-8/12 text-gray-800">
        {`You aren't working alone! Reach out to the following Slack 
        channels if you have any questions, comments, or concerns.`}
      </Text>
    </Box>
    <Box className="w-full grid grid-flow-row grid-cols-1 lg:grid-cols-3 gap-4 px-3">
      <Card
        icon="🗣"
        heading="Voice Over Recorders"
        description="Volunteers that record audio pronunciations for the thousands of words in the database."
        link={VOICE_OVER_RECORDERS_SLACK_CHANNEL}
        buttonLabel="Voice Over Recorders Slack Channel"
      />
      <Card
        icon="🖋"
        heading="Editors/Translators"
        description={`If you have a question relating to the content for 
        any given word, reach out to the editors/translators`}
        link={EDITORS_TRANSLATORS_SLACK_CHANNEL}
        buttonLabel="Translators Slack Channel"
      />
      <Card
        icon="👩🏾‍💻"
        heading="Software Engineers"
        description={`Notice a bug on the platform? Or want to request a new 
        feature to make your workflow easier? Reach out to the software engineers.`}
        link={SOFTWARE_ENGINEERS_SLACK_CHANNEL}
        buttonLabel="Software Engineers Slack Channel"
      />
    </Box>
    <Box className="w-full grid grid-flow-row grid-cols-1 lg:grid-cols-2 gap-4 px-3 mt-8">
      <Card
        icon="🚀"
        heading="Community Onboarding"
        description="If you just joined, read through the onboarding guide for your specific role."
        link={IGBO_API_VOLUNTEER_HOME_BASE}
        buttonLabel="Onboarding Guides"
      />
      <Card
        icon="📝"
        heading="Dictionary Editing Standards"
        description="Read through our editing standards before making edits."
        link={DICTIONARY_EDITING_STANDARDS_URL}
        buttonLabel="View Standards Doc"
      />
    </Box>
  </>
);

export default Community;
