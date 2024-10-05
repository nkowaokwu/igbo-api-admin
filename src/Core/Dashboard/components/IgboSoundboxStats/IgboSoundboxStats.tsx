import React, { ReactElement, useState } from 'react';
import moment from 'moment';
import { isNaN } from 'lodash';
import { Box, Button, Text, chakra } from '@chakra-ui/react';
import { usePermissions } from 'react-admin';
import { hasAdminPermissions } from 'src/shared/utils/permissions';
import { PRICE_PER_RECORDING, PRICE_PER_REVIEW } from 'src/Core/constants';
import useIsIgboAPIProject from 'src/hooks/useIsIgboAPIProject';
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons';
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

const IgboSoundboxStats = ({
  stats,
}: {
  stats: Record<string, { stats: Record<string, number>; heading: string; description: string }>;
}): ReactElement => {
  const permissions = usePermissions();
  const isIgboAPIProject = useIsIgboAPIProject();
  const showPaymentCalculations = isIgboAPIProject && hasAdminPermissions(permissions?.permissions, true);
  const [currentMonth, setCurrentMonth] = useState(moment().startOf('month').format('MMM, YYYY'));
  const contributedStats = Object.values(stats).map((statInfo) => ({
    totalCount: statInfo.stats[currentMonth],
    heading: statInfo.heading,
    description: statInfo.description,
  }));

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
            <Button onClick={handlePreviousMonth} leftIcon={<ArrowBackIcon />}>
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
            description="Contributions that you have made on the platform"
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
