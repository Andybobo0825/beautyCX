import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'node:http';
import { createApp } from '../app.js';
import { closeDatabase } from '../dbconfig/database.js';

function listen(app) {
  const server = createServer(app);
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

test.afterEach(() => {
  closeDatabase();
});

test('health endpoint returns API status', async () => {
  const server = await listen(createApp());
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, 'ok');
    assert.equal(body.service, 'beautycx-api');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('ready endpoint validates SQLite snapshot', async () => {
  const server = await listen(createApp());
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/health/ready`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, 'ready');
    assert.equal(body.database, 'ok');
    assert.equal(body.stats.products, 42);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('unknown routes return structured 404', async () => {
  const server = await listen(createApp());
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/missing`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.equal(body.error, 'not_found');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
