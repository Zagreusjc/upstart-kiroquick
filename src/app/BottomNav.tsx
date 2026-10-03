import { NavLink } from 'react-router-dom';
import type { FeatureModule } from '../core/contracts';

interface BottomNavProps {
  modules: FeatureModule[];
}

/** Bottom tab bar generated from each feature's `navItem`. */
export function BottomNav({ modules }: BottomNavProps) {
  return (
    <nav
      aria-label="Main"
      className="sticky bottom-0 z-10 border-t border-rose-200 bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex">
        {modules.map(({ id, navItem }) => (
          <li key={id} className="flex-1">
            <NavLink
              to={navItem.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-xs font-medium ${
                  isActive ? 'text-rose-600' : 'text-slate-500'
                }`
              }
            >
              <span aria-hidden="true" className="text-xl leading-none">
                {navItem.icon}
              </span>
              {navItem.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
