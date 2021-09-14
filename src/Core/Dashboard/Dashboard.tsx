import React, { ReactElement } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { Title } from 'react-admin';
import firebase from 'firebase';
import Card from './components/Card';
import {
  IGBO_API_VOLUNTEER_HOME_BASE,
  DICTIONARY_EDITING_STANDARDS_URL,
  VOICE_OVER_RECORDERS_SLACK_CHANNEL,
  EDITORS_TRANSLATORS_SLACK_CHANNEL,
  SOFTWARE_ENGINEERS_SLACK_CHANNEL,
} from '../constants';
import MilestoneProgress from './components/MilestoneProgress';

const Dashboard = (): ReactElement => {
  const user = firebase.auth().currentUser;

  const determineDashboardTitle = () => {
    const WELCOME_HEADER = 'Welcome on board';
    if (user?.displayName) {
      const firstName = user.displayName.split(' ')[0] || user.displayName;
      return `${WELCOME_HEADER}, ${firstName}!`;
    }
    return `${WELCOME_HEADER}!`;
  };

  return (
    <Box>
      <Title title="Igbo API Editor Platform" />
      <Box style={{ minHeight: '120vh' }} className="w-full bg-gray-100">
        <Box
          className="w-full bg-indigo-900 text-white flex flex-col justify-center items-center"
          style={{ height: 275 }}
        >
          <Heading fontSize="5xl" fontWeight="bold" className="text-center">
            {determineDashboardTitle()}
          </Heading>
          <Text fontSize="xl">{'Let\'s get back to work!'}</Text>
        </Box>
        <Box className="w-full grid grid-flow-row grid-cols-1 lg:grid-cols-2 gap-4 px-3 lg:-mt-12">
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
        <MilestoneProgress />
        <Box className="flex flex-col items-center text-center my-5">
          <Text fontSize="3xl" fontWeight="bold">Community</Text>
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
            buttonLabel="Voice Over Records Slack Channel"
          />
          <Card
            icon="🖋"
            heading="Editors/Translators"
            description={`If you have a question relating to the content for 
            any given word, reach out to the editors/translators`}
            link={EDITORS_TRANSLATORS_SLACK_CHANNEL}
            buttonLabel="Editors/Translators Slack Channel"
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
      </Box>
    </Box>
  );
};

export default Dashboard;
