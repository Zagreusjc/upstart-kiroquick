import { NavLink } from 'react-router-dom';
import type { FeatureModule } from '../core/contracts';

interface BottomNavProps {
  modules: FeatureModule[];
}

/** Bottom tab bar generated from each feature's `navItem`. Styles live in index.css (.app-nav). */
export function BottomNav({ modules }: BottomNavProps) {
  return (
    <nav aria-label="Main" className="app-nav">
      <ul className="m-0 flex list-none gap-1 p-0">
        {modules.map(({ id, navItem }) => (
          <li key={id} className="min-w-0 flex-1">
            <NavLink to={navItem.path} className="app-nav-link">
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
