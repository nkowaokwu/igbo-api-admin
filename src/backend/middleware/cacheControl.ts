import type { Request, Response, NextFunction } from 'express';

export default (_: Request, res: Response, next: NextFunction): void => {
  res.set('Cache-Control', 'public max-age=300 s-maxage=600');
  return next();
};
