/**
 * Where the main menu buttons go. These are route paths only: the menu never
 * imports another feature's code, it just links to the tab's URL.
 * Owners: Play (Jolo), Library and Blood Bank (Prime), Care (Ralph).
 */
export const MENU_LINKS = {
  home: '/home',
  play: '/play',
  baboo: '/home/baboo',
  settings: '/home/settings',
  /** Prime's milestones page is themed as the Blood Bank (lives meter and refills). */
  bloodBank: '/library/milestones',
  /** Prime's share button lives on the same page. */
  refer: '/library/milestones',
  library: '/library',
  screened: '/care',
} as const;
