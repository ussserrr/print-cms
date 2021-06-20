/**
 * TODO:
 * React' context + reducer mechanics from https://kentcdodds.com/blog/how-to-use-react-context-effectively
 * It still has bugs and also in need of dynamic page title
 */

import * as React from 'react';

import _ from 'lodash';

import { useHistory, useLocation } from 'react-router-dom';

import { Breadcrumbs } from 'baseui/breadcrumbs';
import { StyledLink } from 'baseui/link';

import { ROUTES } from './routes';


type Scope = {
  key: string;
  title?: string;
}

type BreadcrumbsAction =
  | { type: 'registerScope', requested: Scope }
  | { type: 'unregisterScope', key: string }

type Dispatch = (action: BreadcrumbsAction) => void;

type BreadcrumbsState = {
  hierarchy: Scope[];
}

type BreadcrumbsProviderProps = {
  children: React.ReactNode
}

type BreadcrumbsContextType = {
  state: BreadcrumbsState;
  dispatch: Dispatch;
}


const BreadcrumbsContext = React.createContext<BreadcrumbsContextType>({} as BreadcrumbsContextType);
BreadcrumbsContext.displayName = 'BreadcrumbsContext';


function breadcrumbsReducer(state: BreadcrumbsState, action: BreadcrumbsAction): BreadcrumbsState {
  const { hierarchy } = state;

  switch (action.type) {
    case 'registerScope': {
      const { requested } = action;
      const existingIdx = hierarchy.findIndex(scope => scope.key === requested.key);
      if (existingIdx !== -1 && requested.title !== hierarchy[existingIdx].title) {
        return {
          hierarchy: hierarchy.map((scope, idx) => {
            if (idx === existingIdx) {
              return requested;
            } else {
              return scope;
            }
          })
        };
      } else if (existingIdx === -1) {
        return {
          hierarchy: hierarchy.concat([requested])
        };
      } else {
        return state;
      }
    }

    case 'unregisterScope': {
      const { key } = action;
      return {
        hierarchy: hierarchy.filter(scope => scope.key !== key)
      };
    }
  }
}


export function BreadcrumbsProvider({ children }: BreadcrumbsProviderProps) {
  const [state, dispatch] = React.useReducer(breadcrumbsReducer, { hierarchy: [] });
  const value = { state, dispatch };

  return (
    <BreadcrumbsContext.Provider value={value}>
      {children}
    </BreadcrumbsContext.Provider>
  );
}


export function useBreadcrumbs(key: string, title?: string) {
  const { dispatch } = React.useContext(BreadcrumbsContext);

  React.useEffect(() => {
    dispatch({
      type: 'registerScope',
      requested: { key, title }
    });
    return () => dispatch({ type: 'unregisterScope', key });
  }, [dispatch, key, title]);
}


export function BreadcrumbsHeader() {
  const history = useHistory();
  const location = useLocation();

  const { state: { hierarchy } } = React.useContext(BreadcrumbsContext);

  const pathSegments = location.pathname
    .split('/')
    .slice(1)
    .reduce<string[]>((acc, val, i) => {
      if (i === 0) return ['/' + val];
      acc.push(acc[i-1] + '/' + val);
      return acc;
    }, []);
  let currentSubroute = ROUTES;

  const scopes = hierarchy.map<{
    key: string;
    title?: string;
    path?: string;
  }>((scope, idx) => {
    const subroute = currentSubroute.find(r => r.key === scope.key);
    if (subroute) {
      const pathSegment = pathSegments[idx];  // .find(seg => matchPath(seg, subroute));
      currentSubroute = subroute?.children ?? [];
      return _.mergeWith(
        _.pick(subroute, ['key', 'title']),
        {
          ...scope,
          path: pathSegment
        },
        (objValue, srcValue) => srcValue === undefined ? objValue : undefined
      );
    } else {
      return scope;
    }
  });

  return (
    <Breadcrumbs overrides={{
      Root: {
        style: {
          marginBlockEnd: '3rem'
        }
      }
    }}>
      {scopes.map(scope =>
        <StyledLink
          key={scope.key}
          href={scope.path}  // for browser tooltip and copying
          onClick={event => {
            event.preventDefault();
            if (scope.path && scope.path !== history.location.pathname) {
              history.push(scope.path);
            }
          }}
        >
          {scope.title}
        </StyledLink>)}
    </Breadcrumbs>
  );
}
