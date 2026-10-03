/**
 * Where the main menu buttons go. These are route paths only: the menu never
 * imports another feature's code, it just links to the tab's URL.
 * Owners: Play (Jolo), Library and Milestones (Prime), Care (Ralph).
 */
export const MENU_LINKS = {
  home: '/home',
  play: '/play',
  baboo: '/home/baboo',
  milestones: '/library/milestones',
  /** Prime's share button lives on the milestones page. */
  refer: '/library/milestones',
  library: '/library',
  screened: '/care',
} as const;

/** Router state that asks the Baboo screen to open at today's tasks. */
export const PULSE_STATE = { focus: 'tasks' } as const;
