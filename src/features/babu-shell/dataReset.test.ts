import { describe, expect, it } from 'vitest';
import { appStorageKeys, eraseAppData } from './dataReset';

describe('eraseAppData', () => {
  it('removes only INLABABU keys from the device', () => {
    localStorage.setItem('inlababu.babu.v1', '{}');
    localStorage.setItem('inlababu.events.v1', '[]');
    localStorage.setItem('someone-else', 'keep me');

    expect(appStorageKeys(localStorage).sort()).toEqual(['inlababu.babu.v1', 'inlababu.events.v1']);
    expect(eraseAppData(localStorage)).toBe(2);
    expect(localStorage.getItem('inlababu.babu.v1')).toBeNull();
    expect(localStorage.getItem('someone-else')).toBe('keep me');
  });
});
