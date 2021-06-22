import * as React from 'react';

import { useHistory, useLocation } from 'react-router-dom';

import { toaster } from 'baseui/toast';

import { gql, useQuery } from 'urql';

import * as gqlSchema from 'src/graphql-schema';
import { useBreadcrumbs } from 'src/Breadcrumbs';
import TablePreHeader from 'src/util/TablePreHeader';
import { Filter } from './Filter';
import { Table } from './Table';
import { Dialog as CreateDialog, Props as CreateDialogProps, MutationData } from './dialogs/Create'


const KEY = 'Список';

interface ListData {
  templateTypes: gqlSchema.TemplateTypesPageResult;
}

export interface QueryVars {
  filter: gqlSchema.TemplateTypesFilter;
  options: gqlSchema.TemplateTypesRequestOptions;
}

const QUERY = gql`
  query FindTemplateTypes(
    $filter: TemplateTypesFilter = {}
    $options: TemplateTypesRequestOptions = {}
  ) {
    templateTypes(
      filter: $filter
      options: $options
    ) {
      total
      items {
        id
        owner
        title
        active
        currentFile {
          id
          title
        }
      }
    }
  }
`;


export function List() {
  useBreadcrumbs(KEY);

  const history = useHistory();
  const location = useLocation();

  const [variables, setVariables] = React.useState<QueryVars>();

  const [{ data, fetching, stale, error }] = useQuery<ListData, QueryVars>({
    query: QUERY,
    variables,
    pause: variables === undefined
  });

  React.useEffect(() => {
    if (error) toaster.negative('Ошибка запроса шаблонов', {});
  }, [error]);

  return (
    <div>
      <Filter
        style={{ marginBlockEnd: '1rem' }}
        total={data?.templateTypes.total ?? 0}
        onFilter={setVariables}
      />

      <TablePreHeader<CreateDialogProps, MutationData>
        title={'Всего: ' + (data?.templateTypes.total ?? '🤷')}
        onCreated={data => {
          history.push(location.pathname + '/' + data.createTemplateType.id, {
            createFile: true
          });
        }}
        typenamesToInvalidate={['TemplateTypesPageResult']}
        createDialog={CreateDialog}
      />

      <Table
        data={data?.templateTypes.items}
        isLoading={fetching || stale}
        error={error}
        onItemSelect={(item: gqlSchema.TemplateType) => {
          history.push(location.pathname + '/' + item.id);
        }}
      />
    </div>
  );
}
