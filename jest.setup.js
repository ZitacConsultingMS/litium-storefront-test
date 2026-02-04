// Create file to write the Jest test code based on TypeScript
import '@testing-library/jest-dom';

// Polyfill TransformStream for Jest environment
// Required by Apollo Client Integration for Next.js (uses Web Streams API)
if (typeof global.TransformStream === 'undefined') {
  const { TransformStream } = require('node:stream/web');
  global.TransformStream = TransformStream;
}
