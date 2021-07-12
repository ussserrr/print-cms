import { RouteChildren, RouteNode } from 'src/util/routing';

import { API_URL } from 'src/util/constants';

import HomePage from 'src/home/Page';
import NotFound from 'src/util/widgets/NotFound';
import { List as TemplateTypesList } from 'src/template-types/pages/List';
import { Card as TemplateTypeCard } from 'src/template-types/pages/Card';
import TemplateTypeBreadcrumb from 'src/template-types/widgets/Breadcrumb';
import ServiceConfig from 'src/service-config/Page';
import { LoadTesting } from 'src/load-testing/Page';


const ROUTES: RouteNode[] = [
  {
    title: 'Главная',
    breadcrumb: 'Главная',
    path: '/',
    exact: true,
    component: HomePage
  },
  {
    title: 'Шаблоны',
    breadcrumb: 'Шаблоны',
    path: '/types',
    component: RouteChildren,
    routes: [
      {
        title: 'Список',
        breadcrumb: 'Список',
        path: '/types',
        exact: true,
        component: TemplateTypesList
      },
      {
        title: '<Шаблон>',
        breadcrumb: TemplateTypeBreadcrumb,
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
    component: ServiceConfig
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

export default ROUTES;
