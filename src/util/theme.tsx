import React from 'react';

import type { StyleObject } from 'styletron-react';
import { useStyletron } from 'baseui';
import { Checkbox, STYLE_TYPE } from 'baseui/checkbox';
import { StatefulTooltip } from 'baseui/tooltip';


export enum Theme {
  Light,
  Dark
}

export const ThemeContext = React.createContext({
  theme: Theme.Light,
  toggleTheme: () => {}
});
ThemeContext.displayName = 'ThemeContext';


export function Toggler({ style }: { style?: StyleObject }) {
  const [css] = useStyletron();

  const { theme, toggleTheme } = React.useContext(ThemeContext);

  return (
    <StatefulTooltip
      accessibilityType='tooltip'
      content='Тема оформления'
    >
      <div className={css({
        display: 'flex',
        alignItems: 'center',
        ...style
      })}>
        🌞
        <Checkbox
          checked={theme === Theme.Dark}
          onChange={toggleTheme}
          checkmarkType={STYLE_TYPE.toggle_round}
          overrides={{
            Root: {
              style: {
                marginInlineEnd: '8px'
              }
            }
          }}
        />
        🌚
      </div>
    </StatefulTooltip>
  );
}
