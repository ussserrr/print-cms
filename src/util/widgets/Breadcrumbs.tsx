import _ from 'lodash';

import { useHistory } from 'react-router-dom';
import useBreadcrumbs from 'use-react-router-breadcrumbs';

import { Breadcrumbs } from 'baseui/breadcrumbs';
import { StyledLink } from 'baseui/link';

import { ROUTES } from 'src/routes';


export default function BreadcrumbsHeader() {
  const history = useHistory();
  let breadcrumbs = useBreadcrumbs(ROUTES);
  // console.log('breadcrumbs', breadcrumbs);

  breadcrumbs = breadcrumbs.filter(({ match }) => _.get(match, 'path') !== '*');

  return (
    <Breadcrumbs overrides={{
      Root: {
        style: {
          marginBlockEnd: '3rem'
        }
      }
    }}>
      {breadcrumbs.map(({ match, location, breadcrumb, key }) =>
        <StyledLink
          key={key}
          href={match.url}  // for browser tooltip and copying
          onClick={event => {
            event.preventDefault();
            if (match.url !== location.pathname) {
              history.push(match.url);
            }
          }}
        >
          {_.get(breadcrumb, 'props.children', breadcrumb)}
        </StyledLink>
      )}
    </Breadcrumbs>
  );
}
