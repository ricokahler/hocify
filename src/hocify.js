import React, { forwardRef } from 'react';

function hocify(useHook) {
  function hoc(Component) {
    const WithHook = forwardRef((props, ref) => {
      const results = useHook(props);

      if (process.env.NODE_ENV !== 'production') {
        if (typeof results !== 'object') {
          throw new Error(
            `[hocify]: Hook results should return null or an object to be spread as props but received typeof "${typeof results}"`,
          );
        }
      }

      return <Component {...results} {...props} ref={ref} />;
    });

    WithHook.displayName = `hocify(${Component.displayName || Component.name || 'Component'})`;

    return WithHook;
  }

  return hoc;
}

export default hocify;
