import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  associatedWords: yup.array().min(1).of(yup.string().required()),
  igbo: yup.string().required(),
  english: yup.string().required(),
});

const resolver = {
  resolver: yupResolver(schema),
};

export default resolver;
