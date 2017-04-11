import { Driver } from '@cycle/run';
import { createElement, Component } from 'react';
import { ReactElement } from '@types/react';
import ReactDOM from 'react-dom';
import MainReactDOMSource from './MainReactDOMSource';
import { ReactDOMSink, ReactDOMSource } from './interfaces';

export interface MakeReactDOMDriver {
  ( querySelector: string,
  ): Driver<ReactDOMSink, ReactDOMSource>
}

export interface RootComponentState {
  [vtree: string]: ReactElement<any>;
}

const makeReactDOMDriver: MakeReactDOMDriver = function(querySelector) {
  const container = document.querySelector(querySelector);

  return function reactDOMDriver(vtree$: ReactDOMSink): ReactDOMSource {
    class RootComponent extends Component<null, RootComponentState> {
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

    ReactDOM.render(createElement(RootComponent), container);

    return new MainReactDOMSource('CYCLE_REACT_DRIVER');
  }
};

export default makeReactDOMDriver;
