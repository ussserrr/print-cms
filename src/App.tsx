import { BrowserRouter as Router } from 'react-router-dom';
import RouterTitle from 'react-router-title';

import { createClient, dedupExchange, cacheExchange, Provider as UrqlProvider } from 'urql';
import { multipartFetchExchange } from '@urql/exchange-multipart-fetch';

import { Client as StyletronClient } from 'styletron-engine-atomic';
import { Provider as StyletronProvider, DebugEngine } from 'styletron-react';
import { BaseProvider, LocaleProvider, DarkTheme as Theme } from 'baseui';
import { PLACEMENT, ToasterContainer } from 'baseui/toast';

import { API_URL, TOAST_AUTO_HIDE_DURATION } from './util/constants';
import ROUTES from './routes';
import { routerTitleCallback } from './routing';
import locale from './util/locale';
import { ServiceConfigProvider } from './service-config/data';
import { Main } from './Main';


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
        <RouterTitle
          pageTitle='Печатные шаблоны'
          routesConfig={ROUTES}
          callback={routerTitleCallback}
        />
        <StyletronProvider
          value={engine}
          debug={styletronDebug}
          debugAfterHydration
        >
          <BaseProvider theme={Theme}>
            <LocaleProvider locale={locale}>
              <ToasterContainer
                placement={PLACEMENT.bottomRight}
                autoHideDuration={TOAST_AUTO_HIDE_DURATION}
              >
                <ServiceConfigProvider>
                  <Main />
                </ServiceConfigProvider>
              </ToasterContainer>
            </LocaleProvider>
          </BaseProvider>
        </StyletronProvider>
      </Router>
    </UrqlProvider>
  );
}

export default App;
