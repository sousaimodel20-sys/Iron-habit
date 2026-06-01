import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { estimateSobrietyDate, normalizeSoberDateInput, recoveryBaselineOptions, resolveSobrietyDate, type RecoveryBaseline } from '../utils/launchOnboarding';
import { createStarterLoadout } from '../utils/starterLoadout';
import { getTodayKey, loadData, saveData, type ActiveLoadout } from '../utils/storage';

type Baseline = RecoveryBaseline;
type Goal = 'cut-fat' | 'build-muscle' | 'recomposition';
type TrainingLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';

type LaunchForm = {
  supportLocation: string;
  soberDate: string;
  baseline: Baseline;
  heightInches: string;
  weightLbs: string;
  age: string;
  sex: string;
  bodyGoal: Goal;
  trainingLevel: TrainingLevel;
};

const baselineOptions = recoveryBaselineOptions;

const goalOptions: Array<{ value: Goal; title: string; detail: string; loadoutGoal: string }> = [
  { value: 'cut-fat', title: 'Fat Loss', detail: 'Burn fat. Get lean.', loadoutGoal: 'Lose fat while protecting muscle and sobriety.' },
  { value: 'build-muscle', title: 'Muscle Gain', detail: 'Build muscle. Get strong.', loadoutGoal: 'Build muscle and stay locked in.' },
  { value: 'recomposition', title: 'Both', detail: 'Recomp. Best of both.', loadoutGoal: 'Get leaner, stronger, and consistent.' },
];

const levelOptions: Array<{ value: TrainingLevel; title: string; detail: string; activity: string; days: string; loadoutLevel: string }> = [
  { value: 'beginner', title: 'Beginner', detail: 'New to training', activity: 'light', days: '3', loadoutLevel: 'Beginner' },
  { value: 'intermediate', title: 'Intermediate', detail: 'Some experience', activity: 'moderate', days: '4', loadoutLevel: 'Intermediate' },
  { value: 'advanced', title: 'Advanced', detail: 'Trained for a while', activity: 'active', days: '5', loadoutLevel: 'Advanced' },
  { value: 'elite', title: 'Elite', detail: 'Very experienced', activity: 'athlete', days: '6', loadoutLevel: 'Advanced' },
];

const stepLabels = ['Splash', 'Setup', 'Complete'];
const totalSetupSteps = stepLabels.length - 1;
const finalStep = stepLabels.length - 1;

type LaunchIntroIcon =
  | 'dumbbell'
  | 'fuel'
  | 'group'
  | 'menu'
  | 'profile'
  | 'shield';

const introFeatureCards: Array<{ label: string; detail: string; icon: LaunchIntroIcon }> = [
  { label: 'Meetings', detail: 'Stay connected. Stay accountable.', icon: 'group' },
  { label: 'Training', detail: 'Structured workouts that build you.', icon: 'dumbbell' },
  { label: 'Fuel', detail: 'Nutrition that fuels your mission.', icon: 'fuel' },
  { label: 'Proof', detail: 'Track progress. See the proof.', icon: 'shield' },
];

const introDisciplineChecks = [
  { label: 'Build unshakable habits' },
  { label: 'Eliminate excuses' },
  { label: 'Track what matters' },
  { label: 'Become the man', emphasis: 'you respect' },
];

type LaunchSetupIcon =
  | 'age'
  | 'back'
  | 'body'
  | 'calendar'
  | 'checkins'
  | 'flag'
  | 'gender'
  | 'height'
  | 'location'
  | 'meals'
  | 'proof'
  | 'target'
  | 'training'
  | 'weight';

const setupHeroTiles: Array<{ label: string; icon: LaunchSetupIcon }> = [
  { label: 'Training', icon: 'training' },
  { label: 'Meals', icon: 'meals' },
  { label: 'Check-ins', icon: 'checkins' },
  { label: 'Proof', icon: 'proof' },
];

const setupMetricFields: Array<{ key: keyof Pick<LaunchForm, 'weightLbs' | 'age'>; label: string; unit: string; icon: LaunchSetupIcon; placeholder: string; inputMode: 'numeric' }> = [
  { key: 'weightLbs', label: 'Weight', unit: 'lb', icon: 'weight', placeholder: '185', inputMode: 'numeric' },
  { key: 'age', label: 'Age', unit: 'yrs', icon: 'age', placeholder: '35', inputMode: 'numeric' },
];

const heightFeetOptions = [4, 5, 6, 7];
const heightInchOptions = Array.from({ length: 12 }, (_, index) => index);

const soberDateMonths = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

const parseSoberDateParts = (value: string, fallback = getTodayKey()) => {
  const normalized = normalizeSoberDateInput(value) || fallback;
  const [yearText, monthText, dayText] = normalized.split('-');
  return {
    year: Number(yearText),
    month: Number(monthText),
    day: Number(dayText),
  };
};

const formatSoberDateParts = ({ year, month, day }: { year: number; month: number; day: number }) =>
  `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const makeStarterLoadout = (form: LaunchForm): ActiveLoadout => {
  const selectedGoal = goalOptions.find((item) => item.value === form.bodyGoal) || goalOptions[2];
  const selectedLevel = levelOptions.find((item) => item.value === form.trainingLevel) || levelOptions[1];
  const starter = createStarterLoadout();

  return {
    ...starter,
    goal: selectedGoal.loadoutGoal,
    level: selectedLevel.loadoutLevel,
  };
};

const LaunchBrand = ({ count }: { count?: string }) => (
  <header className="launch-brand">
    <strong>IRON <b>HABIT</b></strong>
    {count && <span>{count}</span>}
  </header>
);

const LaunchIntroSvg = ({ name }: { name: LaunchIntroIcon }) => {
  const common = {
    className: `launch-intro-svg launch-intro-svg-${name}`,
    viewBox: '0 0 32 32',
    'aria-hidden': true,
  };

  if (name === 'menu') {
    return (
      <svg {...common}>
        <path d="M7 10h18M7 16h18M7 22h18" />
      </svg>
    );
  }

  if (name === 'group') {
    return (
      <svg {...common}>
        <path d="M16 14.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z" />
        <path d="M8.7 26.6c1.2-5 3.6-7.4 7.3-7.4s6.1 2.4 7.3 7.4" />
        <path d="M7.5 15.6a3.5 3.5 0 1 0 0-7M3.7 25.1c.7-3.4 2.3-5.5 5-6.2M24.5 15.6a3.5 3.5 0 1 0 0-7M28.3 25.1c-.7-3.4-2.3-5.5-5-6.2" />
      </svg>
    );
  }

  if (name === 'profile') {
    return (
      <svg {...common}>
        <path d="M16 15.2a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
        <path d="M6.8 27c1.6-5.4 4.6-8.1 9.2-8.1s7.6 2.7 9.2 8.1" />
      </svg>
    );
  }

  if (name === 'dumbbell') {
    return (
      <svg {...common}>
        <path d="M3.8 13.5v5M7.3 11.2v9.6M11.1 13.1v5.8M12.2 16h7.6M20.9 13.1v5.8M24.7 11.2v9.6M28.2 13.5v5" />
      </svg>
    );
  }

  if (name === 'fuel') {
    return (
      <svg {...common}>
        <path d="M9.4 26.5V6.2h11.4l4.2 4.2v16.1H9.4Z" />
        <path d="M20.8 6.2v5h5M13.2 15.2h7.1M13.2 19h5.4" />
        <path d="M7 26.5h20" />
      </svg>
    );
  }

  if (name === 'shield') {
    return (
      <svg {...common}>
        <path d="M16 4.4 25 7.8v6.6c0 6.1-3.3 10.6-9 13.2-5.7-2.6-9-7.1-9-13.2V7.8l9-3.4Z" />
        <path d="m12.2 16.1 2.5 2.5 5.4-5.6" />
      </svg>
    );
  }

  return null;
};

const LaunchSetupSvg = ({ name }: { name: LaunchSetupIcon }) => {
  const common = {
    className: `launch-setup-svg launch-setup-svg-${name}`,
    viewBox: '0 0 32 32',
    'aria-hidden': true,
  };

  if (name === 'back') {
    return (
      <svg {...common}>
        <path d="M19.8 7.5 11.4 16l8.4 8.5M12 16h14" />
      </svg>
    );
  }

  if (name === 'calendar') {
    return (
      <svg {...common}>
        <path d="M9.3 5.5v5M22.7 5.5v5M6.7 11.4h18.6M7.2 7.8h17.6v18H7.2v-18Z" />
        <path d="M12.1 16.5h2.7M17.2 16.5h2.7M12.1 20.5h2.7M17.2 20.5h2.7" />
      </svg>
    );
  }

  if (name === 'training') {
    return (
      <svg {...common}>
        <path d="M3.8 13.5v5M7.3 11.2v9.6M11.1 13.1v5.8M12.2 16h7.6M20.9 13.1v5.8M24.7 11.2v9.6M28.2 13.5v5" />
      </svg>
    );
  }

  if (name === 'meals') {
    return (
      <svg {...common}>
        <path d="M10.5 5.5v10.2M6.7 5.5v10.2M14.2 5.5v10.2M6.7 11h7.5M10.5 15.7v10.8" />
        <path d="M21 5.6c3.3 2.4 4.7 5.4 4.1 9.1-.4 2.5-1.6 4-3.3 4.4v7.4" />
      </svg>
    );
  }

  if (name === 'checkins') {
    return (
      <svg {...common}>
        <path d="M11.7 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20.3 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M4.9 25.2c1-4.4 3.2-6.7 6.8-6.7s5.8 2.3 6.8 6.7M13.4 23.7c1-3.4 3.3-5.2 6.9-5.2 3.5 0 5.8 2.2 6.8 6.7" />
      </svg>
    );
  }

  if (name === 'proof') {
    return (
      <svg {...common}>
        <path d="M16 4.4 25 7.8v6.6c0 6.1-3.3 10.6-9 13.2-5.7-2.6-9-7.1-9-13.2V7.8l9-3.4Z" />
        <path d="m12.2 16.1 2.5 2.5 5.4-5.6" />
      </svg>
    );
  }

  if (name === 'location') {
    return (
      <svg {...common}>
        <path d="M16 28s8-7.2 8-14.1a8 8 0 1 0-16 0C8 20.8 16 28 16 28Z" />
        <path d="M16 16.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      </svg>
    );
  }

  if (name === 'height') {
    return (
      <svg {...common}>
        <path d="M8.8 6.5 5.5 9.8M5.5 6.5l3.3 3.3M23.2 22.2l3.3 3.3M26.5 22.2l-3.3 3.3M8.2 23.8 23.8 8.2" />
      </svg>
    );
  }

  if (name === 'weight') {
    return (
      <svg {...common}>
        <path d="M9.1 10.7h13.8l1.7 15.3H7.4l1.7-15.3Z" />
        <path d="M12.2 10.7a3.8 3.8 0 0 1 7.6 0M16 17.3v3.8" />
      </svg>
    );
  }

  if (name === 'age') {
    return (
      <svg {...common}>
        <path d="M8 9.2h16v16.4H8V9.2ZM11.4 5.8v5M20.6 5.8v5M8 13.9h16" />
        <path d="M12 18.3h3M17.2 18.3h3M12 22h3" />
      </svg>
    );
  }

  if (name === 'gender') {
    return (
      <svg {...common}>
        <path d="M16 15a4.8 4.8 0 1 0 0-9.6 4.8 4.8 0 0 0 0 9.6Z" />
        <path d="M7.4 26.6c1.4-5.2 4.3-7.8 8.6-7.8s7.2 2.6 8.6 7.8" />
      </svg>
    );
  }

  if (name === 'target') {
    return (
      <svg {...common}>
        <path d="M16 28a12 12 0 1 0 0-24 12 12 0 0 0 0 24Z" />
        <path d="M16 23a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
        <path d="M16 18.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4ZM22 4l5 1-1 5" />
      </svg>
    );
  }

  if (name === 'flag') {
    return (
      <svg {...common}>
        <path d="M5.4 25.4h21.2M6.8 25.4l6.6-8.4 4.1 5 4.4-6.2 5.3 9.6" />
        <path d="M18.2 22 22 5.4M22 5.4v6.2l5.4-1.8L22 8" />
        <path d="M10.1 22.1h12.7M12.9 18.1h7.2" opacity=".5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M16 4.8c2.1 0 3.7 1.6 3.7 3.7s-1.6 3.7-3.7 3.7-3.7-1.6-3.7-3.7 1.6-3.7 3.7-3.7Z" />
      <path d="M12.4 13.6h7.2l2.2 13.6h-3.1l-.8-6.5h-3.8l-.8 6.5h-3.1l2.2-13.6Z" />
      <path d="M12.2 16.4 7 24M19.8 16.4 25 24" />
    </svg>
  );
};

const LaunchOnboarding = () => {
  const navigate = useNavigate();
  const saved = useMemo(() => loadData(), []);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<LaunchForm>({
    supportLocation: saved.profile.supportLocation || '',
    soberDate: normalizeSoberDateInput(saved.profile.sobrietyDate || '') || estimateSobrietyDate('today'),
    baseline: 'today',
    heightInches: saved.bodyProfile.heightInches || '70',
    weightLbs: saved.bodyProfile.weightLbs || '',
    age: saved.bodyProfile.age || '',
    sex: saved.bodyProfile.sex || '',
    bodyGoal: goalOptions.some((option) => option.value === saved.bodyProfile.bodyGoal) ? saved.bodyProfile.bodyGoal as Goal : 'recomposition',
    trainingLevel: 'intermediate',
  });

  const selectedGoal = goalOptions.find((item) => item.value === form.bodyGoal) || goalOptions[2];
  const selectedLevel = levelOptions.find((item) => item.value === form.trainingLevel) || levelOptions[1];
  const heightTotalInches = Number(form.heightInches) || 70;
  const heightFeet = Math.floor(heightTotalInches / 12);
  const heightInches = heightTotalInches % 12;
  const soberDateParts = useMemo(() => parseSoberDateParts(form.soberDate), [form.soberDate]);
  const soberDateYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 81 }, (_, index) => currentYear - index);
  }, []);
  const soberDateDayOptions = useMemo(
    () => Array.from({ length: daysInMonth(soberDateParts.year, soberDateParts.month) }, (_, index) => index + 1),
    [soberDateParts.month, soberDateParts.year],
  );
  const isFinalStep = step === finalStep;

  const update = (key: keyof LaunchForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const chooseBaseline = (baseline: Baseline) => {
    setForm((current) => ({ ...current, baseline, soberDate: estimateSobrietyDate(baseline) }));
  };

  const updateSoberDatePart = (part: 'month' | 'day' | 'year', value: string) => {
    setForm((current) => {
      const currentParts = parseSoberDateParts(current.soberDate);
      const nextParts = { ...currentParts, [part]: Number(value) };
      const safeDay = Math.min(nextParts.day, daysInMonth(nextParts.year, nextParts.month));

      return {
        ...current,
        soberDate: formatSoberDateParts({ ...nextParts, day: safeDay }),
      };
    });
  };

  const updateHeightPart = (part: 'feet' | 'inches', value: string) => {
    setForm((current) => {
      const currentTotal = Number(current.heightInches) || 70;
      const currentFeet = Math.floor(currentTotal / 12);
      const currentInches = currentTotal % 12;
      const nextFeet = part === 'feet' ? Number(value) : currentFeet;
      const nextInches = part === 'inches' ? Number(value) : currentInches;
      return { ...current, heightInches: String((nextFeet * 12) + nextInches) };
    });
  };

  const goNext = () => {
    setStep((current) => Math.min(current + 1, stepLabels.length - 1));
  };

  const goBackToIntro = () => {
    setStep(0);
  };

  const continueFromSetup = () => {
    setStep(finalStep);
  };

  const saveAndEnter = () => {
    const current = loadData();
    const activeLoadout = makeStarterLoadout(form);
    const sobrietyDate = resolveSobrietyDate({
      enteredDate: form.soberDate,
      baseline: form.baseline,
      savedDate: current.profile.sobrietyDate,
      todayKey: getTodayKey(),
    });

    saveData({
      profile: {
        ...current.profile,
        supportLocation: form.supportLocation.trim(),
        sobrietyDate,
        transformationGoal: selectedGoal.loadoutGoal,
      },
      bodyProfile: {
        ...current.bodyProfile,
        heightInches: form.heightInches.trim(),
        weightLbs: form.weightLbs.trim(),
        age: form.age.trim(),
        sex: form.sex,
        bodyGoal: form.bodyGoal,
        activityLevel: selectedLevel.activity,
        trainingDaysPerWeek: selectedLevel.days,
        updatedAt: new Date().toISOString(),
      },
      activeLoadout,
    });

    navigate('/today');
  };

  const renderProgress = () => (
    <div className="launch-progress-dots" aria-label={`Step ${step} of ${stepLabels.length - 1}`}>
      {stepLabels.slice(1).map((label, index) => (
        <span key={label} className={index < step ? 'active' : ''} />
      ))}
    </div>
  );

  return (
    <section className={`launch-onboarding ${step === 0 ? 'launch-splash' : ''} ${step === 1 ? 'launch-setup-screen' : ''}`.trim()}>
      {step === 0 && (
        <div className="launch-step-card launch-intro-page">
          <header className="launch-intro-topbar">
            <Link to="/launch-kit" className="launch-circle-button" aria-label="Open menu">
              <LaunchIntroSvg name="menu" />
            </Link>
            <div className="launch-intro-kicker" aria-label="Become unstoppable">
              <span>Become</span>
              <strong>Unstoppable</strong>
            </div>
            <Link to="/setup-profile" className="launch-circle-button" aria-label="Open profile">
              <LaunchIntroSvg name="profile" />
            </Link>
          </header>

          <section className="launch-intro-hero" aria-label="Iron Habit introduction">
            <span className="launch-red-rail launch-red-rail-left" aria-hidden="true" />
            <span className="launch-red-rail launch-red-rail-right" aria-hidden="true" />
            <img className="launch-splash-coach" src="/mockup-assets/iron-habit-coach-v2.png" alt="Iron Habit helmet coach" />
            <h1 className="launch-logo-stack">
              <span>IRON</span>
              <b>HABIT</b>
            </h1>
            <p>Build the day that keeps you sober, trained, fed, and moving forward.</p>
          </section>

          <div className="launch-feature-grid" aria-label="Iron Habit setup includes">
            {introFeatureCards.map((card) => (
              <article className="launch-feature-card" key={card.label}>
                <LaunchIntroSvg name={card.icon} />
                <strong>{card.label}</strong>
                <small>{card.detail}</small>
              </article>
            ))}
          </div>

          <section className="launch-discipline-card">
            <div className="launch-discipline-copy">
              <h2>
                <span>Discipline today.</span>
                <b>Freedom tomorrow.</b>
              </h2>
              <ul>
                {introDisciplineChecks.map((item) => (
                  <li key={item.label}>
                    {item.label}
                    {item.emphasis && <em> {item.emphasis}</em>}
                  </li>
                ))}
              </ul>
            </div>
            <img src="/mockup-assets/iron-habit-coach-v2.png" alt="" aria-hidden="true" />
          </section>

          <button className="launch-primary launch-splash-start" type="button" onClick={goNext}>
            <span className="launch-plan-mark" aria-hidden="true" />
            <span>
              <strong>Start My Plan</strong>
              <small>Meetings, training, fuel, and proof.</small>
            </span>
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="launch-step-card launch-setup-page">
          <header className="launch-setup-header">
            <button type="button" className="launch-setup-back" onClick={goBackToIntro} aria-label="Back to intro">
              <LaunchSetupSvg name="back" />
            </button>
            <div className="launch-setup-logo" aria-label="Iron Habit">
              <strong>IRON</strong>
              <b>HABIT</b>
              <small>Build your foundation. Become <em>unstoppable.</em></small>
            </div>
            <span className="launch-setup-pill">Setup</span>
          </header>

          <section className="launch-setup-hero" aria-label="Setup overview">
            <span className="launch-setup-hero-rail" aria-hidden="true" />
            <img src="/mockup-assets/iron-habit-coach-v2.png" alt="Iron Habit helmet coach" />
            <div className="launch-setup-hero-copy">
              <small>Setup</small>
              <h1>Build a plan that fits your day.</h1>
              <p>Training, meals, check-ins, meetings, and proof stay organized around your baseline.</p>
              <div className="launch-setup-tile-grid" aria-label="Plan includes">
                {setupHeroTiles.map((tile) => (
                  <span key={tile.label}>
                    <LaunchSetupSvg name={tile.icon} />
                    <b>{tile.label}</b>
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="launch-setup-card launch-recovery-card">
            <div className="launch-setup-section-head">
              <small>01 / Location + Recovery</small>
              <h2>Set your starting point</h2>
              <p>City, nearby support, and where you are in recovery.</p>
            </div>

            <div className="launch-recovery-grid">
              <div className="launch-recovery-fields">
                <label className="launch-setup-input">
                  <LaunchSetupSvg name="location" />
                  <span>
                    <b>Enter your city</b>
                    <input
                      value={form.supportLocation}
                      onChange={(event) => update('supportLocation', event.target.value)}
                      placeholder="Search city..."
                      aria-label="Enter your city"
                    />
                  </span>
                </label>
                <div className="launch-setup-input launch-sober-date-picker">
                  <LaunchSetupSvg name="calendar" />
                  <span>
                    <b>Sober date</b>
                    <div className="launch-sober-date-selects" aria-label="Select your sober date">
                      <select
                        value={soberDateParts.month}
                        onChange={(event) => updateSoberDatePart('month', event.target.value)}
                        aria-label="Sober date month"
                      >
                        {soberDateMonths.map((month, index) => (
                          <option key={month} value={index + 1}>{month}</option>
                        ))}
                      </select>
                      <select
                        value={soberDateParts.day}
                        onChange={(event) => updateSoberDatePart('day', event.target.value)}
                        aria-label="Sober date day"
                      >
                        {soberDateDayOptions.map((day) => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                      <select
                        value={soberDateParts.year}
                        onChange={(event) => updateSoberDatePart('year', event.target.value)}
                        aria-label="Sober date year"
                      >
                        {soberDateYearOptions.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </span>
                </div>
                <div className="launch-baseline-row" aria-label="Quick sober date choices">
                  {baselineOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={form.baseline === option.value ? 'selected' : ''}
                      onClick={() => chooseBaseline(option.value)}
                    >
                      <b>{option.label}</b>
                      <small>{option.detail}</small>
                    </button>
                  ))}
                </div>
              </div>

              <aside className="launch-counts-card">
                <div className="launch-flag-visual" aria-hidden="true">
                  <LaunchSetupSvg name="flag" />
                </div>
                <strong>Every day counts.</strong>
                <p>There's no perfect time to start, but today is the day you change everything.</p>
              </aside>
            </div>

            <div className="launch-training-level-row" aria-label="Training level">
              {levelOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={form.trainingLevel === option.value ? 'selected' : ''}
                  onClick={() => update('trainingLevel', option.value)}
                >
                  <LaunchSetupSvg name="training" />
                  <span>
                    <b>{option.title}</b>
                    <small>{option.detail}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="launch-setup-card launch-basics-card">
            <LaunchSetupSvg name="body" />
            <div className="launch-basics-content">
              <div className="launch-setup-section-head">
                <small>02 / Body Basics</small>
                <h2>Add the basics</h2>
                <p>Height, weight, age, and gender help tune training and nutrition.</p>
              </div>
              <div className="launch-basics-grid">
                <div className="launch-setup-input launch-metric-setup-input launch-height-picker">
                  <LaunchSetupSvg name="height" />
                  <span>
                    <b>Height</b>
                    <div className="launch-height-selects" aria-label="Select your height">
                      <select
                        value={heightFeet}
                        onChange={(event) => updateHeightPart('feet', event.target.value)}
                        aria-label="Height feet"
                      >
                        {heightFeetOptions.map((feet) => (
                          <option key={feet} value={feet}>{feet} ft</option>
                        ))}
                      </select>
                      <select
                        value={heightInches}
                        onChange={(event) => updateHeightPart('inches', event.target.value)}
                        aria-label="Height inches"
                      >
                        {heightInchOptions.map((inches) => (
                          <option key={inches} value={inches}>{inches} in</option>
                        ))}
                      </select>
                    </div>
                  </span>
                </div>
                {setupMetricFields.map((field) => (
                  <label className="launch-setup-input launch-metric-setup-input" key={field.key}>
                    <LaunchSetupSvg name={field.icon} />
                    <span>
                      <b>{field.label}</b>
                      <input
                        inputMode={field.inputMode}
                        value={form[field.key]}
                        onChange={(event) => update(field.key, event.target.value)}
                        placeholder={field.placeholder}
                        aria-label={field.label}
                      />
                    </span>
                    <em>{field.unit}</em>
                  </label>
                ))}
                <label className="launch-setup-input launch-metric-setup-input">
                  <LaunchSetupSvg name="gender" />
                  <span>
                    <b>Gender</b>
                    <select value={form.sex} onChange={(event) => update('sex', event.target.value)} aria-label="Gender">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </span>
                  <em>⌄</em>
                </label>
              </div>
            </div>
          </section>

          <button className="launch-primary launch-save-continue" type="button" onClick={continueFromSetup}>
            <LaunchSetupSvg name="target" />
            <span>
              <strong>Save &amp; Continue</strong>
              <small>Build your plan. Build your future.</small>
            </span>
          </button>
        </div>
      )}

      {isFinalStep && (
        <div className="launch-step-card launch-complete-card">
          <LaunchBrand count={`${totalSetupSteps} of ${totalSetupSteps}`} />
          <h1>Plan ready. Start today.</h1>
          <p>Meetings, training, fuel, and proof are loaded around your baseline. Your data stays on this device unless you export a backup from Settings.</p>
          <img src="/mockup-assets/iron-habit-coach-v2.png" alt="" />
          <ul>
            <li>Profile created</li>
            <li>Daily plan building</li>
            <li>{form.supportLocation.trim() || 'Support area'} saved</li>
            <li>{selectedLevel.days} day starter split ready</li>
            <li>Private beta — support, not emergency care</li>
          </ul>
          <button className="launch-primary" type="button" onClick={saveAndEnter}>
            Enter Iron Habit
          </button>
          {renderProgress()}
        </div>
      )}
    </section>
  );
};

export default LaunchOnboarding;
