import { Request, Response, NextFunction } from 'express';
import { connectDatabase, disconnectDatabase } from '../utils/database';

export default () => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // Create a MongoDB connection
  const mongooseConnection = await connectDatabase();

  // Disconnect from database if not in a testing environment
  if (process.env.NODE_ENV !== 'test') {
    const afterResponse = async () => {
      await disconnectDatabase(mongooseConnection);
    };
    res.on('finish', afterResponse);
    res.on('close', afterResponse);
  }
  req.mongooseConnection = mongooseConnection;
  next();
};
