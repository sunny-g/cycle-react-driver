import { Driver } from '@cycle/run';
import { adapt } from '@cycle/run/lib/adapt';
import { createElement, Component, ComponentClass, ReactElement } from 'react';
import { render } from 'react-dom';
import xs, { Stream } from 'xstream';
import ReactSource from './ReactSource';
import { isStateless } from './util';

export type ReactDOMSink = Stream<ReactElement<any>> | any;

export interface RootComponentState {
  vtree: null | ReactElement<any>;
}

export interface IReactCycleComponent extends Component<null, RootComponentState> {};

export interface MakeReactDOMDriver {
  ( domElement: Element,
  ): Driver<ReactDOMSink, ReactSource>
}

// options for `toReactDOMComponent`
const defaultToReactDOMComponentOptions = {
  sinkName: 'REACT',

  // if starting the application within the React component
  shouldRun: false,
  setup: (_1, _2) => () => () => {},
  drivers: {},
};
const defaultListener = { next(_) {}, error(_) {}, complete() {} };

// TODO: fix this typing!
function fromReactDOMComponent(sinkName = 'REACT', ReactComponent: ComponentClass<any>) {
  const CycleReactComponent = ({ props = adapt(xs.of({})) }) => ({
    [sinkName]: props
      .map(({ ref = () => {}, key = '', ...props }) => (
        (ReactComponent === undefined) ?
          null : isStateless(ReactComponent) ?
          createElement(ReactComponent, { key, ...props }) :
          createElement(ReactComponent, { ref, key, ...props })
      )),
  });

  return CycleReactComponent;
}

function toReactDOMComponent(_opts, CycleComponent): any {
  const opts = {
    ...defaultToReactDOMComponentOptions,
    ..._opts,
  }

  let propsListener = defaultListener;
  let run = defaultToReactDOMComponentOptions.setup(null, null);
  let dispose = () => {};

  return class ReactCycleComponent extends Component<null, RootComponentState> implements IReactCycleComponent {
    constructor(props) {
      super(props);
      this.state = { vtree: null };

      const [ _propsListener, _run ] = setup.call(this, opts, CycleComponent);

      propsListener = _propsListener;
      run = _run;
    }

    public componentWillMount() { dispose = run(); }

    public componentWillUnmount() { dispose(); }

    public componentWillReceiveProps(nextProps) { propsListener.next(nextProps); }

    public render() { return this.state.vtree; };
  }
}

const makeReactDOMDriver: MakeReactDOMDriver = function(domElement) {
  return function reactDOMDriver(vtree$: ReactDOMSink, reactDriverName: string): ReactSource {
    const MainCycleComponent = () => ({ [reactDriverName]: vtree$ });
    const MainReactComponent = toReactDOMComponent({
      shouldRun: false,
      sinkName: reactDriverName,
    }, MainCycleComponent);
    render(createElement(MainReactComponent), domElement);

    return new ReactSource('CYCLE_REACT_DRIVER');
  };
};

export { fromReactDOMComponent };
export { toReactDOMComponent };
export default makeReactDOMDriver;

/*
 * helper for converting a Cycle component into a React component
 * optionally, `run`s the Cycle component on mount
 */
function setup({ sinkName, shouldRun, drivers, setup }, CycleComponent) {
  let vtree$ = xs.empty();
  let propsListener = defaultListener;
  let run = defaultToReactDOMComponentOptions.setup(null, null);

  const props$ = xs.create({
    start: listener => {
      listener.next(this.props);
      propsListener = listener;
    },
    stop() {},
  });

  const propsSource = adapt(props$);

  if (shouldRun) {
    // create drivers (adding props as a source)
    // grab vtree$ from sinks
    // return the application's `run` function

    const allDrivers = { ...drivers, props: propsSource };
    const { sinks, _run } = setup(CycleComponent, allDrivers);
    run = _run;
    vtree$ = xs.from(sinks[sinkName]);
  } else {
    // create sources
    // grab vtree$ from sinks

    const sources = { [sinkName]: new ReactSource(null), props: propsSource };
    const sinks = CycleComponent(sources);
    vtree$ = xs.from(sinks[sinkName]);
  }

  vtree$.addListener({ next: vtree => this.setState(() => ({ vtree })) });

  return [propsListener, run];
}