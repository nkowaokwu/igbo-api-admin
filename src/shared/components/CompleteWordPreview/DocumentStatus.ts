export default {
  INSUFFICIENT: {
    value: 'insufficient',
    label: 'This document is insufficient.',
    colorScheme: 'red',
    tooltipColor: 'red.200',
    variant: 'solid',
    badge: 'Insufficient',
    'data-test': 'insufficient-word-label',
  },
  SUFFICIENT: {
    value: 'sufficient',
    label: 'This document is sufficient.',
    colorScheme: 'green',
    tooltipColor: 'green.200',
    variant: 'outline',
    badge: 'Sufficient',
    'data-test': 'sufficient-word-label',
  },
  COMPLETE: {
    value: 'complete',
    label: 'This document is complete.',
    colorScheme: 'green',
    tooltipColor: 'blue.200',
    variant: 'solid',
    badge: 'Complete',
    'data-test': 'complete-word-label',
  },
};
