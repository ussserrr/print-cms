import * as React from 'react';

import { useHistory, useLocation } from 'react-router-dom';

import { toaster } from 'baseui/toast';

import { gql, useQuery } from 'urql';

import * as gqlSchema from 'src/graphql-schema';
import TablePreHeader from 'src/util/TablePreHeader';
import { Filter } from './Filter';
import { Table } from './Table';
import { Dialog as CreateDialog, Props as CreateDialogProps, MutationData } from './dialogs/Create'


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
  // console.log('List props', props);  // TODO: try to use { history, location, match } provided to the component by react-router

  const history = useHistory();
  const location = useLocation();

  const [variables, setVariables] = React.useState<QueryVars>();

  const [{ data, fetching, stale, error }] = useQuery<ListData, QueryVars>({
    query: QUERY,
    variables,
    pause: variables === undefined,

    /**
     * TODO:
     * Any change of the template type/file may violate cached filtering results so
     * whether invalidate the cache when joining this scope or switch to more sophisticated
     * cache type (Normalized)
     */
    requestPolicy: 'cache-and-network'
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
        onCreated={data =>
          history.push(location.pathname + '/' + data.createTemplateType.id, {
            createFile: true
          })
        }
        createDialog={CreateDialog}
        createDialogProps={{
          initialValues: {
            owner: variables?.filter?.owners?.length ? [{ id: variables.filter.owners[0] }] : [],
            title: variables?.filter?.common?.search ?? ''
          }
        }}
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
