import { describe, expect, it } from 'vitest';

import {
  BASE_TSCONFIG_RELATIVE_PATH,
  SHARED_ESLINT_CONFIG_FILENAME,
  SHARED_PRETTIER_CONFIG_FILENAME,
  resolveBaseTsconfigPath,
  sharedConfigMetadata,
} from './index.js';

describe('@platformtrust/config', () => {
  it('exposes the shared config metadata constants', () => {
    expect(BASE_TSCONFIG_RELATIVE_PATH).toBe('../../tsconfig.base.json');
    expect(SHARED_ESLINT_CONFIG_FILENAME).toBe('eslint.config.mjs');
    expect(SHARED_PRETTIER_CONFIG_FILENAME).toBe('.prettierrc.json');
  });

  it('exposes a frozen metadata object mirroring the constants', () => {
    expect(sharedConfigMetadata).toEqual({
      baseTsconfigRelativePath: BASE_TSCONFIG_RELATIVE_PATH,
      eslintConfigFilename: SHARED_ESLINT_CONFIG_FILENAME,
      prettierConfigFilename: SHARED_PRETTIER_CONFIG_FILENAME,
    });
    expect(Object.isFrozen(sharedConfigMetadata)).toBe(true);
  });

  it('resolves the base tsconfig path for the default package depth', () => {
    expect(resolveBaseTsconfigPath()).toBe('../../tsconfig.base.json');
  });

  it('resolves the base tsconfig path for a custom depth', () => {
    expect(resolveBaseTsconfigPath(3)).toBe('../../../tsconfig.base.json');
  });

  it('rejects an invalid depth', () => {
    expect(() => resolveBaseTsconfigPath(0)).toThrow(RangeError);
    expect(() => resolveBaseTsconfigPath(1.5)).toThrow(RangeError);
  });
});
