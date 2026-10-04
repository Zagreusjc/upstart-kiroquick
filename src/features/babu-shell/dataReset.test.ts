import { describe, expect, it } from 'vitest';
import { appStorageKeys, eraseAppData } from './dataReset';

describe('eraseAppData', () => {
  it('removes only INLABABOO keys from the device', () => {
    localStorage.setItem('inlababoo.babu.v1', '{}');
    localStorage.setItem('inlababoo.events.v1', '[]');
    localStorage.setItem('someone-else', 'keep me');

    expect(appStorageKeys(localStorage).sort()).toEqual(['inlababoo.babu.v1', 'inlababoo.events.v1']);
    expect(eraseAppData(localStorage)).toBe(2);
    expect(localStorage.getItem('inlababoo.babu.v1')).toBeNull();
    expect(localStorage.getItem('someone-else')).toBe('keep me');
  });
});
