/**
 * Routing mechanics stuff:
 *  - Core pattern is adopted from https://www.ryanjyost.com/react-routing
 *  - Document title management by https://github.com/lynoapp/react-router-title
 */

import React from 'react';

import type { match } from 'react-router-dom';
import { Switch, Route } from 'react-router-dom';
import type { RouterTitleProps } from 'react-router-title';

import _ from 'lodash';

import { getTemplateTypeById } from '../template-types/data';


export type RouteNode = {
  title: string;
  breadcrumb?: string | React.ComponentType<{ match: match<{ id: string }> }>;
  path: string;
  exact?: boolean;
  component?: React.ComponentType<any>;
  external?: boolean;
  routes?: RouteNode[];
}


/**
 * Render a route with potential sub routes
 * https://reacttraining.com/react-router/web/example/route-config
 */
function RouteWithSubRoutes({
  path,
  exact,
  component: Component,
  routes
}: RouteNode) {
  return (
    Component
    ? <Route
        path={path}
        exact={exact}
        render={props => <Component {...props} routes={routes} />}
      />
    : null
  );
}

/**
 * Use this component for any new section of routes (any config object that has a "routes" property)
 */
export function RenderRoutes({ routes }: { routes: RouteNode[] }) {
  return (
    <Switch>
      {routes.map((route, idx) => <RouteWithSubRoutes key={idx} {...route} />)}
    </Switch>
  );
}

/**
 * "Pass forward" all downstream routes. Use this as a 'component' property for pages that
 * doesn't necessarily renders themself but playing a role of proxy for their children
 */
export function RouteChildren({ routes }: RouteNode) {
  return <RenderRoutes routes={routes ?? []} />;
}


/**
 * Replace dynamic parts of the window title
 */
export const routerTitleCallback: RouterTitleProps['callback'] = async ({
  title,  // Final title string which was generated
  params  // Params from the last sub-route which has params
}) => {
  /**
  * TODO: This find/replace routine is not generic - we use here the fact
  * that we have only one page with parameters
  */
  if (_.get(params, 'id') && title.includes('<Шаблон>')) {
    const templateType = await getTemplateTypeById(_.get(params, 'id'));
    if (templateType) {
      title = title.replace('<Шаблон>', templateType.title);
    }
  }
  return title;
}
