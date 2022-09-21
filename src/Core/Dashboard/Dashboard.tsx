import React, { ReactElement, useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Skeleton,
  chakra,
} from '@chakra-ui/react';
import { Title } from 'react-admin';
import { getAuth } from 'firebase/auth';
import Card from './components/Card';
import {
  IGBO_API_VOLUNTEER_HOME_BASE,
  DICTIONARY_EDITING_STANDARDS_URL,
  VOICE_OVER_RECORDERS_SLACK_CHANNEL,
  EDITORS_TRANSLATORS_SLACK_CHANNEL,
  SOFTWARE_ENGINEERS_SLACK_CHANNEL,
} from '../constants';
import MilestoneProgress from './components/MilestoneProgress';
import network from './network';

const auth = getAuth();
const userStatBodies = {
  approvedWordSuggestionsCount: {
    hash: '#/wordSuggestions?displayedFilters=%5B%5D&filter=%7B"approvals"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total approved word suggestions',
  },
  deniedWordSuggestionsCount: {
    hash: '#/wordSuggestions?displayedFilters=%5B%5D&filter=%7B"denials"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total denied word suggestions',
  },
  approvedExampleSuggestionsCount: {
    hash: '#/exampleSuggestions?displayedFilters=%5B%5D&filter=%7B"approvals"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total approved example suggestions',
  },
  deniedExampleSuggestionsCount: {
    hash: '#/exampleSuggestions?displayedFilters=%5B%5D&filter=%7B"denials"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total denied example suggestions',
  },
  authoredWordSuggestionsCount: {
    hash: '#/wordSuggestions?displayedFilters=%5B%5D&filter=%7B"authorId"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total authored word suggestions',
  },
  authoredExampleSuggestionsCount: {
    hash: '#/exampleSuggestions?displayedFilters=%5B%5D&filter=%7B"authorId"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total authored exampled suggestions',
  },
  mergedWordSuggestionsCount: {
    label: 'Total merged word suggestions',
  },
  mergedExampleSuggestionsCount: {
    label: 'Total merged exampled suggestions',
  },
  currentEditingWordSuggestionsCount: {
    hash: '#/wordSuggestions?displayedFilters=%5B%5D&filter=%7B"userInteractions"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total currently editing word suggestions',
  },
  currentEditingExampleSuggestionsCount: {
    hash: '#/exampleSuggestions?displayedFilters=%5B%5D&filter=%7B"userInteractions"'
    + '%3Atrue%7D&order=DESC&page=1&perPage=10&sort=approvals',
    label: 'Total currently editing example suggestions',
  },
};

const Dashboard = (): ReactElement => {
  const [userStats, setUserStats] = useState(null);
  const { currentUser: user } = auth;

  const determineDashboardTitle = () => {
    const WELCOME_HEADER = 'Welcome';
    if (user?.displayName) {
      const firstName = user.displayName.split(' ')[0] || user.displayName;
      return `${WELCOME_HEADER}, ${firstName}!`;
    }
    return `${WELCOME_HEADER}!`;
  };

  useEffect(() => {
    (async () => {
      const res = await network('/stats/user');
      setUserStats(res.json);
    })();
  }, []);

  return (
    <Box>
      <Title title="Igbo API Editor Platform" />
      <Box style={{ minHeight: '120vh' }} className="w-full bg-gray-100">
        <Box
          className="w-full text-white flex flex-col justify-center items-center"
          style={{
            height: 275,
            background: 'linear-gradient(36deg, rgba(52,17,154,1) 0%, rgba(91,9,121,1) 28%, rgba(255,87,0,1) 100%)',
          }}
        >
          <Heading fontSize="5xl" fontWeight="bold" className="text-center">
            {determineDashboardTitle()}
          </Heading>
          <Text fontSize="xl">So much progress has been made!</Text>
        </Box>
        <Box className="mb-24">
          <Box mt={4}>
            <Text fontSize="3xl" fontWeight="bold" className="text-center">Personal Contributions</Text>
            <Text fontSize="lg" className="text-gray-800 text-center">
              {'Take a look at how much you\'ve contributed to the community! '
              + 'You can click on each stat to see the associated documents'}
            </Text>
          </Box>
          <Skeleton isLoaded={userStats} minHeight={32}>
            <Box className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(userStats || {}).map(([key, value]) => (
                <Box
                  className={`flex justify-center items-center rounded-lg bg-white
                  shadow-sm p-4 transition-all duration-200 border border-gray-200
                  ${userStatBodies[key].hash ? 'cursor-pointer hover:bg-blue-100' : ''}`}
                  onClick={() => {
                    if (userStatBodies[key].hash) {
                      window.location.hash = userStatBodies[key].hash;
                    }
                  }}
                >
                  <Text key={key}>
                    <chakra.span fontWeight="bold">{`${userStatBodies[key].label}: `}</chakra.span>
                    {`${value}`}
                  </Text>
                </Box>
              ))}
            </Box>
          </Skeleton>
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
