/* global process */

import { adapt } from '@cycle/run/lib/adapt';
import xs, { Stream } from 'xstream';
import { isProd } from './util';

export interface IReactSource {
  select(selector: string): IReactSource;
  event(name: string): Stream<any> | any;
  handler(name: string): (...args: any[]) => void;
  isolateSource(source: IReactSource, scope: string | null): IReactSource;
};

export default class ReactSource implements IReactSource {
  private events = {};
  private selector: string | null;

  constructor(selector: (string | null) = null) {
    this.selector = selector;
  }

  select(selector) {
    return new ReactSource(selector);
  }

  event(key) {
    this.events[key] = this.events[key] || { stream: xs.create() };
    return adapt(this.events[key].stream);
  }

  handler(key) {
    let stream = this.events[key].stream;
    if (stream === undefined) {
      if (!isProd()) {
        console.warn(`Using event handler ${key} before using stream`);
      }

      this.events[key] = { stream: xs.create() };
      stream = this.events[key].stream;
    }

    function reactDriverHandler (arg1, ...args) {
      return (args.length > 0) ?
        stream._n([ arg1, ...args ]) :
        stream._n(arg1);
    };

    this.events[key].handler = reactDriverHandler;
    return reactDriverHandler;
  }

  isolateSource(_, scope) {
    return new ReactSource(scope);
  }

}
