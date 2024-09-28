import { ReactElement } from 'react';

interface LinearProgressCard {
  heading: string;
  description?: string;
  stats: {
    totalCount: number;
    heading: string;
    description: string;
    leftIcon?: ReactElement;
  }[];
  isLoaded: boolean;
  children?: JSX.Element;
}

export default LinearProgressCard;
