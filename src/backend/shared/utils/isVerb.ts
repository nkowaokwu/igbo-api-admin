import WordClassEnum from 'src/backend/shared/constants/WordClassEnum';

const isVerb = (wordClass: string): boolean =>
  wordClass === WordClassEnum.AV || wordClass === WordClassEnum.PV || wordClass === WordClassEnum.MV;

export default isVerb;
