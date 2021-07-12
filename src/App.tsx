import React from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import RouterTitle from 'react-router-title';

import { createClient, dedupExchange, cacheExchange, Provider as UrqlProvider } from 'urql';
import { multipartFetchExchange } from '@urql/exchange-multipart-fetch';

import { Client as StyletronClient } from 'styletron-engine-atomic';
import { Provider as StyletronProvider, DebugEngine } from 'styletron-react';
import { BaseProvider, LocaleProvider, LightTheme, DarkTheme } from 'baseui';
import { PLACEMENT, ToasterContainer } from 'baseui/toast';

import { API_URL, TOAST_AUTO_HIDE_DURATION } from 'src/util/constants';
import ROUTES from 'src/routes';
import { routerTitleCallback } from 'src/util/routing';
import locale from 'src/util/locale';
import { Theme, ThemeContext } from 'src/util/theme';
import { ServiceConfigProvider } from 'src/service-config/data';
import { Main } from 'src/Main';


const styletronDebug = process.env.NODE_ENV === 'production' ? void 0 : new DebugEngine();
const engine = new StyletronClient();

export const gqlClient = createClient({
  url: API_URL + '/graphql',
  exchanges: [dedupExchange, cacheExchange, multipartFetchExchange]
});


function App() {
  const [theme, setTheme] = React.useState(Theme.Light);
  const toggleTheme = () => {  // TODO: remember theme (cookies or smth.)
    setTheme(current => current === Theme.Light ? Theme.Dark : Theme.Light);
  }

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
          <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <BaseProvider theme={theme === Theme.Light ? LightTheme : DarkTheme}>
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
          </ThemeContext.Provider>
        </StyletronProvider>
      </Router>
    </UrqlProvider>
  );
}

export default App;
