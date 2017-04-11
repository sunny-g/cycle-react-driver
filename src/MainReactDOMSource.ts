/* global process */

import { adapt } from '@cycle/run/lib/adapt';
import xs, { Stream } from 'xstream';
import { ReactDOMSource } from './interfaces';

export default class MainReactDOMSource implements ReactDOMSource {
  private events = {};
  private selector: string | null;

  constructor(selector: (string | null) = null) {
    this.selector = selector;
  }

  select(selector) {
    return new MainReactDOMSource(selector);
  }

  event(key) {
    this.events[key] = this.events[key] || { stream: xs.create() };
    return adapt(this.events[key].stream);
  }

  handler(key) {
    let stream = this.events[key].stream;
    if (stream === undefined) {
      if (process && process.env && process.env.NODE_ENV !== 'production') {
        console.warn(`Using event handler ${key} before using stream`);
      }

      this.events[key] = { stream: xs.create() };
      stream = this.events[key].stream;
    }

    function reactDOMDriverHandler (arg1, ...args) {
      return (args.length > 0) ?
        stream._n([ arg1, ...args ]) :
        stream._n(arg1);
    };

    this.events[key].handler = reactDOMDriverHandler;
    return reactDOMDriverHandler;
  }

  isolateSource(_, scope) {
    return new MainReactDOMSource(scope);
  }

}
