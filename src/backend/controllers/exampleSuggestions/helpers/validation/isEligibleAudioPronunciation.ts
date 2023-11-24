import Joi from 'joi';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import { MINIMUM_DENIALS } from 'src/backend/shared/constants/Review';

/**
 * Determines if the current audio pronunciation is a valid recording, eligible to be merged
 * @param param0 pronunciation and uid
 * @returns Boolean if the audio pronunciation is a valid recording
 */
const isEligibleAudioPronunciation = ({
  pronunciation,
  uid,
}: {
  pronunciation: Interfaces.PronunciationData;
  uid: string;
}): boolean => {
  const pronunciationSchema = Joi.object().keys({
    approvals: Joi.array().min(0).items(Joi.string().allow('', null)),
    denials: Joi.array().max(MINIMUM_DENIALS).items(Joi.string().allow('', null)),
    audio: Joi.string().pattern(new RegExp('^http')).required(),
    speaker: Joi.string().valid(uid).required(),
    review: Joi.boolean().valid(true).required(),
    archived: Joi.boolean().valid(false).optional(),
  });

  const validation = pronunciationSchema.validate(pronunciation, { abortEarly: false });
  if (validation.error) {
    console.log(validation.error);
    return false;
  }
  return true;
};

export default isEligibleAudioPronunciation;
