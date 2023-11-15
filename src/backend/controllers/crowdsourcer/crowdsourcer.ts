import { Response } from 'express';
import { crowdsourcerSchema } from '../../models/Crowdsourcer';
import { referralSchema } from '../../models/Referral';
import { handleQueries } from '../utils';
import * as Interfaces from '../utils/interfaces';

export const createReferral = async (req: Interfaces.EditorRequest, res: Response): Promise<void> => {
  const {
    mongooseConnection,
    referralCode,
    user: { uid },
  } = handleQueries(req);

  const Crowdsourcer = mongooseConnection.model<Interfaces.Crowdsourcer>('Crowdsourcer', crowdsourcerSchema);

  const [referrer, referredUser] = await Promise.all([
    Crowdsourcer.findOne({ referralCode }),
    Crowdsourcer.findOne({ firebaseId: uid }),
  ]);

  const Referral = mongooseConnection.model<Interfaces.Referral>('Referral', referralSchema);

  const existingReferral = await Referral.findOne({ referredUserId: referredUser.firebaseId });
  if (existingReferral) {
    res.status(403).send({ error: `Users cannot be referred twice. Referral code ${referralCode} will be ignored` });
  }

  await Referral.create({
    referredUserId: referredUser.firebaseId,
    referrerId: referrer.firebaseId,
  });

  res.send({ message: 'Referral successful' });
};
