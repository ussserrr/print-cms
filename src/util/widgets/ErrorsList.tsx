import { useStyletron } from 'baseui';

import _ from 'lodash';

import { CombinedError } from '@urql/core';


export default function ErrorsList({ error }: { error: CombinedError }) {
  const [css, theme] = useStyletron();

  const errorMessages = _.concat([],
    error.networkError?.message ? error.networkError?.message : [],
    error.graphQLErrors
      .filter(e => e.extensions?.exception?.response?.message || e.message)
      .map(e => e.extensions?.exception?.response?.message || e.message)
  );

  return (
    <div className={css({ color: theme.colors.contentNegative })}>
      <p className={css({ fontWeight: 'bolder' })}>Ошибка:</p>
      <ul className={css({...theme.typography.MonoParagraphSmall})}>
        {errorMessages.map((message, idx) => <li key={idx}>{message}</li>)}
      </ul>
    </div>
  );
}
