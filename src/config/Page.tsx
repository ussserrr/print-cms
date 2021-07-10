import * as React from 'react';

import * as _ from 'lodash';

import { Notification } from 'baseui/notification';
import { TreeView, TreeNode, toggleIsExpanded } from 'baseui/tree-view';

import { ServiceConfigContext, serviceConfigDescription } from 'src/config/data';
import { Paragraph2 } from 'baseui/typography';


function convert(obj: Record<string, any>, idPrefix?: string): TreeNode[] {
  return Object.keys(obj).map<TreeNode>(key => {
    const path = idPrefix ? (idPrefix + '.' + key) : key;

    const description = _.get(serviceConfigDescription, path);
    let title = key;
    if (_.isPlainObject(description)) {
      title = description._title;
    } else if (_.isString(description)) {
      title = description;
    }

    const common = { id: path };
    if (_.isPlainObject(obj[key]) && !_.isNull(obj[key])) {
      return {
        ...common,
        label: title,
        isExpanded: true,
        children: convert(obj[key], path)
      };
    } else if (_.isArrayLike(obj[key])) {
      return {
        ...common,
        label: () =>
          <div>
            {title} (<code>{key}</code>):
            <pre>{JSON.stringify(obj[key], null, 2)}</pre>
          </div>
      };
    } else if (_.isError(obj[key])) {
      return {
        ...common,
        label: () =>
          <Paragraph2 color='negative'>
            Error: <code>{obj[key].message}</code>
          </Paragraph2>
      };
    } else {
      return {
        ...common,
        label: () =>
          <div>
            {title} (<code>{key}</code>): .......... {obj[key]}
          </div>
      };
    }
  });
}


export default function ServiceConfiguration() {
  const serviceConfig = React.useContext(ServiceConfigContext);

  const [data, setData] = React.useState<TreeNode[]>([]);

  React.useEffect(() => setData(convert(serviceConfig)), [serviceConfig]);

  return (
    <>
      <Notification closeable
        overrides={{
          Body: {
            style: {
              boxSizing: 'border-box',
              width: '100%',
              marginBlockEnd: '2rem'
            }
          },
          CloseIcon: {
            props: {
              title: 'Закрыть'
            }
          }
        }}
      >
        ℹ️ Публичные настройки сервиса, предоставляемые клиентам.
        Сюда не входят внутренние детали реализации
      </Notification>
      <TreeView
        data={data}
        onToggle={node =>
          // StatefulTreeView doesn't work, strangely (no reaction to clicks)...
          setData(prevData => toggleIsExpanded(prevData, node))
        }
      />
    </>
  );
}
