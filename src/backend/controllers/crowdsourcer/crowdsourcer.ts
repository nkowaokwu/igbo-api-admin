import { Response } from 'express';
import { omit } from 'lodash';
import { CrowdsourcerSchema } from '../../models/Crowdsourcer';
import { handleQueries } from '../utils';
import * as Interfaces from '../utils/interfaces';

export const findReferralCode = async (req: Interfaces.EditorRequest, res: Response): Promise<void> => {
  const {
    mongooseConnection,
    user: { uid },
  } = handleQueries(req);

  const Crowdsourcer = mongooseConnection.model<Interfaces.Crowdsourcer>('Crowdsourcer', CrowdsourcerSchema);
  const crowdsourcer = await Crowdsourcer.findOne({ firebaseId: uid });
  res.send(omit(crowdsourcer, ['_id', '__v', 'createdAt', 'updatedAt']));
};
