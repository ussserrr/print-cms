import React from 'react';


export function useScreenSize() {
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
