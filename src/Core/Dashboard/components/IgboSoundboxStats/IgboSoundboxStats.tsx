import React, { ReactElement, useState } from 'react';
import moment from 'moment';
import { isNaN } from 'lodash';
import { Box, Button, Text, chakra } from '@chakra-ui/react';
import { usePermissions } from 'react-admin';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import { hasAdminPermissions } from 'src/shared/utils/permissions';
import { PRICE_PER_RECORDING, PRICE_PER_REVIEW } from 'src/Core/constants';
import LinearProgressCard from '../LinearProgressCard';

const GOAL = 4000;

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
  recordingStats = { recorded: {}, verified: {}, mergedRecorded: {} },
  audioStats = { timestampedAudioApprovals: {}, timestampedAudioDenials: {} },
}: {
  recordingStats: {
    recorded: { [key: string]: number };
    verified: { [key: string]: number };
    mergedRecorded: { [key: string]: number };
  };
  audioStats: {
    timestampedAudioApprovals: { [key: string]: number };
    timestampedAudioDenials: { [key: string]: number };
  };
}): ReactElement => {
  const permissions = usePermissions();
  const showPaymentCalculations = hasAdminPermissions(permissions?.permissions, true);
  const [currentMonth, setCurrentMonth] = useState(moment().startOf('month').format('MMM, YYYY'));
  const contributedStats = [
    {
      totalCount: recordingStats.recorded[currentMonth],
      goal: GOAL,
      heading: 'Recorded example sentence audio',
      description: 'The number of example sentence audio you have recorded',
    },
    {
      totalCount: recordingStats.verified[currentMonth] || 0,
      goal: GOAL,
      heading: 'Reviewed example sentence audio',
      description: 'The number of example sentence audio you have reviewed',
    },
  ];

  const receivedStats = [
    {
      totalCount: audioStats.timestampedAudioApprovals[currentMonth] || 0,
      goal: GOAL,
      heading: 'Approved audio recordings',
      description:
        'The number of audio recordings that you have recorded ' +
        'that have been approved by at least two other reviewers.',
      leftIcon: <ThumbUpOffAltIcon sx={{ color: 'var(--chakra-colors-green-500)' }} />,
    },
    {
      totalCount: audioStats.timestampedAudioDenials[currentMonth] || 0,
      goal: GOAL,
      heading: 'Denied audio recordings',
      description:
        'The number of audio recordings that you have recorded that have been denied by at least one other reviewer.',
      leftIcon: <ThumbDownOffAltIcon sx={{ color: 'var(--chakra-colors-red-500)' }} />,
    },
  ];

  const monthlyRecordedStat = [
    {
      totalCount: recordingStats.mergedRecorded[currentMonth] || 0,
      goal: GOAL,
      heading: `Total recorded audio for ${moment(currentMonth).format('MMM, YYYY')}`,
      description: 'The total number of example sentences recorded for the current month',
    },
  ];

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
            <Button onClick={handlePreviousMonth}>Previous month</Button>
            <Button
              onClick={handleNextMonth}
              isDisabled={moment().startOf('month').format('MMM, YYYY') === currentMonth}
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
            heading="Igbo Soundbox Contributions"
            description="Contributions that you have made on the platform"
            stats={contributedStats}
            isLoaded
            isGeneric
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
          <LinearProgressCard
            heading="Community Reviews"
            description="Other platform contributors reviewing your audio"
            stats={receivedStats}
            isLoaded
            isGeneric
          />
        </Box>
      </Box>
      <LinearProgressCard
        heading="Monthly merged recorded audio"
        description="The number of merged (verified) recorded audio for each month"
        stats={monthlyRecordedStat}
        isLoaded
        isGeneric
      />
    </Box>
  );
};

export default IgboSoundboxStats;
