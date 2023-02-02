import React, { ReactElement, useEffect, useState } from 'react';
import { times } from 'lodash';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Text,
  Tooltip as ChakraTooltip,
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
import PersonalStats from '../PersonalStats/PersonalStats';
import LacunaProgress from '../LacunaProgress';
import Support from '../Support';

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

const mergedWorkChartOptions = createChartOptions('Merged Work');
const THREE_MONTH_WEEKS_COUNT = 12;
const sortDates = (a, b) => a < b ? 1 : -1;
const sortMerges = (merges) => Object.entries(merges).sort(sortDates).map(([, value]) => value).reverse();

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
  const [mergeStats, setMergeStats] = useState(null);
  const [currentMonthMergeStats, setCurrentMonthMergeStats] = useState(null);
  const { permissions } = usePermissions();
  const showMergeCharts = hasAdminOrMergerPermissions(permissions, true);

  useEffect(() => {
    (async () => {
      network(uid ? `/stats/users/${uid}` : '/stats/user')
        .then((res) => setUserStats(res.json));
      if (uid) {
        const { json: merges } = await network(`/stats/users/${uid}/merge`);
        const {
          exampleSuggestionMerges,
          dialectalVariationMerges,
          currentMonthMerges,
        } = merges;
        const labels = times(THREE_MONTH_WEEKS_COUNT, (index) => (
          `Week of ${moment().startOf('week').subtract(index, 'week').format('MMMM Do')}`
        )).reverse();
        const updatedMergeStats = {
          labels,
          datasets: [
            {
              label: 'Example Suggestion Merges',
              data: sortMerges(exampleSuggestionMerges),
              backgroundColor: '#3C83FF',
              borderWidth: 2,
              borderColor: '#2D62BE',
              borderRadius: 10,
            },
            {
              label: 'Dialectal Variation Merges',
              data: sortMerges(dialectalVariationMerges),
              backgroundColor: '#FF5733',
              borderWidth: 2,
              borderColor: '#CA4225',
              borderRadius: 10,
            },
          ],
        };
        setMergeStats(updatedMergeStats);
        setCurrentMonthMergeStats(currentMonthMerges);
      }
    })();
  }, []);

  return (
    <Box>
      <Box className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
        <LacunaProgress
          totalCompletedWords={totalCompletedWords}
          totalCompletedExamples={totalCompletedExamples}
          totalDialectalVariations={totalDialectalVariations}
          mergeStats={mergeStats}
          currentMonthMergeStats={currentMonthMergeStats}
        />
        <PersonalStats userStats={userStats} />
        <Support />
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
              {mergeStats ? (
                <Bar options={mergedWorkChartOptions} data={mergeStats} />
              ) : null}
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      ) : null}
    </Box>
  );
};

export default UserStat;
