# HOCify · [![Build Status](https://travis-ci.org/ricokahler/hocify.svg?branch=master)](https://travis-ci.org/ricokahler/hocify) [![Coverage Status](https://coveralls.io/repos/github/ricokahler/hocify/badge.svg?branch=master)](https://coveralls.io/github/ricokahler/hocify?branch=master)

> HOCify (H-oh-see-ify) is a simple library that converts hooks to [HOCs](https://reactjs.org/docs/higher-order-components.html) for compatibility with class-based components.

[Hooks](https://reactjs.org/docs/hooks-intro.html) are great! They're the [React team's answer to many problems in React today](https://youtu.be/dpw9EHDh2bM?t=757). However, using them comes with a prerequisite:

> Hooks can only be called inside the body of a function component.

This is unfortunate because it prevents us from using newer hook-based modules in our older class-based components.

This library aims to soften that prerequisite by giving you a reusable tool to convert some hooks into higher-order components.

> **Disclaimer:** The purpose of "using hooks" within class components is more for compatibility of newer hook-based modules with older class-based components. If your component is already implemented as a function, then use the hook directly. If you're writing a new component, try writing it as a function component.

## Installation

```
npm install --save hocify
```

## Usage

`hocify` is a function that takes in a custom hook and returns an HOC.

**⚠️️ There are a few things to note ️️️️️️⚠️**

1. The function you feed into `hocify` is a hook and thus **must follow [the rules of hooks](https://reactjs.org/docs/hooks-rules.html)**
2. The arguments to this hook are the props of the wrapped component. You can write a hook inline to `hocify` that uses these props as an input to other hooks.
3. The resulting inline hook **must** return an object OR `null`. This object will be spread onto the input component as props.

`ExampleComponent.js`

```js
import React from 'react';
import hocify from 'hocify';
import useMyCustomHook from './useMyCustomHook';

// 1) this function must follow the rules of hooks
// 2) `props` are the outer props of this function
const withMyCustomHook = hocify(props => {
  const result = useMyCustomHook(props.inputValue);

  // 3) the resulting hook _must_ return an object OR `null`.
  return { data: result };
});

class ExampleComponent extends React.Component {
  render() {
    const { data } = this.props;
  }
}

export default withMyCustomHook(ExampleComponent);
```

`ParentComponent.js`

```js
import React from 'react';
import ExampleComponent from './ExampleComponent';

function ParentComponent() {
  // these props are the arguments to the inline hook in the `hocify` call above
  //                        👇👇👇
  return <ExampleComponent inputValue="test" anotherProp={5} />;
}

export default ParentComponent;
```
