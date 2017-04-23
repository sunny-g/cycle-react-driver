/* global describe, expect, test */

import makeReactDOMDriver, { fromReactDOMComponent, toReactDOMComponent } from '../src/dom';

describe('makeReactDOMDriver', () => {

  describe('driver factory', () => {

    test('should be a function', () => {
      expect(makeReactDOMDriver).toBeInstanceOf(Function);
    });

    test('should return a driver function', () => {
      expect(makeReactDOMDriver()).toBeInstanceOf(Function);
    });

  });

  describe('driver function', () => {

    test.skip('', () => {});

  });

});
