// Bridge: exposes an async loader so CJS callers can do:
//   const starkzap = require('starkzap')
//   // starkzap is a promise — await it, or use .then()
//   starkzap.then(m => m.StarkZap)
//
// Or for callers that already switched to dynamic import():
//   const { StarkZap } = await import('starkzap')
//
'use strict';
// Return a promise that resolves to the ESM namespace
module.exports = import('./index.js');
