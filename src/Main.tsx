import * as React from 'react';

import { withRouter } from 'react-router-dom';

import { useStyletron } from 'baseui';

import { RenderRoutes, ROUTES } from './routes';
import { useSize } from './util/Hooks';
import { Navigator } from './Navigator';
import { BreadcrumbsProvider, BreadcrumbsHeader } from './Breadcrumbs';
import { ServiceConfigProvider } from './config';


export const Main = withRouter(() => {
  const [css, theme] = useStyletron();

  const size = useSize();

  React.useEffect(() => {
    document.body.style.backgroundColor = theme.colors.backgroundPrimary;
  }, [theme]);

  return (
    <ServiceConfigProvider>
      <BreadcrumbsProvider>
        <div className={css({
          // width: '100vw',
          // height: '100vh',
          display: 'flex',
          ...((size > 640) ? {
            flexDirection: 'row'
          } : {
            flexDirection: 'column'
          })
        })}>
          <div className={css({
            ...((size > 640) ? {
              width: '20%'
            } : {})
          })}>
            <Navigator style={
              (size > 640) ? {
                paddingTop: '30px',  // shorthand is conflicting with internal styling
                paddingRight: '5%',
                paddingBottom: '0',
                paddingLeft: '5%'
              } : {}
            } />
          </div>

          <div className={css({
            ...((size > 640) ? {
              width: '80%'
            } : {})
          })}>
            <div className={css({
              padding: '30px 5%',
              display: 'flex',
              flexDirection: 'column'
            })}>
              <BreadcrumbsHeader />

              <RenderRoutes routes={ROUTES} />
              {/* <Switch>
                {routes.map((route, index) =>
                  <Route
                    key={index}
                    path={route.path}
                    children={<route.component {...{
                      style: {
                        flexGrow: 1
                      }
                    } as any} />}
                  />
                )}
              </Switch> */}
            </div>
          </div>
        </div>
      </BreadcrumbsProvider>
    </ServiceConfigProvider>
  );
});
