import * as React from 'react';

import { Route, Switch, withRouter } from 'react-router-dom';

import { useStyletron } from 'baseui';

import ROUTES from './routes';
import { RenderRoutes } from './routing';
import { useScreenSize } from './util/hooks';
import { Navigator } from './util/widgets/Navigator';
import BreadcrumbsHeader from './util/widgets/Breadcrumbs';


export const Main = withRouter(() => {
  const [css, theme] = useStyletron();

  const size = useScreenSize();

  React.useEffect(() => {
    document.body.style.backgroundColor = theme.colors.backgroundPrimary;
  }, [theme]);

  return (
    <div className={css({                       // App layout: horizontal for desktop, vertical for mobile
      display: 'flex',
      ...((size > 640) ? {
        flexDirection: 'row',
        height: '100vh'
      } : {
        flexDirection: 'column'
      })
    })}>
      <div className={css({                     // Left side (or top for mobile): navigation
        ...((size > 640) ? {
          width: '20%'
        } : {})
      })}>
        <Switch>
          {ROUTES.map((route, index) =>
            <Route
              key={index}
              path={route.path}
              exact={route.exact}
              render={props =>
                <Navigator {...props} style={
                  (size > 640) ? {
                    // shorthand conflicts with internal styling
                    paddingTop: '30px',
                    paddingRight: '5%',
                    paddingBottom: '0',
                    paddingLeft: '5%'
                  } : {}
                } />
              }
            />
          )}
        </Switch>
      </div>

      <div className={css({                     // Right side (or just a page for mobile): Breadcrumbs and actual content
        ...((size > 640) ? {
          width: '80%'
        } : {})
      })}>
        <div className={css({
          padding: '30px 5%',
          display: 'flex',
          flexDirection: 'column',
          ...((size > 640) ? {
            height: 'calc(100vh - (30px * 2))'
          } : {})
        })}>
          <BreadcrumbsHeader />
          <RenderRoutes routes={ROUTES} />
        </div>
      </div>
    </div>
  );
});
