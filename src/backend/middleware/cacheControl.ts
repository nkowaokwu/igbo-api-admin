import type { Response, NextFunction } from 'express';
import * as Interfaces from 'src/backend/controllers/utils/interfaces';

export default (_: Interfaces.EditorRequest, res: Response, next: NextFunction): void => {
  res.set('Cache-Control', 'public max-age=300 s-maxage=600');
  return next();
};
