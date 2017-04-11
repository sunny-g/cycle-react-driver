import React from 'react';

const fromReactComponent = (ReactComponent = (() => null)) => sources => ({
  REACT: sources.props
    .map(({ ref = () => {}, key = 'null', ...props }) => (
      React.createElement(ReactComponent, { ref, key, ...props })
    )),
});

export { fromReactComponent };
