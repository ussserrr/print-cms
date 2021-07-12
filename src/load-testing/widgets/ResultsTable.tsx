import React from 'react';

import { DateTime } from 'luxon';

import { TableBuilder, TableBuilderColumn } from 'baseui/table-semantic';
import type { Theme } from 'baseui/theme';
import { StyledLink } from 'baseui/link';
import { StatefulPopover } from 'baseui/popover';
import { Paragraph2 } from 'baseui/typography';

import { API_URL } from 'src/util/constants';
import { useScreenSize } from 'src/util/hooks';

import type { PrintRequest } from '../data';


type Props = {
  requestsHistory: PrintRequest[];
  requestsTimerId: number | undefined;
}


export default function ResultsTable({ requestsHistory, requestsTimerId }: Props) {
  const size = useScreenSize();
  const tableRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const table = tableRef.current;
    if (requestsTimerId && table !== null) {
      table.scrollTop = table.scrollHeight;
    }
  }, [requestsHistory, requestsTimerId]);

  return (
    <TableBuilder
      data={requestsHistory}
      emptyMessage='Пока нет запрошенных задач'
      overrides={{
        Root: {
          props: { ref: tableRef },
          style: (size > 640) ? undefined : { maxHeight: '35vh' }
        },
        TableBodyRow: {
          /**
           * TODO: This is only applicable to the light theme!
           */
          style: ({ $theme, $rowIndex }: { $theme: Theme, $rowIndex: number }) => {
            const row = requestsHistory[$rowIndex];
            let backgroundColor, backgroundColorHover;
            if (['REQUESTED', 'REGISTERED'].includes(row.state)) {
              backgroundColor = $theme.colors.warning100;
              backgroundColorHover = $theme.colors.warning200;
            } else if (row.state === 'ERROR' || (row.state === 'DONE' && row.message.error)) {
              backgroundColor = $theme.colors.negative100;
              backgroundColorHover = $theme.colors.negative200;
            } else {
              backgroundColor = $theme.colors.positive100;
              backgroundColorHover = $theme.colors.positive200;
            }
            return {
              backgroundColor,
              ':hover': { backgroundColor: backgroundColorHover }
            }
          }
        }
      }}
    >
      <TableBuilderColumn header='Шаблон'
        children={(row: PrintRequest) => {
          if (row.state === 'DONE' && !row.message.error) {
            return (
              <StyledLink
                href={API_URL + '/print/output/' + row.message.token}
                target='_blank'
              >
                {row.template.title}
              </StyledLink>
            );
          } else if (row.state === 'DONE' && row.message.error) {
            return (
              <StatefulPopover
                showArrow
                content={
                  <Paragraph2
                    padding='scale700'
                    margin='0'
                    color='negative'
                  >
                    {row.message.error}
                  </Paragraph2>
                }
              >
                <StyledLink
                  onClick={event => event.preventDefault()}
                  tabIndex={0}
                >
                  {row.template.title}
                </StyledLink>
              </StatefulPopover>
            );
          } else {
            return row.template.title;
          }
        }}
      />
      <TableBuilderColumn header='Запрошен'
        children={(row: PrintRequest) =>
          row.requestedAt.toLocaleString(DateTime.TIME_WITH_SECONDS)
        }
      />
      <TableBuilderColumn header='Внесён'
        children={(row: PrintRequest) => {
          if ('registeredAt' in row) {
            return row.registeredAt.diff(row.requestedAt).toFormat('+ S мс');
          }
        }}
      />
      <TableBuilderColumn header='Завершён'
        children={(row: PrintRequest) => {
          if ('doneAt' in row) {
            return row.doneAt.diff(row.registeredAt).toFormat('+ s с');
          }
        }}
      />
    </TableBuilder>
  );
}
