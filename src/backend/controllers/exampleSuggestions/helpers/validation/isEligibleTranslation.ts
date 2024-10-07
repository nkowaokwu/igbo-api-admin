import Joi from 'joi';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';
import LanguageEnum from 'src/backend/shared/constants/LanguageEnum';
import { MINIMUM_DENIALS } from 'src/backend/shared/constants/Review';

const isEligibleTranslation = ({
  translation,
  uid,
}: {
  translation: Interfaces.OutgoingTranslation;
  uid: string;
}): boolean => {
  const translationSchema = Joi.object().keys({
    approvals: Joi.array().min(0).items(Joi.string().allow('', null)),
    denials: Joi.array().max(MINIMUM_DENIALS).items(Joi.string().allow('', null)),
    text: Joi.string().required(),
    authorId: Joi.string().valid(uid).required(),
    language: Joi.alternatives(
      ...Object.values(LanguageEnum).filter((language) => language !== LanguageEnum.UNSPECIFIED),
    ),
    pronunciations: Joi.array().min(0),
  });

  const validation = translationSchema.validate(translation, { abortEarly: false });
  if (validation.error) {
    return false;
  }
  return true;
};

export default isEligibleTranslation;
