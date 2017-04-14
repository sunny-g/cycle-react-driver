import { Driver } from '@cycle/run';
import { createElement, Component } from 'react';
import { render } from 'react-dom';
import { Stream } from 'xstream';
import { ComponentClass, ReactElement } from '@types/react';
import ReactSource from './ReactSource';

export type ReactDOMSink = Stream<ReactElement<any>> | any;

export interface RootComponentState {
  vtree: null | ReactElement<any>;
}

export interface MakeReactDOMDriver {
  ( querySelector: string,
  ): Driver<ReactDOMSink, ReactSource>
}

function renderVtree$(vtree$, element) {
  class CycleReactComponent extends Component<null, RootComponentState> {
    constructor() {
      super();
      this.state = { vtree: null };
    }

    componentWillMount() {
      vtree$.addListener({
        next: vtree => this.setState({ vtree }),
        error() {},
        complete() {},
      });
    }

    render() {
      return this.state.vtree;
    }
  }

  render(createElement(CycleReactComponent), element);
}

// TODO: fix this typing!
function fromReactDOMComponent(ReactComponent: ComponentClass<any>) {
  return sources => ({
    REACT: sources.props
      .map(({ ref = () => {}, key = 'null', ...props }) => (
        createElement(ReactComponent, { ref, key, ...props })
      )),
  });
}

const makeReactDOMDriver: MakeReactDOMDriver = function(element) {
  return function reactDOMDriver(vtree$: ReactDOMSink): ReactSource {
    renderVtree$(vtree$, element);

    return new ReactSource('CYCLE_REACT_DRIVER');
  };
};

export { fromReactDOMComponent };
export default makeReactDOMDriver;
