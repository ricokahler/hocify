import React from 'react';

declare function hocify<HookResult>(
  hook: (props: any) => HookResult,
): <Props extends HookResult>(
  Component: React.ComponentType<Props & HookResult>,
) => React.ComponentType<Omit<Props, keyof HookResult>>;

export default hocify;
