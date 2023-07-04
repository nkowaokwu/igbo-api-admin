import { ReactElement } from 'react';

interface LinearProgressCard {
  heading: string;
  description?: string;
  stats: {
    totalCount: number;
    goal: number;
    heading: string;
    description: string;
    leftIcon: ReactElement;
  }[];
  isLoaded: boolean;
  isGeneric?: boolean;
}

export default LinearProgressCard;
