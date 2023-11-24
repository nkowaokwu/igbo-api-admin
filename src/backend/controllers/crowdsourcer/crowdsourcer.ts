import { Response, NextFunction } from 'express';
import { crowdsourcerSchema } from '../../models/Crowdsourcer';
import { referralSchema } from '../../models/Referral';
import { handleQueries } from '../utils';
import * as Interfaces from '../utils/interfaces';

/**
 * Creates a new Referral object for Crowdsourcer
 * @param req
 * @param res
 * @param next
 */
export const createReferral = async (
  req: Interfaces.EditorRequest,
  res: Response,
  next: NextFunction,
): Promise<Response<{ message: string }> | void> => {
  try {
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

    return res.send({ message: 'Referral successful' });
  } catch (err) {
    return next(err);
  }
};
