import React, { ReactElement } from 'react';
import { Box } from '@chakra-ui/react';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import LinearProgressCard from '../LinearProgressCard';

const GOAL = 6000;
const IgboSoundboxStats = ({
  recordingStats,
  audioStats,
}: {
  recordingStats: { recorded: number; verified: number };
  audioStats: { audioApprovalsCount: number; audioDenialsCount: number };
}): ReactElement => {
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

  return (
    <Box className="mb-6 space-y-3 w-full">
      <LinearProgressCard
        heading="Igbo Soundbox Contributions"
        description="Your personalized Igbo Soundbox statistics"
        stats={stats}
        isLoaded
        isGeneric
      />
    </Box>
  );
};

export default IgboSoundboxStats;
