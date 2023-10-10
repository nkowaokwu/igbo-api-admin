import React, { ReactElement, useState } from 'react';
import moment from 'moment';
import { isNaN } from 'lodash';
import { Box, Button, Text, chakra } from '@chakra-ui/react';
import { usePermissions } from 'react-admin';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import { hasAdminPermissions } from 'src/shared/utils/permissions';
import { PRICE_PER_VERIFIED_RECORDING } from 'src/Core/constants';
import LinearProgressCard from '../LinearProgressCard';

const GOAL = 4000;

/** Calculates the payment for the provided count */
export const calculatePayment = (count: number): string => {
  if (count <= 0 || isNaN(count) || typeof count !== 'number') {
    return '$0.00';
  }
  return `$${((count || 0) * PRICE_PER_VERIFIED_RECORDING).toFixed(2)}`;
};

const IgboSoundboxStats = ({
  recordingStats,
  audioStats,
}: {
  recordingStats: {
    recorded: number;
    verified: number;
    allRecorded: { [key: string]: number };
  };
  audioStats: { audioApprovalsCount: number; audioDenialsCount: number };
}): ReactElement => {
  const permissions = usePermissions();
  const showPaymentCalculations = hasAdminPermissions(permissions?.permissions, true);
  const [currentMonth, setCurrentMonth] = useState(moment().startOf('month').format('MMM, YYYY'));
  const stats = [
    {
      totalCount: recordingStats.recorded,
      goal: GOAL,
      heading: 'Recorded example sentences',
      description: 'The number of recorded example sentences you have contributed',
    },
    {
      totalCount: recordingStats.verified,
      goal: GOAL,
      heading: 'Verified example sentences',
      description: 'The number of example sentences you have reviewed.',
    },
    {
      totalCount: audioStats.audioApprovalsCount,
      goal: GOAL,
      heading: 'Approved audio recordings',
      description: 'The number of audio recordings that you have recorded that have been approved by others.',
      leftIcon: <ThumbUpOffAltIcon sx={{ color: 'var(--chakra-colors-green-500)' }} />,
    },
    {
      totalCount: audioStats.audioDenialsCount,
      goal: GOAL,
      heading: 'Denied audio recordings',
      description: 'The number of audio recordings that you have recorded that have been denied by others.',
      leftIcon: <ThumbDownOffAltIcon sx={{ color: 'var(--chakra-colors-red-500)' }} />,
    },
  ];

  const monthlyRecordedStat = [
    {
      totalCount: recordingStats.allRecorded[currentMonth] || -1,
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
      <LinearProgressCard
        heading="Igbo Soundbox Contributions"
        description="Your personalized Igbo Soundbox statistics"
        stats={stats}
        isLoaded
        isGeneric
      />
      <Box className="flex flex-row justify-between items-center w-full">
        <Button onClick={handlePreviousMonth}>Previous month</Button>
        <Button onClick={handleNextMonth}>Next month</Button>
      </Box>
      <LinearProgressCard
        heading="Monthly recorded example sentences"
        description="The number of recorded example sentences for each month"
        stats={monthlyRecordedStat}
        isLoaded
        isGeneric
      >
        {showPaymentCalculations ? (
          <Box>
            <Text fontFamily="heading">Price to be paid to the user:</Text>
            <chakra.span fontFamily="heading">{calculatePayment(monthlyRecordedStat[0].totalCount)}</chakra.span>
          </Box>
        ) : null}
      </LinearProgressCard>
    </Box>
  );
};

export default IgboSoundboxStats;
