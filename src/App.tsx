import * as React from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import RouterTitle from 'react-router-title';

import { createClient, dedupExchange, cacheExchange, Provider as UrqlProvider } from 'urql';
import { multipartFetchExchange } from '@urql/exchange-multipart-fetch';

import { Client as StyletronClient } from 'styletron-engine-atomic';
import { Provider as StyletronProvider, DebugEngine } from 'styletron-react';
import { BaseProvider, LocaleProvider, LightTheme as Theme } from 'baseui';
import {
  ToasterContainer,
  PLACEMENT
} from 'baseui/toast';

import { Main } from './Main';
import { API_URL, routerTitleCallback, ROUTES } from './routes';


const styletronDebug = process.env.NODE_ENV === 'production' ? void 0 : new DebugEngine();
const engine = new StyletronClient();

export const gqlClient = createClient({
  url: API_URL + '/graphql',
  exchanges: [dedupExchange, cacheExchange, multipartFetchExchange]
});


function App() {
  return (
    <UrqlProvider value={gqlClient}>
      <Router>
        <RouterTitle pageTitle='Печатные шаблоны' routesConfig={ROUTES} callback={routerTitleCallback} />
        <StyletronProvider value={engine} debug={styletronDebug} debugAfterHydration>
          <BaseProvider theme={Theme}>
            <LocaleProvider locale={{
              fileuploader: {
                dropFilesToUpload: 'Перетяните сюда файл для загрузки',
                or: 'или...',
                browseFiles: 'Выберите файл',
                retry: 'Повторить',
                cancel: 'Отмена'
              },
              pagination: {
                prev: 'Пред.',
                next: 'След.',
                preposition: 'из'
              },
              select: {
                noResultsMsg: 'Не найдено',
                placeholder: 'Выбрать...',
                create: 'Создать'
              }
            }}>
              <ToasterContainer placement={PLACEMENT.bottomRight} autoHideDuration={5000}>
                <Main />
              </ToasterContainer>
            </LocaleProvider>
          </BaseProvider>
        </StyletronProvider>
      </Router>
    </UrqlProvider>
  );
}

export default App;
