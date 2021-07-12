import * as React from 'react';

import { Route, Switch, withRouter } from 'react-router-dom';

import { useStyletron } from 'baseui';
import { HeaderNavigation, ALIGN, StyledNavigationList, StyledNavigationItem } from 'baseui/header-navigation';

import ROUTES from 'src/routes';
import { RenderRoutes } from 'src/util/routing';
import { useScreenSize } from 'src/util/hooks';
import { Navigator } from 'src/util/widgets/Navigator';
import BreadcrumbsHeader from 'src/util/widgets/Breadcrumbs';
import { Toggler } from 'src/util/theme';


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
      <Switch>{ROUTES.map((route, index) =>
        <Route
          key={index}
          path={route.path}
          exact={route.exact}
          render={props =>
            size > 640                          // Left side (or top for mobile): navigation
            ? <div className={css({  // TODO: collapsible
                width: '20%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              })}>
                <Navigator {...props} style={{
                  // shorthand conflicts with internal styling
                  paddingTop: '30px',
                  paddingRight: '5%',
                  paddingBottom: '30px',
                  paddingLeft: '5%'
                }} />
                <Toggler style={{ paddingBlockEnd: '30px' }}/>
              </div>
            : <HeaderNavigation>
                <StyledNavigationList $align={ALIGN.left}>
                  <StyledNavigationItem>
                    <Navigator {...props} />
                  </StyledNavigationItem>
                </StyledNavigationList>
                <StyledNavigationList $align={ALIGN.center} />
                <StyledNavigationList $align={ALIGN.right}>
                  <StyledNavigationItem>
                    <Toggler style={{ paddingInlineEnd: theme.sizing.scale800 }} />
                  </StyledNavigationItem>
                </StyledNavigationList>
              </HeaderNavigation>
          }
        />
      )}</Switch>

      <div className={css({                     // Right side (or just a page for mobile): Breadcrumbs and actual content
        ...((size > 640) ? {
          width: '80%'
        } : {})
      })}>
        <div className={css({  // TODO: do we really need to use css() function instead of just "style" prop in such cases?
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
