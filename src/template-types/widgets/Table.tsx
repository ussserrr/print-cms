import * as React from 'react';

import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import { StyledLink } from 'baseui/link';

import { CombinedError } from 'urql';

import * as gqlSchema from 'src/graphql-schema';
import Loader from 'src/util/widgets/Loader';
import ErrorsList from 'src/util/widgets/ErrorsList';


function muteOnNonActive(
  item: {active: boolean},
  text?: string
) {
  return item.active ? text : <span style={{color: 'GrayText'}}>{text}</span>;
}


type Props = {
  data?: gqlSchema.TemplateType[];
  isLoading?: boolean;
  error?: CombinedError;
  onItemSelect: (item: gqlSchema.TemplateType) => void;
}

export function Table({ data, isLoading, error, onItemSelect }: Props) {
  return (
    <TableBuilder
      data={data ?? []}
      isLoading={isLoading ?? false}
      emptyMessage={
        error
        ? <ErrorsList error={error} />
        : 'Шаблоны не найдены'
      }
      loadingMessage={<Loader/>}
    >
      <TableBuilderColumn header='Владелец' children={(row: gqlSchema.TemplateType) =>
        muteOnNonActive(row, row.owner)
      }/>

      <TableBuilderColumn header='Название' children={(row: gqlSchema.TemplateType) =>
        <StyledLink
          $style={row.active ? undefined : { color: 'GrayText' }}
          onClick={event => {
            event.preventDefault();
            onItemSelect(row);
          }}
        >
          {row.title}
        </StyledLink>
      }/>

      <TableBuilderColumn header='Файл' children={(row: gqlSchema.TemplateType) =>
        muteOnNonActive(row, row.currentFile?.title)
      }/>
    </TableBuilder>
  );
}
