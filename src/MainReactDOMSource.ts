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

  event(key) {
    this.handlers[key] = this.handlers[key] || xs.create();
    return adapt(this.handlers[key]);
  }

  handler(key) {
    let stream = this.handlers[key];
    if (stream === undefined) {
      if (process && process.env && process.env.NODE_ENV !== 'production') {
        console.warn(`Using event handler ${key} before using stream`);
      }

      this.handlers[key] = xs.create();
      stream = this.handlers[key];
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
