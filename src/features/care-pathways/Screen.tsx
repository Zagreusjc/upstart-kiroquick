import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { carePaths } from './paths';
import { ClinicsScreen } from './screens/ClinicsScreen';
import { ExportScreen } from './screens/ExportScreen';
import { InitiativesScreen } from './screens/InitiativesScreen';
import { SurveyScreen } from './screens/SurveyScreen';
import { VerifyScreen } from './screens/VerifyScreen';
import { VouchersScreen } from './screens/VouchersScreen';
import { Card, Disclaimer, Page, focusRing } from './ui';

/**
 * Care pathways (owner: Ralph). Routed at `/care/*`:
 * survey, clinics, initiatives, vouchers, verify (clinic staff) and export.
 */
export function CarePathwaysScreen() {
  return (
    <Routes>
      <Route index element={<CareHome />} />
      <Route path="survey" element={<SurveyScreen />} />
      <Route path="clinics" element={<ClinicsScreen />} />
      <Route path="initiatives" element={<InitiativesScreen />} />
      {/* Old link from before the rename. */}
      <Route path="missions" element={<Navigate to={carePaths.initiatives} replace />} />
      <Route path="vouchers" element={<VouchersScreen />} />
      <Route path="verify" element={<VerifyScreen />} />
      <Route path="export" element={<ExportScreen />} />
      <Route path="*" element={<CareHome />} />
    </Routes>
  );
}

const TILES = [
  { to: carePaths.survey, icon: '🩺', title: 'Heart risk check', text: 'Six questions, one minute.' },
  { to: carePaths.clinics, icon: '🏥', title: 'Nearby clinics', text: 'Public and private, nearest first.' },
  { to: carePaths.initiatives, icon: '📅', title: 'Medical initiatives', text: 'National, city, barangay and group drives.' },
  { to: carePaths.vouchers, icon: '🎟️', title: 'Vouchers', text: 'Use coins for screening discounts.' },
] as const;

function CareHome() {
  return (
    <Page
      title="Care pathways"
      intro="Check your heart risk, find care nearby and turn coins into screening discounts."
      back={false}
    >
      <ul className="grid grid-cols-2 gap-3">
        {TILES.map((tile) => (
          <li key={tile.to}>
            <Link
              to={tile.to}
              className={`flex h-full min-h-28 flex-col rounded-xl bg-white p-4 shadow hover:bg-rose-50 ${focusRing}`}
            >
              <span aria-hidden="true" className="text-2xl">
                {tile.icon}
              </span>
              <span className="mt-1 font-bold">{tile.title}</span>
              <span className="text-sm text-slate-700">{tile.text}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Disclaimer />
      <Card>
        <h3 className="font-bold">For partners</h3>
        <ul className="mt-1 space-y-1">
          <li>
            <Link to={carePaths.verify} className={`inline-flex min-h-11 items-center font-semibold text-rose-800 underline ${focusRing}`}>
              Clinic staff: verify a voucher
            </Link>
          </li>
          <li>
            <Link to={carePaths.export} className={`inline-flex min-h-11 items-center font-semibold text-rose-800 underline ${focusRing}`}>
              Export dashboard data (CSV)
            </Link>
          </li>
        </ul>
      </Card>
    </Page>
  );
}
