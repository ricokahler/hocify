import React, { useState, useEffect, useCallback, createRef } from 'react';
import { act, create } from 'react-test-renderer';
import hocify from './hocify';

it('takes in a function that takes in a hook. the arguments of the hook are the props of the resulting HOC', async () => {
  const done = new DeferredPromise();
  const effectHandler = jest.fn();

  function useCounter(initialCount) {
    const [count, setCount] = useState(initialCount);

    const inc = useCallback(() => setCount(count => count + 1), []);
    const dec = useCallback(() => setCount(count => count - 1), []);

    return { count, inc, dec };
  }

  const withCounter = hocify(props => useCounter(props.initCount));

  function SomeComponent(props) {
    const { inc, count } = props;
    useEffect(() => {
      inc();
    }, [inc]);

    useEffect(() => {
      if (count >= 11) {
        done.resolve();
      }
    }, [count]);

    useEffect(() => {
      effectHandler(props);
    }, [props]);

    return null;
  }

  const Wrapped = withCounter(SomeComponent);

  await act(async () => {
    create(<Wrapped initCount={10} />);
    await done;
  });

  expect(effectHandler).toHaveBeenCalled();

  expect(effectHandler.mock.calls.map(args => args[0])).toMatchInlineSnapshot(`
    Array [
      Object {
        "count": 10,
        "dec": [Function],
        "inc": [Function],
        "initCount": 10,
      },
      Object {
        "count": 11,
        "dec": [Function],
        "inc": [Function],
        "initCount": 10,
      },
    ]
  `);
});

it('throws if the hook does not return an object', async () => {
  const errorHandler = jest.fn();
  const done = new DeferredPromise();

  function useExampleHook() {
    return 'not an object';
  }

  const withExampleHook = hocify(useExampleHook);

  class ExampleComponent {
    render() {
      return null;
    }
  }

  const Wrapped = withExampleHook(ExampleComponent);

  class ErrorBoundary extends React.Component {
    state = { hadError: false };

    componentDidCatch(e) {
      errorHandler(e);
      done.resolve();
    }

    static getDerivedStateFromError() {
      return { hadError: true };
    }

    render() {
      if (this.state.hadError) {
        return null;
      }

      return this.props.children;
    }
  }

  await act(async () => {
    create(
      <ErrorBoundary>
        <Wrapped />
      </ErrorBoundary>,
    );

    await done;
  });

  expect(errorHandler).toHaveBeenCalledTimes(1);
  expect(errorHandler.mock.calls[0][0]).toMatchInlineSnapshot(
    `[Error: [hocify]: Hook results should return null or an object to be spread as props but received typeof "string"]`,
  );
});

it('forwards the ref', async () => {
  function useExampleHook() {
    return { hello: 'world' };
  }

  const withExampleHook = hocify(useExampleHook);

  class ExampleComponent extends React.Component {
    render() {
      return null;
    }
  }

  const Wrapped = withExampleHook(ExampleComponent);

  const ref = createRef();

  act(() => {
    create(<Wrapped ref={ref} />);
  });

  expect(ref.current).toBeInstanceOf(ExampleComponent);
});

class DeferredPromise {
  constructor() {
    this.state = 'pending';
    this._promise = new Promise((resolve, reject) => {
      this.resolve = value => {
        this.state = 'fulfilled';
        resolve(value);
      };
      this.reject = reason => {
        this.state = 'rejected';
        reject(reason);
      };
    });

    this.then = this._promise.then.bind(this._promise);
    this.catch = this._promise.catch.bind(this._promise);
    this.finally = this._promise.finally.bind(this._promise);
  }

  [Symbol.toStringTag] = 'Promise';
}
