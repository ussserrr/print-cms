import { Switch, Route } from 'react-router-dom';

import { List } from './template-types/List';
import { Card } from './template-types/Card';
import { useBreadcrumbs } from './Breadcrumbs';


type RouteNode = {
  key: string;
  path: string;
  exact?: boolean;
  title?: string;
  component: React.ComponentType<any>;
  children?: RouteNode[];
  external?: boolean;
}


function RouteWithSubRoutes(route: RouteNode) {
  return (
    <Route
      path={route.path}
      exact={route.exact}
      render={props => <route.component {...props} routes={route.children} />}
    />
  );
}

export function RenderRoutes({ routes }: { routes: RouteNode[] }) {
  useBreadcrumbs('Шаблоны');

  return (
    <Switch>
      {routes.map((route, idx) => {
        return <RouteWithSubRoutes {...route} key={idx.toString()} />;
      })}

      {/* TODO */}
      <Route component={() => <h1>Страница не найдена</h1>} />
    </Switch>
  );
}


/**
 * TODO:
 * Routing mechanics from https://www.ryanjyost.com/react-routing/
 * This should probably be revised/remade
 */
export const ROUTES: RouteNode[] = [{
//   path: '/',
//   exact: true,
//   title: 'Сервис печати',
//   component: () => <h1>Login Page</h1>
// }, {
  key: 'Шаблоны',
  path: '/types',
  title: 'Шаблоны',
  component: RenderRoutes,
  children: [{
    key: 'Список',
    path: '/types',
    exact: true,
    title: 'Список',
    component: List
  }, {
    key: 'Шаблон',
    path: '/types/:templateTypeId',
    exact: true,
    component: Card
  }]
}, {
  key: 'Очередь',
  path: '/api/print/queues',
  title: 'Состояние очереди',
  component: () => null,
  external: true
}, {
  key: 'Документация',
  path: '/api/docs',
  title: 'Документация',
  component: () => null,
  external: true
}];
