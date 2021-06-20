import * as React from 'react';


export function useSize() {
  const [size, setSize] = React.useState(window.innerWidth);

  const updateMedia = () => {
    setSize(window.innerWidth);
  };

  React.useEffect(() => {
    window.addEventListener('resize', updateMedia);
    return () => window.removeEventListener('resize', updateMedia);
  });

  return size;
}
