import { cloneDeep } from 'lodash';
import { NextFunction, Response } from 'express';
import { Connection } from 'mongoose';
import { EditorRequest } from 'src/backend/controllers/utils/interfaces';

export const findOneMock = jest.fn((data) => data);
export const saveMock = jest.fn(async (data) => ({ ...data, save: () => data, toJSON: () => data }));

export const mongooseConnectionFixture = ({ findOne }: { findOne?: any } = {}) => {
  class Document {
    constructor(data) {
      this.data = data;
    }

    static findOne() {
      return findOneMock(findOne);
    }

    save() {
      return saveMock({ ...this.data, toJSON: () => this.data });
    }
  }
  // @ts-expect-error Connection
  return {
    model: () => Document,
  } as Connection;
};

export const requestFixture = (data: any = {}) =>
  ({
    mongooseConnection: mongooseConnectionFixture({ findOne: data?.findOne }),
    params: { id: '' },
    ...cloneDeep(data),
  } as EditorRequest);

const sendMock = jest.fn();

export const responseFixture = () =>
  // @ts-expect-error Response
  ({
    status: jest.fn(() => ({
      send: sendMock,
    })),
    send: sendMock,
  } as Response);

export const nextFixture = () => jest.fn() as NextFunction;
