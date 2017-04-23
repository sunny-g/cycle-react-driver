import { Driver } from '@cycle/run';
import { adapt } from '@cycle/run/lib/adapt';
import { createElement, Component } from 'react';
import { render } from 'react-dom';
import xs, { Stream } from 'xstream';
import { ComponentClass, ReactElement } from '@types/react';
import ReactSource from './ReactSource';

export type ReactDOMSink = Stream<ReactElement<any>> | any;

export interface RootComponentState {
  vtree: null | ReactElement<any>;
}

export interface IReactCycleComponent extends Component<null, RootComponentState> {};

export interface MakeReactDOMDriver {
  ( element: Element,
  ): Driver<ReactDOMSink, ReactSource>
}

// TODO: fix this typing!
function fromReactDOMComponent(sinkName = 'REACT', ReactComponent: ComponentClass<any>) {
  const CycleReactComponent = ({ props = adapt(xs.of({})) }) => ({
    [sinkName]: props
      .map(({ ref = () => {}, key = '', ...props }) => (
        (ReactComponent === undefined) ?
          null :
          createElement(ReactComponent, { ref, key, ...props })
      )),
  });

  return CycleReactComponent;
}

// TODO: should take in an object of drivers/sources instead of `sinkName` to pass into the CycleComponent
// TODO: fix this typing!
function toReactDOMComponent(sinkName = 'REACT', CycleComponent): any {
  let propsListener: any;

  return class ReactCycleComponent extends Component<null, RootComponentState> implements IReactCycleComponent {
    constructor(props) {
      super(props);
      this.state = { vtree: null };
    }

    public componentWillMount() {
      const props$ = xs.create({
        start: (listener) => {
          listener.next(this.props);
          propsListener = listener;
        },
        stop() {},
      });

      const sources = {
        [sinkName]: new ReactSource(null),
        props: adapt(props$),
      };
      const sinks = CycleComponent(sources);
      const vtree$ = xs.from(sinks[sinkName]);
      vtree$.addListener({
        next: vtree => this.setState(() => ({ vtree })),
      });

    }

    public componentWillReceiveProps(nextProps) {
      propsListener.next(nextProps);
    }

    public render() { return this.state.vtree };
  }
}

const makeReactDOMDriver: MakeReactDOMDriver = function(element) {
  return function reactDOMDriver(vtree$: ReactDOMSink, reactDriverName: string): ReactSource {
    const MainCycleComponent = () => ({ [reactDriverName]: vtree$ });
    const MainReactComponent = toReactDOMComponent(reactDriverName, MainCycleComponent);
    render(createElement(MainReactComponent), element);

    return new ReactSource('CYCLE_REACT_DRIVER');
  };
};

export { fromReactDOMComponent };
export { toReactDOMComponent };
export default makeReactDOMDriver;
