import React, { useState, useEffect, ReactElement } from 'react';
import { Box, Heading, Skeleton, Tooltip } from '@chakra-ui/react';
import { getPlatformStats } from 'src/shared/PlatformAPI';

const LoginStats = ({
  theme,
  size,
  className,
}: {
  theme?: string;
  size?: string;
  className?: string;
}): ReactElement => {
  const [audioHours, setAudioHours] = useState(null);
  const [volunteersCount, setVolunteersCount] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const { data: stats } = await getPlatformStats();
        setAudioHours(Math.ceil(stats.hours ?? 0));
        setVolunteersCount(stats.volunteers ?? 0);
      } catch (err) {
        console.log('Unable to fetch platform stats');
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return !isError ? (
    <Skeleton isLoaded={!isLoading}>
      <Box className={`flex flex-row justify-evenly items-start space-x-4 ${className}`}>
        <Box className="flex flex-col justify-center items-center space-y-3">
          <Heading
            as="h2"
            fontFamily="Silka"
            color={theme === 'dark' ? 'gray.700' : 'white'}
            fontSize={size === 'sm' ? 'lg' : '2xl'}
            textAlign="center"
            userSelect="none"
          >
            {audioHours}
          </Heading>
          <Tooltip label={`More than ${audioHours} of annotated Igbo audio`}>
            <Heading
              as="h3"
              fontFamily="Silka"
              color={theme === 'dark' ? 'gray.700' : 'white'}
              fontSize={size === 'sm' ? 'md' : 'xl'}
              textAlign="center"
              userSelect="none"
            >
              Hours of Igbo Audio
            </Heading>
          </Tooltip>
        </Box>
        <Box className="flex flex-col justify-center items-center space-y-3">
          <Heading
            as="h2"
            fontFamily="Silka"
            color={theme === 'dark' ? 'gray.700' : 'white'}
            fontSize={size === 'sm' ? 'lg' : '2xl'}
            textAlign="center"
            userSelect="none"
          >
            {volunteersCount}
          </Heading>
          <Tooltip label={`More than ${volunteersCount} active volunteers using our platform.`}>
            <Heading
              as="h3"
              fontFamily="Silka"
              color={theme === 'dark' ? 'gray.700' : 'white'}
              fontSize={size === 'sm' ? 'md' : 'xl'}
              textAlign="center"
              userSelect="none"
            >
              Active Volunteers
            </Heading>
          </Tooltip>
        </Box>
      </Box>
    </Skeleton>
  ) : null;
};

export default LoginStats;
