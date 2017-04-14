# cycle-reactdom-driver
*(un)official ReactDOM driver for Cycle.js*

<!--## why-->

## installation
```
npm install --save @sunny-g/cycle-reactdom-driver
```

## usage
Basic usage with the Cycle.js [counter](https://github.com/cyclejs/cyclejs/tree/master/examples/counter) example:

```js
import makeReactDOMDriver from '@sunny-g/cycle-react-driver/es2015/dom';

function main(sources) {
  const incrementReducer$ = sources.REACT
    .event('increment')
    .map(_ => ({ count }) => ({
      count: count + 1
    }));

  const decrementReducer$ = sources.REACT
    .event('decrement')
    .map(_ => ({ count }) => ({
      count: count - 1
    }));

  const reducer$ = xs.merge(
    incrementReducer$,
    decrementReducer$
  );

  const props$ = reducer$
    .fold((state, reducer) => reducer(state), { count: initialCount });

  const decrementHandler = sources.REACT.handler('decrement');
  const incrementHandler = sources.REACT.handler('increment');

  // the sink is a stream of a rendered React elements
  const vtree$ = props$
    .map(({ count }) =>
      <div>
        <button
          key="decrement"
          onClick={decrementHandler}
        >
          Decrement
        </button>
        <button
          key="increment"
          onClick={incrementHandler}
        >
          Increment
        </button>
        <p>{`Counter: ${count}`}</p>
      </div>
    );

  return {
    REACT: vtree$,
  };
}

run(main, {
  REACT: makeReactDOMDriver('#main-container'),
});
```

## api

### `makeReactDOMDriver`

##### parameters:
* `querySelector: string`: DOM query selector for the element in which the root React component will be rendered

Example:

```js
run(main, {
  // ... other drivers
  REACT: makeReactDOMDriver('#app-container'),
});
```

### `react` source

#### `react.handler(key: string): (...args: any[]) => void`

##### parameters:
* `key: string`: Unique key for the handler-event stream pair

##### returns:
* `(...args: any[]) => void`: Function that should passed down to a React element as an event handler

Example:

```js
const onTextChange = sources.REACT.handler('onTextChange');
```

#### `react.event(key: string): Stream<any | any[]>`

##### parameters:
* `key: string`: Unique key for the handler-event stream pair

##### returns:
* `Stream<any | any[]>`: A stream that emits the value(s) given to the matching `handler` whenever the `handler` is invoked
  * **NOTE**: If the React element invokes the matching `handler` function with more than one argument, the stream will emit an `Array` of the arguments, rather than just the first argument - otherwise, the stream emits the single argument

Example:

```js
// stream of text from the input box
const props$ = sources.REACT
  .event('onTextChange')         // same key as the handler defined earlier
  .map(([ event ]) => event)     // handler was invoked with multiple arguments, but we only want the first
  .map(e => e.target.value);
```

### `react` sink: `Stream<ReactElement<any>>`

##### should return:
- `Stream<ReactElement<any>>`: A stream of React elements

Example:

```js
// `props$` and `onTextChange` defined earlier

return {
  // ... other sinks...
  REACT: props$.map(({ text }) => (
    <input
      type="text"
      value={text}
      onChange={onTextChange}
    />
  ))
};
```

### helpers

#### `fromReactDOMComponent(ReactComponent) => CycleComponent`
Creates a Cycle.js component from a ReactDOM component

##### parameters:
* `ReactComponent`: The raw React component, pure or stateful

##### returns:
* `CycleComponent`: A Cycle.js component that takes in `sources` (in particular, a **`React`** source provided by `cycle-reactdom-driver` and a **`props`** source that passes in desired `props`) and returns `sinks` (in particular, a **`React`** sink of React elements)

## contributing

#### todo

- add testing mock source
- explain contribution process
- add more tests :)
- explain why I wrote this

## license
ISC
