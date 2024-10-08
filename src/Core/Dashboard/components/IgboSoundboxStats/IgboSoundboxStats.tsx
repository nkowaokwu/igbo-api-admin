import React, { ReactElement, useState } from 'react';
import moment from 'moment';
import { entries, isNaN } from 'lodash';
import { Box, Button, Text, chakra } from '@chakra-ui/react';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
import { usePermissions } from 'react-admin';
import { hasAdminPermissions } from 'src/shared/utils/permissions';
import { PRICE_PER_RECORDING, PRICE_PER_REVIEW } from 'src/Core/constants';
import useIsIgboAPIProject from 'src/hooks/useIsIgboAPIProject';
import { FetchedStats } from 'src/Core/Dashboard/components/UserStat/UserStatInterfaces';
import StatTypes from 'src/backend/shared/constants/StatTypes';
import LinearProgressCard from '../LinearProgressCard';

/** Calculates the payment for the provided count */
export const calculatePayment = (recordings: number, reviews: number): string => {
  if (
    recordings <= 0 ||
    isNaN(recordings) ||
    typeof recordings !== 'number' ||
    reviews <= 0 ||
    isNaN(reviews) ||
    typeof reviews !== 'number'
  ) {
    return '$0.00';
  }
  const recordingsPrice = (recordings || 0) * PRICE_PER_RECORDING;
  const reviewsPrice = (reviews || 0) * PRICE_PER_REVIEW;

  return `$${(recordingsPrice + reviewsPrice).toFixed(2)}`;
};
const BYTES_TO_SECONDS = 43800;
const transformBytesToTime = (bytes: number) => {
  const seconds = Math.floor(bytes / BYTES_TO_SECONDS);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;

  return formattedTime;
};

const IgboSoundboxStats = ({ stats }: { stats: FetchedStats }): ReactElement => {
  const permissions = usePermissions();
  const isIgboAPIProject = useIsIgboAPIProject();
  const showPaymentCalculations = isIgboAPIProject && hasAdminPermissions(permissions?.permissions, true);
  const [currentMonth, setCurrentMonth] = useState(moment().startOf('month').format('MMM, YYYY'));
  const contributedStats = entries(stats || {}).flatMap(
    ([key, statInfo]: [StatTypes, FetchedStats[StatTypes.RECORDINGS] | FetchedStats[StatTypes.TRANSLATIONS]]) => {
      switch (key) {
        case StatTypes.RECORDINGS:
          return [
            {
              totalCount: (statInfo as FetchedStats[StatTypes.RECORDINGS]).stats[currentMonth]?.count || 0,
              heading: 'Recorded sentences',
              description: 'The number of sentence audio you have recorded',
            },
            {
              totalCount: transformBytesToTime(
                (statInfo as FetchedStats[StatTypes.RECORDINGS]).stats[currentMonth]?.bytes || 0,
              ),
              heading: 'Total audio recorded',
              description: 'The amount of time recorded',
            },
          ];
        case StatTypes.TRANSLATIONS:
          return {
            totalCount: statInfo.stats[currentMonth] || 0,
            heading: 'Translated sentences',
            description: 'The number of sentence translations you have created',
          };
        default:
          return [];
      }
    },
  );

  const handlePreviousMonth = () => {
    setCurrentMonth(moment(currentMonth).subtract(1, 'month').startOf('month').format('MMM, YYYY'));
  };
  const handleNextMonth = () => {
    setCurrentMonth(moment(currentMonth).add(1, 'month').startOf('month').format('MMM, YYYY'));
  };

  return (
    <Box className="mb-6 space-y-3 w-full">
      <Box className="w-full">
        <Box className="space-y-2" mb={2}>
          <Box className="flex flex-row justify-between items-center w-full">
            <Button onClick={handlePreviousMonth} isDisabled={!contributedStats.length} leftIcon={<ArrowBackIcon />}>
              Previous month
            </Button>
            <Button
              onClick={handleNextMonth}
              isDisabled={moment().startOf('month').format('MMM, YYYY') === currentMonth}
              rightIcon={<ArrowForwardIcon />}
            >
              Next month
            </Button>
          </Box>
          <Text fontStyle="italic" fontSize="sm" color="gray">
            Stats are showing for {currentMonth}
          </Text>
        </Box>
        <Box className="flex flex-col lg:flex-row space-y-3 lg:space-x-3 lg:space-y-0">
          <LinearProgressCard
            heading="Contributions"
            description="Contributions that you have made to this project"
            stats={contributedStats}
            isLoaded
          >
            {showPaymentCalculations ? (
              <Box>
                <Text fontFamily="heading">Price to be paid to the user:</Text>
                <chakra.span fontFamily="heading">
                  {calculatePayment(contributedStats[0].totalCount, contributedStats[1].totalCount)}
                </chakra.span>
              </Box>
            ) : null}
          </LinearProgressCard>
        </Box>
      </Box>
    </Box>
  );
};

export default IgboSoundboxStats;
