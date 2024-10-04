import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import { EditorRequest } from '../controllers/utils/interfaces';

export default async (req: EditorRequest, res: Response, next: NextFunction): Promise<any> => {
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
