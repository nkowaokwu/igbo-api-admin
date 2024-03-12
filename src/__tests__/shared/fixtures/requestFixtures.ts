import { cloneDeep } from 'lodash';
import { NextFunction, Response } from 'express';
import { Connection } from 'mongoose';
import { EditorRequest } from 'src/backend/controllers/utils/interfaces';

export const findOneMock = jest.fn((data) => data);

export const mongooseConnectionFixture = ({ findOne }: { findOne?: any } = {}) =>
  // @ts-expect-error Connection
  ({
    model: () => ({
      findOne: () => findOneMock(findOne),
    }),
  } as Connection);

export const requestFixture = (data: any = {}) =>
  ({
    mongooseConnection: mongooseConnectionFixture(),
    params: { id: '' },
    ...cloneDeep(data),
  } as EditorRequest);

export const responseFixture = () =>
  // @ts-expect-error Response
  ({
    send: jest.fn(),
  } as Response);

export const nextFixture = () => jest.fn() as NextFunction;
