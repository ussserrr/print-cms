import type { StyleObject } from 'styletron-react';
import { useStyletron } from 'baseui';
import { Spinner } from 'baseui/spinner';
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
        <Spinner />
        <LabelMedium className={css({ marginBlockStart: '0.5rem' })}>
          Загрузка...
        </LabelMedium>
      </div>
    </div>
  );
}
