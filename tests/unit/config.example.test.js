import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  CLERK_PUBLISHABLE_KEY,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
} from '../../js/config.example.js';

describe('config.example.js contract', () => {
  const publishedKeys = {
    CLERK_PUBLISHABLE_KEY,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
  };

  it('exports exactly the three publishable keys', () => {
    assert.deepEqual(Object.keys(publishedKeys), [
      'CLERK_PUBLISHABLE_KEY',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
    ]);
  });

  it('holds a non-empty string for every key', () => {
    for (const [name, value] of Object.entries(publishedKeys)) {
      assert.equal(typeof value, 'string', `${name} must be a string`);
      assert.ok(value.length > 0, `${name} must be non-empty`);
    }
  });

  it('uses a Clerk publishable-key format', () => {
    assert.match(CLERK_PUBLISHABLE_KEY, /^pk_(test|live)_/);
  });

  it('points SUPABASE_URL at an https project host', () => {
    assert.match(SUPABASE_URL, /^https:\/\/.+\.supabase\.co\/?$/);
  });
});
