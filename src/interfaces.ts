import { Stream } from 'xstream';
import { ReactElement } from '@types/react';

export type ReactDOMSink = Stream<ReactElement<any>> | any;

export interface ReactDOMSource {
  select(selector: string): ReactDOMSource;
  event(name: string): Stream<any> | any;
  handler(name: string): (...args: any[]) => void;
  isolateSource(source: ReactDOMSource, scope: string | null): ReactDOMSource;
};
