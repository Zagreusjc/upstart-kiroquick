import { Route, Routes } from 'react-router-dom';
import { CardDetail } from './components/CardDetail';
import { LibraryList } from './components/LibraryList';
import { Milestones } from './components/Milestones';

/**
 * Library tab. Owner: Prime (feat/economy-library, add-economy-library).
 * Nested routes: list, card detail and milestones + share.
 */
export function EconomyLibraryScreen() {
  return (
    <Routes>
      <Route index element={<LibraryList />} />
      <Route path="card/:cardId" element={<CardDetail />} />
      <Route path="milestones" element={<Milestones />} />
      <Route path="*" element={<LibraryList />} />
    </Routes>
  );
}
