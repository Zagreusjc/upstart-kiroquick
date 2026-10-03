/**
 * CVD library content for Inlababoo.
 *
 * Content curated with Amazon Quick Research and reviewed for plain language.
 * Every card cites at least one source (WHO, the American Heart Association, or
 * the Philippine DOH) and carries a `reviewed` date. These are awareness
 * summaries, not medical advice: card detail shows
 * "Screening awareness, not a diagnosis".
 */

export interface Source {
  label: string;
  url: string;
}

export interface LibraryCard {
  id: string;
  title: string;
  /** One-line summary shown in the list. */
  summary: string;
  /** Plain-language paragraphs shown in the detail view. */
  body: string[];
  /** A single memorable takeaway. */
  takeaway: string;
  sources: Source[];
  /** ISO date the content was last reviewed. */
  reviewed: string;
}

const REVIEWED = '2026-10-04';

export const CARDS: LibraryCard[] = [
  {
    id: 'what-is-cvd',
    title: 'What is cardiovascular disease?',
    summary: 'The group of heart and blood vessel problems, and why it matters.',
    body: [
      'Cardiovascular disease (CVD) covers conditions that affect the heart and blood vessels, including heart attacks and strokes.',
      'It is the leading cause of death worldwide, but a large share of early deaths can be prevented by addressing everyday risk factors.',
    ],
    takeaway: 'Most CVD is driven by risk factors you can act on.',
    sources: [
      {
        label: 'WHO: Cardiovascular diseases (CVDs)',
        url: 'https://www.who.int/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)',
      },
    ],
    reviewed: REVIEWED,
  },
  {
    id: 'blood-pressure',
    title: 'Know your blood pressure',
    summary: 'High blood pressure is common, often silent, and manageable.',
    body: [
      'Blood pressure is the force of blood against artery walls. Readings are given as systolic over diastolic, for example 120/80 mmHg.',
      'High blood pressure (hypertension) usually has no symptoms, so regular checks matter. It raises the risk of heart attack, stroke and kidney disease.',
    ],
    takeaway: 'Get your blood pressure checked, even when you feel fine.',
    sources: [
      {
        label: 'WHO: Hypertension',
        url: 'https://www.who.int/news-room/fact-sheets/detail/hypertension',
      },
      {
        label: 'DOH Philippines: Hypertension',
        url: 'https://doh.gov.ph/',
      },
    ],
    reviewed: REVIEWED,
  },
  {
    id: 'cholesterol',
    title: 'Cholesterol, simply put',
    summary: 'Why "bad" LDL cholesterol can clog arteries over time.',
    body: [
      'Cholesterol is a fatty substance your body needs, but too much low-density lipoprotein (LDL) can build up inside artery walls.',
      'That build-up narrows arteries and can trigger heart attacks and strokes. Diet, activity and sometimes medicine help keep levels healthy.',
    ],
    takeaway: 'Lower LDL cholesterol means clearer arteries.',
    sources: [
      {
        label: 'AHA: What is cholesterol?',
        url: 'https://www.heart.org/en/health-topics/cholesterol/about-cholesterol',
      },
    ],
    reviewed: REVIEWED,
  },
  {
    id: 'move-more',
    title: 'Move more, sit less',
    summary: 'How much physical activity protects your heart.',
    body: [
      'Adults benefit from at least 150 to 300 minutes of moderate activity each week, such as brisk walking.',
      'Regular movement lowers blood pressure, improves cholesterol and helps control weight and blood sugar.',
    ],
    takeaway: 'Aim for about 30 minutes of brisk movement most days.',
    sources: [
      {
        label: 'WHO: Physical activity',
        url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity',
      },
    ],
    reviewed: REVIEWED,
  },
  {
    id: 'eat-for-heart',
    title: 'Eat for your heart',
    summary: 'Simple food swaps that lower cardiovascular risk.',
    body: [
      'Diets rich in vegetables, fruits, whole grains, beans and fish support heart health. Limiting salt, sugary drinks and heavily processed food helps too.',
      'Cutting back on salt is one of the most effective ways to lower blood pressure.',
    ],
    takeaway: 'More whole foods, less salt and sugar.',
    sources: [
      {
        label: 'WHO: Healthy diet',
        url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet',
      },
    ],
    reviewed: REVIEWED,
  },
  {
    id: 'tobacco',
    title: 'Tobacco and your arteries',
    summary: 'How quitting smoking quickly helps your heart.',
    body: [
      'Smoking damages blood vessels, raises blood pressure and makes clots more likely.',
      'Risk starts dropping within the first year after quitting, and keeps improving over time.',
    ],
    takeaway: 'Quitting tobacco is one of the biggest wins for your heart.',
    sources: [
      {
        label: 'WHO: Tobacco',
        url: 'https://www.who.int/news-room/fact-sheets/detail/tobacco',
      },
    ],
    reviewed: REVIEWED,
  },
  {
    id: 'sleep',
    title: 'Sleep and heart health',
    summary: 'Why consistent, sufficient sleep matters for your heart.',
    body: [
      'Most adults do best with about 7 or more hours of sleep a night.',
      'Ongoing short or poor sleep is linked with higher blood pressure, weight gain and heart disease risk.',
    ],
    takeaway: 'Protect your sleep like you protect your diet and activity.',
    sources: [
      {
        label: 'AHA: Sleep and heart health',
        url: 'https://www.heart.org/en/healthy-living/healthy-lifestyle/sleep',
      },
    ],
    reviewed: REVIEWED,
  },
  {
    id: 'warning-signs',
    title: 'Warning signs of a heart attack and stroke',
    summary: 'What to notice and when to seek emergency care.',
    body: [
      'Heart attack signs can include chest discomfort, pain spreading to the arm or jaw, shortness of breath, cold sweat or nausea.',
      'For stroke, think F.A.S.T.: Face drooping, Arm weakness, Speech difficulty, Time to call emergency services. Act fast; minutes matter.',
    ],
    takeaway: 'If signs appear, call emergency services right away.',
    sources: [
      {
        label: 'AHA: Warning signs of a heart attack',
        url: 'https://www.heart.org/en/health-topics/heart-attack/warning-signs-of-a-heart-attack',
      },
    ],
    reviewed: REVIEWED,
  },
  {
    id: 'screening',
    title: 'Why screening matters',
    summary: 'Catching risk early keeps small problems small.',
    body: [
      'Many risk factors like high blood pressure, high cholesterol and high blood sugar have no symptoms, so screening finds them early.',
      'Knowing your numbers lets you and a clinician act before a serious event. This app offers screening awareness, not a diagnosis.',
    ],
    takeaway: 'Regular screening turns silent risk into something you can manage.',
    sources: [
      {
        label: 'WHO: CVD prevention and control',
        url: 'https://www.who.int/health-topics/cardiovascular-diseases',
      },
      {
        label: 'PhilHealth: Konsulta primary care',
        url: 'https://www.philhealth.gov.ph/',
      },
    ],
    reviewed: REVIEWED,
  },
];

export const CARD_COUNT = CARDS.length;

export function getCard(id: string): LibraryCard | undefined {
  return CARDS.find((card) => card.id === id);
}
