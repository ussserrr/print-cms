import * as React from 'react';

import { useHistory, useLocation } from 'react-router-dom';

import { toaster } from 'baseui/toast';

import { useQuery } from 'urql';

import * as gqlSchema from 'src/graphql-schema';
import TablePreHeader from 'src/util/widgets/TablePreHeader';
import { Filter } from '../widgets/Filter';
import { Table } from '../widgets/Table';
import { Dialog as CreateDialog, Props as CreateDialogProps } from '../dialogs/Create'
import { FindData, FindVars, FindQuery, CreateData } from '../data';


export function List() {
  // console.log('List props', props);  // TODO: try to use { history, location, match } provided to the component by react-router

  const history = useHistory();
  const location = useLocation();

  const [variables, setVariables] = React.useState<FindVars>();

  const [{ data, fetching, stale, error }] = useQuery<FindData, FindVars>({
    query: FindQuery,
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

      <TablePreHeader<CreateDialogProps, CreateData>
        title={'Всего: ' + (data?.templateTypes.total ?? '🤷')}
        onCreated={data =>
          // TODO: pass data so no need to fetch it in the Card
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
