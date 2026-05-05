import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getProductById, getPortfolioStats, listProducts } from '../services/products.js';
import { closeDatabase } from '../dbconfig/database.js';

test.afterEach(() => {
  closeDatabase();
});

test('portfolio stats match converted SQLite snapshot', () => {
  assert.deepEqual(getPortfolioStats(), {
    products: 42,
    clients: 7,
    currentPrices: 126,
    priceHistory: 509,
    reviews: 24,
    pictures: 48
  });
});

test('products can be listed from SQLite', () => {
  const products = listProducts({ limit: 5 });
  assert.equal(products.length, 5);
  assert.ok(products[0].pId);
  assert.ok(products[0].pName);
});

test('product detail includes prices, reviews, and pictures', () => {
  const product = getProductById('P1');
  assert.equal(product.pId, 'P1');
  assert.ok(product.prices.length > 0);
  assert.ok(Array.isArray(product.reviews));
  assert.ok(Array.isArray(product.pictures));
});
