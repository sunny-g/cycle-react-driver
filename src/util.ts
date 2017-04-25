/* global process */

export function isProd() {
  return process && process.env && process.env.NODE_ENV === 'production';
}
