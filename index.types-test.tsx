import React from 'react';
// this file exists solely to test the typings of this library
import hocify from './';

function useCounter() {
  return {
    inc: () => {},
    count: 0,
  };
}

const withCounter = hocify(() => useCounter());

// get the shape of `useCounter` via inference
type UseCounterProps = ReturnType<typeof useCounter>;

// removing this `extends` clause should cause an error on line 24
interface Props extends UseCounterProps {
  foo: string;
}
function TakesACounter({  }: Props) {
  return <></>;
}

const Wrapped = withCounter(TakesACounter);

function Usage() {
  // removing `foo` should cause an error
  return <Wrapped foo="needed" />;
}
