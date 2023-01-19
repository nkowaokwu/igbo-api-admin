import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import * as Interfaces from '../controllers/utils/interfaces';

export default (req: Interfaces.EditorRequest, res: Response, next: NextFunction): Response | void => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400);
      return res.send({ error: 'Provided an invalid id' });
    }
    return next();
  } catch (err) {
    res.status(400);
    return res.send({ error: err.message });
  }
};
