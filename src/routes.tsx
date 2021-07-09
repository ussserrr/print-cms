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
import { RouterTitleProps } from 'react-router-title';
import { H5, Display2, Paragraph2 } from 'baseui/typography';


export const API_URL = process.env.REACT_APP_API_URL ?? '/api';


type RouteNode = {
  title: string;
  breadcrumb?: string;
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
 * Use this component for any new section of routes (any config object that has a "routes" property
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
function _RouteChildren({ routes }: RouteNode) {
  return <RenderRoutes routes={routes ?? []} />;
}


export const routerTitleCallback: RouterTitleProps['callback'] = (
  {
    title,  // Final title string which was generated
    titles,  // All title strings from all routes and sub-routes as an array
    params,  // Params from the last sub-route which has params
  },
  location  // Location object from router/history
) => {
  console.log('title:', title, 'titles:', titles, 'params:', params, 'location:', location);
  return title;
}


function Home() {
  return (
    <div>
      <H5 $style={{ marginBlockStart: 0 }}>Панель управления печатными формами 🖨</H5>
      <Paragraph2>
        Выберите раздел в навигации слева (либо по кнопке "Меню" в мобильной версии).
        Ссылки со стрелочкой ↗ ведут на страницы вне панели управления.
      </Paragraph2>
      <Paragraph2>Вверху страницы показывается ваше текущее положение на сайте.</Paragraph2>
      <Paragraph2>
        Сайт может быть установлен на ваше устройство как приложение (технология PWA).
        Обратитесь к инструкции вашего браузера/операционной системы чтобы узнать как это сделать.
      </Paragraph2>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center' }}>
      <H5>Страница не найдена!</H5>
      <Display2>🤷</Display2>
    </div>
  );
}


export const ROUTES: RouteNode[] = [
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
    external: true
  },
  {
    title: 'Документация',
    path: API_URL + '/docs',
    external: true
  },
  {
    title: 'Страница не найдена',
    path: '*',
    component: NotFound
  }
];
