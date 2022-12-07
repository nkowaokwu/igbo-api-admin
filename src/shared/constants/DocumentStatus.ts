export default {
  INSUFFICIENT: {
    value: 'insufficient',
    label: 'This document is insufficient.',
    colorScheme: 'red',
    tooltipColor: 'red.200',
    variant: 'subtle',
    badge: 'Insufficient',
    'data-test': 'insufficient-document-label',
  },
  SUFFICIENT: {
    value: 'sufficient',
    label: 'This document is sufficient.',
    colorScheme: 'green',
    tooltipColor: 'green.200',
    variant: 'outline',
    badge: 'Sufficient',
    'data-test': 'sufficient-document-label',
  },
  COMPLETE: {
    value: 'complete',
    label: 'This document is complete.',
    colorScheme: 'green',
    tooltipColor: 'blue.200',
    variant: 'subtle',
    badge: 'Complete',
    'data-test': 'complete-document-label',
  },
};
