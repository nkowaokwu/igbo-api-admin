import FilterConfigType from 'src/backend/shared/constants/FilterConfigType';

export interface FilterConfig {
  title: string;
  subtitle: string;
  sections: {
    title: string;
    key: string;
    type: FilterConfigType;
    options?: any[];
    optionsFormatter?: (rawValues: any) => Promise<any[]>;
    placeholder?: string;
    fetch?: <T extends unknown>() => Promise<T>;
  }[];
  icon: JSX.Element;
}
