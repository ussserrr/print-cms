import React from 'react';

import type { match } from 'react-router-dom';

import { useQuery } from 'urql';

import type { GetData, GetVars } from '../data';
import { GetQuery } from '../data';


export default function TemplateTypeBreadcrumb({ match }: { match: match<{ id: string }> }) {
  const [{ data, error }] = useQuery<GetData, GetVars>({
    query: GetQuery,
    variables: match.params
  });

  React.useEffect(() => {
    if (error) console.error(error);
  }, [error]);

  return (
    data?.templateType
    ? <>{data.templateType.title}</>
    : <>Шаблон</>
  );
}
