import React, { ReactElement } from 'react';
import { get } from 'lodash';
import { Box, Link } from '@chakra-ui/react';
import { IdFieldProps } from '../interfaces';

const TWITTER_ROOT = 'https://twitter.com/nkowaokwu/status';

const TweetField = ({ source, record = {} }: IdFieldProps): ReactElement => (
  <Box display="flex" flexDirection="row" alignItems="center" className="space-x-4">
    <Link
      className="MuiTypography-root MuiTypography-body"
      href={`${TWITTER_ROOT}/${get(record, source)}`}
      color="green.600"
      textDecoration="underline"
      target="_blank"
    >
      Go to tweet
    </Link>
  </Box>
);
export default TweetField;
