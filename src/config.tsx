import * as React from 'react';

import { toaster } from 'baseui/toast';
import { OptionsT } from 'baseui/select';

import { Duration, DurationObject } from 'luxon';


type ServiceConfig =
  |
    {
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

export const ServiceConfigContext = React.createContext<ServiceConfig>({ loading: true });
ServiceConfigContext.displayName = 'ServiceConfigContext';

export function ServiceConfigProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = React.useState<ServiceConfig>({ loading: true });

  React.useEffect(() => {
    fetch('http://192.168.1.214:4000/print/config')
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
