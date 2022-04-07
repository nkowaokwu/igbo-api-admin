import WordClass from '../constants/WordClass';

const isVerb = (wordClass: string): boolean => (
  wordClass === WordClass.AV.value
  || wordClass === WordClass.PV.value
  || wordClass === WordClass.MV.value
);

export default isVerb;
