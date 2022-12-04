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
import { usePermissions } from 'react-admin';
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
import network from '../../network';
import userStatBodies from './userStatBodies';
import LacunaProgress from '../LacunaProgress';

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
const dialectalVariationsChartOptions = createChartOptions('Merged Dialectal Variations');
const THREE_MONTH_WEEKS_COUNT = 12;

const UserStat = ({
  uid,
  totalCompletedWords,
  totalCompletedExamples,
  totalDialectalVariations,
} : {
  uid?: string,
  totalCompletedWords: number,
  totalCompletedExamples: number,
  totalDialectalVariations: number,
}): ReactElement => {
  const [userStats, setUserStats] = useState(null);
  const [wordSuggestionMergeStats, setWordSuggestionMergeStats] = useState(null);
  const [exampleSuggestionMergeStats, setExampleSuggestionMergeStats] = useState(null);
  const [dialectalVariationMergeStats, setDialectalVariationMergeStats] = useState(null);
  const { permissions } = usePermissions();
  const showMergeCharts = hasAdminOrMergerPermissions(permissions, true);

  useEffect(() => {
    (async () => {
      network(uid ? `/stats/users/${uid}` : '/stats/user')
        .then((res) => setUserStats(res.json));
      if (uid) {
        const { json: merges } = await network(`/stats/users/${uid}/merge`);
        const {
          wordSuggestionMerges,
          exampleSuggestionMerges,
          dialectalVariationMerges,
        } = merges;
        const threeMonthsAgoWeek = moment().subtract(3, 'months').isoWeek() + 1;
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
                finalData[position] = wordSuggestions;
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
                finalData[position] = exampleSuggestions;
                return finalData;
              }, new Array(THREE_MONTH_WEEKS_COUNT).fill(0)),
              backgroundColor: '#3C83FF',
              borderWidth: 2,
              borderColor: '#2D62BE',
              borderRadius: 10,
            },
          ],
        };
        const dialectalVariationData = {
          labels,
          datasets: [
            {
              label: 'Dialectal Variation Merges',
              data: Object.entries(dialectalVariationMerges).reduce((finalData, [isoWeek, dialectalVariations]) => {
                const position = parseInt(isoWeek, 10) - threeMonthsAgoWeek;
                finalData[position] = dialectalVariations;
                return finalData;
              }, new Array(THREE_MONTH_WEEKS_COUNT).fill(0)),
              backgroundColor: '#FF5733',
              borderWidth: 2,
              borderColor: '#CA4225',
              borderRadius: 10,
            },
          ],
        };
        setWordSuggestionMergeStats(wordSuggestionData);
        setExampleSuggestionMergeStats(exampleSuggestionData);
        setDialectalVariationMergeStats(dialectalVariationData);
      }
    })();
  }, []);

  return (
    <>
      <LacunaProgress
        totalCompletedWords={totalCompletedWords}
        totalCompletedExamples={totalCompletedExamples}
        totalDialectalVariations={totalDialectalVariations}
        wordSuggestionMergeStats={wordSuggestionMergeStats}
        exampleSuggestionMergeStat={exampleSuggestionMergeStats}
        dialectalVariationMergeStats={dialectalVariationMergeStats}
      />
      <Skeleton isLoaded={userStats} minHeight={32}>
        <Box mt={4}>
          <Text fontSize="3xl" fontWeight="bold" className="text-center">Personal Contributions</Text>
          <Text fontSize="lg" className="text-gray-800 text-center">
            {'You\'ve made contributions!\n'
            + 'You can click on each stat to see the associated documents'}
          </Text>
        </Box>
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
                label="These charts represent the total number of suggestions
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
                {dialectalVariationMergeStats ? (
                  <Bar options={dialectalVariationsChartOptions} data={dialectalVariationMergeStats} />
                ) : null}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        ) : null}
      </Skeleton>
    </>
  );
};

export default UserStat;
