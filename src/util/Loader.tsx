import * as React from 'react';

import { StyleObject } from 'styletron-react';
import { useStyletron } from 'baseui';
import { StyledSpinnerNext } from 'baseui/spinner';  // TODO
import { LabelMedium } from 'baseui/typography';


export default function Loader({ style }: { style?: StyleObject }) {
  const [css] = useStyletron();

  return (
    <div className={css({
      display: 'flex',
      justifyContent: 'center',
      ...style
    })}>
      <div className={css({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      })}>
        <StyledSpinnerNext />
        <LabelMedium className={css({ marginBlockStart: '0.5rem' })}>Загрузка...</LabelMedium>
      </div>
    </div>
  );
}
