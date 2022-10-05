import React, { ReactElement, useEffect, useState } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  Tooltip as ChakraTooltip,
  Skeleton,
  chakra,
} from '@chakra-ui/react';
import { ShowProps } from 'react-admin';
import moment from 'moment';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { hasAdminOrMergerPermissions } from 'src/shared/utils/permissions';
import { WordSuggestion, ExampleSuggestion } from 'src/backend/controllers/utils/interfaces';
import network from '../network';
import userStatBodies from './userStatBodies';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const baseOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
    },
  },
};

const createChartOptions = (title) => ({
  ...baseOptions,
  plugins: {
    ...baseOptions.plugins,
    title: {
      ...baseOptions.plugins.title,
      text: title,
    },
  },
});

const wordSuggestionsChartOptions = createChartOptions('Merged Word Suggestions');
const exampleSuggestionsChartOptions = createChartOptions('Merged Example Suggestions');
const THREE_MONTH_WEEKS_COUNT = 12;

const UserStat = ({ uid, permissions } : { uid?: string, permissions: ShowProps['permissions'] }): ReactElement => {
  const [userStats, setUserStats] = useState(null);
  const [wordSuggestionMergeStats, setWordSuggestionMergeStats] = useState(null);
  const [exampleSuggestionMergeStats, setExampleSuggestionMergeStats] = useState(null);
  const showMergeCharts = hasAdminOrMergerPermissions(permissions, true);

  useEffect(() => {
    (async () => {
      const res = await network(uid ? `/stats/users/${uid}` : '/stats/user');
      setUserStats(res.json);
      if (uid) {
        const { json } = await network(`/stats/users/${uid}/merge`);
        const { wordSuggestionMerges, exampleSuggestionMerges } = json as {
          wordSuggestionMerges: WordSuggestion[],
          exampleSuggestionMerges: ExampleSuggestion[],
        };
        const threeMonthsAgoWeek = moment().subtract(3, 'months').isoWeek();
        const labels = [];
        for (let i = threeMonthsAgoWeek; i <= threeMonthsAgoWeek + THREE_MONTH_WEEKS_COUNT; i += 1) {
          labels.push(`Week of ${moment().isoWeek(i).format('MMMM Do')}`);
        }
        const wordSuggestionData = {
          labels,
          datasets: [
            {
              label: 'Word Suggestion Merges',
              data: Object.entries(wordSuggestionMerges).reduce((finalData, [isoWeek, wordSuggestions]) => {
                const position = parseInt(isoWeek, 10) - threeMonthsAgoWeek;
                finalData[position] = wordSuggestions.length;
                return finalData;
              }, new Array(THREE_MONTH_WEEKS_COUNT).fill(0)),
              backgroundColor: '#48825D',
              borderWidth: 2,
              borderColor: '#18532D',
              borderRadius: 10,
            },
          ],
        };
        const exampleSuggestionData = {
          labels,
          datasets: [
            {
              label: 'Example Suggestion Merges',
              data: Object.entries(exampleSuggestionMerges).reduce((finalData, [isoWeek, exampleSuggestions]) => {
                const position = parseInt(isoWeek, 10) - threeMonthsAgoWeek;
                finalData[position] = exampleSuggestions.length;
                return finalData;
              }, new Array(THREE_MONTH_WEEKS_COUNT).fill(0)),
              backgroundColor: '#3C83FF',
              borderWidth: 2,
              borderColor: '#2D62BE',
              borderRadius: 10,
            },
          ],
        };
        setWordSuggestionMergeStats(wordSuggestionData);
        setExampleSuggestionMergeStats(exampleSuggestionData);
      }
    })();
  }, []);

  return (
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
      {showMergeCharts ? (
        <Accordion defaultIndex={[0]} allowMultiple className="w-full my-6">
          <AccordionItem>
            <ChakraTooltip
              label="These charts represent the total number of suggesitons
              merged by you on a weekly basis for the past three months."
              placement="bottom-start"
            >
              <AccordionButton>
                <Box className="w-full flex flex-row items-center">
                  <Text fontWeight="bold">Three month Time-based Suggestion Merges</Text>
                  <AccordionIcon />
                </Box>
              </AccordionButton>
            </ChakraTooltip>
            <AccordionPanel>
              {wordSuggestionMergeStats ? (
                <Bar options={wordSuggestionsChartOptions} data={wordSuggestionMergeStats} />
              ) : null}
              {exampleSuggestionMergeStats ? (
                <Bar options={exampleSuggestionsChartOptions} data={exampleSuggestionMergeStats} />
              ) : null}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      ) : null}
    </Skeleton>
  );
};

export default UserStat;
