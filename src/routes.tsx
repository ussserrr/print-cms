/**
 * Routing mechanics stuff:
 *  - Core pattern is adopted from https://www.ryanjyost.com/react-routing/
 *  - Document title management by https://github.com/lynoapp/react-router-title
 */

import { Switch, Route } from 'react-router-dom';

import { List as TemplateTypesList } from './template-types/List';
import { Card as TemplateTypeCard } from './template-types/Card';
import Config from './config/index';  // TODO: conflicting modules names
import { LoadTesting } from './load-testing';


export const API_URL = process.env.REACT_APP_API_URL ?? '/api';


// type RouteNode = {
//   key: string;
//   path: string;
//   exact?: boolean;
//   title?: string;
//   component: React.ComponentType<any>;
//   children?: RouteNode[];
//   external?: boolean;
// }


/**
 * Render a route with potential sub routes
 * https://reacttraining.com/react-router/web/example/route-config
 */
 function RouteWithSubRoutes({
   path,
   exact,
   component: Component,
   routes
 }: any) {
  return (
    <Route
      path={path}
      exact={exact}
      render={props => <Component {...props} routes={routes} />}
    />
  );
}

/**
 * Use this component for any new section of routes (any config object that has a "routes" property
 */
 export function RenderRoutes({ routes }: { routes: any[] }) {
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
function _RouteChildren({ routes }: any) {
  console.log('_RouteChildren');
  return <RenderRoutes routes={routes} />;
}


export const routerTitleCallback = (
  {
    title, // Final title string which was generated
    titles, // All title strings from all routes and sub-routes as an array
    params, // Params from the last sub-route which has params
  }: any,
  location: any // Location object from router/history
) => {
  console.log('title:', title, 'titles:', titles, 'params:', params, 'location:', location);
  return title;
}


function Home() {
  return (
    <div>
      Панель управления печатными шаблонами
    </div>
  );
}

function NotFound() {
  return <h1>Not Found!</h1>;
}


export const ROUTES = [
  {
    title: 'Главная',
    breadcrumb: 'Главная',
    path: '/',
    exact: true,
    component: Home
  },
  {
    title: 'Шаблоны',
    breadcrumb: 'Шаблоны',
    path: '/types',
    component: _RouteChildren,
    routes: [
      {
        title: 'Список',
        breadcrumb: 'Список',
        path: '/types',
        exact: true,
        component: TemplateTypesList
      },
      {
        title: 'Шаблон',
        breadcrumb: 'Шаблон',
        path: '/types/:id',
        exact: true,
        component: TemplateTypeCard
      }
    ]
  },
  {
    title: 'Настройки сервиса',
    breadcrumb: 'Настройки сервиса',
    path: '/config',
    exact: true,
    component: Config
  },
  {
    title: 'Нагрузочное тестирование',
    breadcrumb: 'Нагрузочное тестирование',
    path: '/load-testing',
    exact: true,
    component: LoadTesting
  },
  {
    title: 'Состояние очереди',
    path: API_URL + '/print/queues',
    // component: () => null,
    external: true
  },
  {
    title: 'Документация',
    path: API_URL + '/docs',
    component: () => null,
    external: true
  },
  {
    title: 'Страница не найдена',
    path: '*',
    component: NotFound
  }
];
