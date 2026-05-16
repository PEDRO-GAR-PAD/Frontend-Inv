#!/usr/bin/env node
try {
  // Import Vite's ESM CLI dynamically so Node treats this as an ES module.
  // Process args are forwarded automatically via process.argv.
  await import('../node_modules/vite/dist/node/cli.js');
} catch (e) {
  // Surface errors and exit with non-zero code for npm.
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
}
