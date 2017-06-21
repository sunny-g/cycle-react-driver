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

  event(key, withMemory = false) {
    const { stream } = this._getOrCreateEventPair(key, withMemory);
    return adapt(stream);
  }

  handler(key, withMemory = false) {
    const { handler } = this._getOrCreateEventPair(key, withMemory);
    return handler;
  }

  _getOrCreateEventPair(key, withMemory) {
    if (this.events[key] === undefined || this.events[key] === null) {
      const stream = withMemory ?
        xs.createWithMemory() :
        xs.create();

      const cycleReactDriverEventHandler = (firstArg, ...args) =>
        (args.length > 0 || Array.isArray(firstArg))
          ? stream.shamefullySendNext([ firstArg, ...args ])
          : stream.shamefullySendNext(firstArg);

      this.events[key] = {
        stream,
        handler: cycleReactDriverEventHandler,
      };
    }

    return this.events[key];
  }

  isolateSource(_, scope) {
    return new ReactSource(scope);
  }

}
