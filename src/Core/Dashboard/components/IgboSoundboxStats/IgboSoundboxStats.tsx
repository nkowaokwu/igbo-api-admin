import React, { ReactElement, useState } from 'react';
import moment from 'moment';
import { Box, Button } from '@chakra-ui/react';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import LinearProgressCard from '../LinearProgressCard';

const GOAL = 4000;
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
      />
    </Box>
  );
};

export default IgboSoundboxStats;
