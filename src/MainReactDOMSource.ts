/* global process */

import { adapt } from '@cycle/run/lib/adapt';
import xs, { Stream } from 'xstream';
import { ReactDOMSource } from './interfaces';

export interface Handlers {
  [name: string]: Stream<any>;
};

export default class MainReactDOMSource implements ReactDOMSource {
  private handlers = {};
  private selector: string | null;

  constructor(selector: (string | null) = null) {
    this.selector = selector;
  }

  select(selector) {
    return new MainReactDOMSource(selector);
  }

  event(name) {
    this.handlers[name] = this.handlers[name] || xs.create();
    return adapt(this.handlers[name]);
  }

  handler(name) {
    let stream = this.handlers[name];
    if (stream === undefined) {
      if (process && process.env && process.env.NODE_ENV !== 'production') {
        console.warn(`Using event handler ${name} before using stream`);
      }

      this.handlers[name] = xs.create();
      stream = this.handlers[name];
    }

    return function reactDOMDriverHandler (arg1, ...args) {
      return (args.length > 0) ?
        stream._n([ arg1, ...args ]) :
        stream._n(arg1);
    };
  }

  isolateSource(_, scope) {
    return new MainReactDOMSource(scope);
  }

}
