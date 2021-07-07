import * as React from 'react';

import { toaster } from 'baseui/toast';
import { OptionsT } from 'baseui/select';

import { Duration, DurationObject } from 'luxon';

import { API_URL } from './routes';


type ServiceConfig =
  | {
      filesToKeep: number;
      allowedFileTypes: {
        extension: string;
        mime: string;
      }[];
      printJob: {
        timeoutMs: number;
        removeAfter: Duration | number | DurationObject;  // luxon format
      };
      owners: OptionsT[];
    }
  | { loading: true }
  | { error: Error }

export const serviceConfigDescription = {
  filesToKeep: 'Максимальное количество файлов на шаблон',
  allowedFileTypes: 'Допустимые типы файлов',
  printJob: {
    _title: 'Задача печати',
    timeoutMs: 'Время ожидания, мс',
    removeAfter: 'Очистить выполненные задачи после (формат Luxon)'
  },
  owners: 'Допустимые владельцы'
} as const;

export const ServiceConfigContext = React.createContext<ServiceConfig>({ loading: true });
ServiceConfigContext.displayName = 'ServiceConfigContext';


export function ServiceConfigProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = React.useState<ServiceConfig>({ loading: true });

  React.useEffect(() => {
    fetch(API_URL + '/print/config')
      .then(async response => {
        if (!response.ok) throw new Error(response.statusText);
        const config = await response.json();
        setValue(config);
      })
      .catch(error => {
        setValue({ error });
        toaster.negative(`Ошибка получения настроек сервиса печати.
          Некоторые функции могут быть недоступны (${error.message})`, {});
      });
  }, []);

  return (
    <ServiceConfigContext.Provider value={value}>
      {children}
    </ServiceConfigContext.Provider>
  );
}
