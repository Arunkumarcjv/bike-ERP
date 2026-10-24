import { describe, it, expect } from 'vitest';
import { NAVIGATION_GROUPS } from '../config/navigation';
import enLocale from '../../public/locales/en.json';
import taLocale from '../../public/locales/ta.json';
import hiLocale from '../../public/locales/hi.json';

describe('A1: Navigation Integrity & Multi-Lingual Coverage', () => {
  it('guarantees every navigation item has a valid labelKey and fallback label', () => {
    NAVIGATION_GROUPS.forEach((group) => {
      expect(group.id).toBeTruthy();
      expect(group.titleKey).toBeTruthy();
      expect(group.title).toBeTruthy();

      group.items.forEach((item) => {
        expect(item.id, `Item in group ${group.id} must have an id`).toBeTruthy();
        expect(item.labelKey, `Item ${item.id} must have a labelKey`).toBeTruthy();
        expect(item.label, `Item ${item.id} must have a fallback label`).toBeTruthy();
        expect(item.path, `Item ${item.id} must have a path`).toBeTruthy();
        expect(item.icon, `Item ${item.id} must have an icon`).toBeTruthy();
      });
    });
  });

  it('ensures every navigation translation key exists in en.json, ta.json, and hi.json', () => {
    NAVIGATION_GROUPS.forEach((group) => {
      // Check group title key
      const groupSubKey = group.titleKey.replace('nav.', '');
      expect(
        enLocale.nav[groupSubKey],
        `Group key ${group.titleKey} missing in en.json`
      ).toBeTruthy();
      expect(
        taLocale.nav[groupSubKey],
        `Group key ${group.titleKey} missing in ta.json`
      ).toBeTruthy();
      expect(
        hiLocale.nav[groupSubKey],
        `Group key ${group.titleKey} missing in hi.json`
      ).toBeTruthy();

      // Check item label keys
      group.items.forEach((item) => {
        const itemSubKey = item.labelKey.replace('nav.', '');
        expect(
          enLocale.nav[itemSubKey],
          `Navigation item key "${item.labelKey}" missing in en.json`
        ).toBeTruthy();
        expect(
          taLocale.nav[itemSubKey],
          `Navigation item key "${item.labelKey}" missing in ta.json`
        ).toBeTruthy();
        expect(
          hiLocale.nav[itemSubKey],
          `Navigation item key "${item.labelKey}" missing in hi.json`
        ).toBeTruthy();
      });
    });
  });
});
