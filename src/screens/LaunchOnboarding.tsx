import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatLocalDateKey } from '../utils/date';
import { createStarterLoadout } from '../utils/starterLoadout';
import { getTodayKey, loadData, saveData, type ActiveLoadout } from '../utils/storage';

type Baseline = 'today' | 'few-days' | 'weeks' | 'months';
type Goal = 'cut-fat' | 'build-muscle' | 'recomposition';
type TrainingLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';

type LaunchForm = {
  supportLocation: string;
  baseline: Baseline;
  heightInches: string;
  weightLbs: string;
  age: string;
  sex: string;
  bodyGoal: Goal;
  trainingLevel: TrainingLevel;
};

const baselineOptions: Array<{ value: Baseline; label: string; detail: string; daysAgo: number }> = [
  { value: 'today', label: 'Just Starting', detail: 'Day one', daysAgo: 0 },
  { value: 'few-days', label: 'A Few Days', detail: 'Recent start', daysAgo: 3 },
  { value: 'weeks', label: 'Weeks', detail: 'Building momentum', daysAgo: 21 },
  { value: 'months', label: 'Months+', detail: 'Longer streak', daysAgo: 90 },
];

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

const stepLabels = ['Splash', 'Support', 'Basics', 'Goal', 'Level', 'Complete'];
const totalSetupSteps = stepLabels.length - 1;
const introPillars = ['Meetings', 'Training', 'Fuel', 'Proof'];

const estimateSobrietyDate = (baseline: Baseline) => {
  const option = baselineOptions.find((item) => item.value === baseline) || baselineOptions[0];
  const date = new Date();
  date.setDate(date.getDate() - option.daysAgo);
  return formatLocalDateKey(date);
};

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

const renderGoalIcon = (goal: Goal) => {
  if (goal === 'cut-fat') {
    return (
      <svg className="launch-goal-svg" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M16.4 30C10.4 30 6 25.6 6 19.4c0-4.3 2.4-7.5 5.3-10.4.7 3.5 2.6 4.9 4.2 2.2 1.6-2.8 1.3-6.1-.1-9.2 6.5 4.5 10.6 9.4 10.6 16.1C26 25.1 21.7 30 16.4 30Z" />
        <path d="M16.7 26.7c-2.8 0-4.8-2-4.8-4.9 0-2.2 1.3-3.8 3-5.2.2 2.1 1.2 2.9 2.4 1.3.8-1.1.9-2.5.4-4 2.7 2.1 4.4 4.4 4.4 7.3 0 3.2-2.2 5.5-5.4 5.5Z" opacity=".36" />
      </svg>
    );
  }

  if (goal === 'build-muscle') {
    return (
      <svg className="launch-goal-svg" viewBox="0 0 32 32" aria-hidden="true">
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" d="M9 20.5c1.7 5.4 7.1 8.1 13 5.9 3.7-1.4 6-4 6.4-7.8.2-1.9-.5-3.5-1.9-4.6-1.5-1.2-3.8-.9-5.2.5l-2.1 2.1" />
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" d="M8.8 20.2V9.7c0-2.2 1.5-3.7 3.5-3.7s3.4 1.5 3.4 3.7v6.8h3.6c2.6 0 4.4 1.5 4.4 3.8" />
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" d="M5 18.4h7.4" />
      </svg>
    );
  }

  return (
    <svg className="launch-goal-svg" viewBox="0 0 32 32" aria-hidden="true">
      <path d="M11.7 18.4c-3.2 0-5.6-2.4-5.6-5.8 0-2.2 1.2-4 2.8-5.6.4 2.2 1.5 3.1 2.6 1.4.9-1.5.8-3.3.1-5 3.6 2.5 6 5.4 6 9.3 0 3.3-2.4 5.7-5.9 5.7Z" />
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 23c2.2 4.1 6.9 5.6 12 3.9 3-1 4.8-3 5.4-5.8.4-1.8-.1-3.3-1.2-4.2-1.3-1.1-3.2-.8-4.5.6l-1.9 2" />
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 23v-7.6c0-1.8 1.2-3.1 3-3.1s3 1.3 3 3.1v4.2h4.2c2 0 3.5 1.2 3.5 3.3" />
    </svg>
  );
};

const renderLevelIcon = (level: TrainingLevel) => {
  if (level === 'beginner') {
    return (
      <svg className="launch-level-svg" viewBox="0 0 32 32" aria-hidden="true">
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 15.2a5.1 5.1 0 1 0 0-10.2 5.1 5.1 0 0 0 0 10.2Z" />
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M7.3 27c1.4-5.1 4.2-7.7 8.7-7.7s7.3 2.6 8.7 7.7" />
      </svg>
    );
  }

  if (level === 'intermediate') {
    return (
      <svg className="launch-level-svg" viewBox="0 0 32 32" aria-hidden="true">
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 28a10.5 10.5 0 1 0 0-21 10.5 10.5 0 0 0 0 21Z" />
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 11v6.3l4 2.3M12.6 4h6.8" />
      </svg>
    );
  }

  if (level === 'advanced') {
    return (
      <svg className="launch-level-svg" viewBox="0 0 32 32" aria-hidden="true">
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M16 3.7 25.4 7v7.2c0 6.5-3.5 11.2-9.4 14.1-5.9-2.9-9.4-7.6-9.4-14.1V7L16 3.7Z" />
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="m11.9 16 2.6 2.6 5.9-6.2" />
      </svg>
    );
  }

  return (
    <svg className="launch-level-svg" viewBox="0 0 32 32" aria-hidden="true">
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M10.2 5.3h11.6v4.2c0 4.1-2.5 7.1-5.8 7.1s-5.8-3-5.8-7.1V5.3Z" />
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M10.4 8.2H5.8c0 4.2 1.9 6.7 5.7 7.4M21.6 8.2h4.6c0 4.2-1.9 6.7-5.7 7.4M16 16.6v5.2M10.8 27h10.4M13 21.8h6" />
    </svg>
  );
};

const LaunchBrand = ({ count }: { count?: string }) => (
  <header className="launch-brand">
    <strong>IRON <b>HABIT</b></strong>
    {count && <span>{count}</span>}
  </header>
);

const LaunchOnboarding = () => {
  const navigate = useNavigate();
  const saved = useMemo(() => loadData(), []);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<LaunchForm>({
    supportLocation: saved.profile.supportLocation || '',
    baseline: 'today',
    heightInches: saved.bodyProfile.heightInches || '',
    weightLbs: saved.bodyProfile.weightLbs || '',
    age: saved.bodyProfile.age || '',
    sex: saved.bodyProfile.sex || '',
    bodyGoal: goalOptions.some((option) => option.value === saved.bodyProfile.bodyGoal) ? saved.bodyProfile.bodyGoal as Goal : 'recomposition',
    trainingLevel: 'intermediate',
  });

  const selectedGoal = goalOptions.find((item) => item.value === form.bodyGoal) || goalOptions[2];
  const selectedLevel = levelOptions.find((item) => item.value === form.trainingLevel) || levelOptions[1];
  const isFinalStep = step === stepLabels.length - 1;

  const update = (key: keyof LaunchForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const goNext = () => {
    setStep((current) => Math.min(current + 1, stepLabels.length - 1));
  };

  const saveAndEnter = () => {
    const current = loadData();
    const activeLoadout = makeStarterLoadout(form);

    saveData({
      profile: {
        ...current.profile,
        supportLocation: form.supportLocation.trim(),
        sobrietyDate: estimateSobrietyDate(form.baseline) || current.profile.sobrietyDate || getTodayKey(),
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
    <section className={`launch-onboarding ${step === 0 ? 'launch-splash' : ''}`}>
      {step === 0 && (
        <div className="launch-step-card">
          <LaunchBrand />
          <img className="launch-splash-coach" src="/mockup-assets/iron-habit-coach-v2.png" alt="Iron Habit helmet coach" />
          <h1 className="launch-logo-stack">
            <span>IRON</span>
            <b>HABIT</b>
          </h1>
          <p>Build the day that keeps you sober, trained, fed, and moving forward.</p>
          <div className="launch-pillar-strip" aria-label="Iron Habit setup includes">
            {introPillars.map((pillar) => (
              <span key={pillar}>{pillar}</span>
            ))}
          </div>
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
        <div className="launch-step-card">
          <LaunchBrand count={`1 of ${totalSetupSteps}`} />
          <h1>Where are you building from?</h1>
          <p>Your city or support area helps us find you the right support.</p>
          <label className="launch-field-card launch-location-field">
            <span className="launch-search-icon" aria-hidden="true" />
            <input
              value={form.supportLocation}
              onChange={(event) => update('supportLocation', event.target.value)}
              placeholder="Enter your city"
              aria-label="Enter your city"
            />
          </label>
          <h2>What's your recovery baseline?</h2>
          <div className="launch-option-grid">
            {baselineOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`launch-option-card ${form.baseline === option.value ? 'selected' : ''}`}
                onClick={() => update('baseline', option.value)}
              >
                <strong>{option.label}</strong>
                <span>{option.detail}</span>
              </button>
            ))}
          </div>
          <button className="launch-primary" type="button" onClick={goNext}>
            Next
          </button>
          {renderProgress()}
        </div>
      )}

      {step === 2 && (
        <div className="launch-step-card">
          <LaunchBrand count={`2 of ${totalSetupSteps}`} />
          <h1>Your basics. Let's lock it in.</h1>
          <p>This helps us build your personal plan.</p>
          <label className="launch-field-card launch-metric-field">
            <span className="launch-field-title"><i className="launch-metric-icon height" aria-hidden="true" />Height</span>
            <span className="launch-value-wrap">
              <input inputMode="numeric" value={form.heightInches} onChange={(event) => update('heightInches', event.target.value)} placeholder="--" />
              <em>in</em>
            </span>
          </label>
          <label className="launch-field-card launch-metric-field">
            <span className="launch-field-title"><i className="launch-metric-icon weight" aria-hidden="true" />Weight</span>
            <span className="launch-value-wrap">
              <input inputMode="numeric" value={form.weightLbs} onChange={(event) => update('weightLbs', event.target.value)} placeholder="--" />
              <em>lb</em>
            </span>
          </label>
          <label className="launch-field-card launch-metric-field">
            <span className="launch-field-title"><i className="launch-metric-icon age" aria-hidden="true" />Age</span>
            <span className="launch-value-wrap launch-value-wrap-solo">
              <input inputMode="numeric" value={form.age} onChange={(event) => update('age', event.target.value)} placeholder="--" />
            </span>
          </label>
          <label className="launch-field-card launch-metric-field">
            <span className="launch-field-title"><i className="launch-metric-icon gender" aria-hidden="true" />Gender</span>
            <select value={form.sex} onChange={(event) => update('sex', event.target.value)}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
          <button className="launch-primary" type="button" onClick={goNext}>
            Next
          </button>
          {renderProgress()}
        </div>
      )}

      {step === 3 && (
        <div className="launch-step-card">
          <LaunchBrand count={`3 of ${totalSetupSteps}`} />
          <h1>What's your target?</h1>
          <p>We'll build your plan around it.</p>
          <div className="launch-option-list">
            {goalOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`launch-option-card launch-goal-card ${form.bodyGoal === option.value ? 'selected' : ''}`}
                onClick={() => update('bodyGoal', option.value)}
              >
                {renderGoalIcon(option.value)}
                <span className="launch-option-copy">
                  <strong>{option.title}</strong>
                  <span>{option.detail}</span>
                </span>
              </button>
            ))}
          </div>
          <button className="launch-primary" type="button" onClick={goNext}>
            Next
          </button>
          {renderProgress()}
        </div>
      )}

      {step === 4 && (
        <div className="launch-step-card">
          <LaunchBrand count={`4 of ${totalSetupSteps}`} />
          <h1>Your training level?</h1>
          <p>Be honest. This keeps you safe and progressing.</p>
          <div className="launch-option-list">
            {levelOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`launch-option-card launch-level-card ${form.trainingLevel === option.value ? 'selected' : ''}`}
                onClick={() => update('trainingLevel', option.value)}
              >
                {renderLevelIcon(option.value)}
                <span className="launch-option-copy">
                  <strong>{option.title}</strong>
                  <span>{option.detail}</span>
                </span>
              </button>
            ))}
          </div>
          <button className="launch-primary" type="button" onClick={goNext}>
            Next
          </button>
          {renderProgress()}
        </div>
      )}

      {isFinalStep && (
        <div className="launch-step-card launch-complete-card">
          <LaunchBrand count={`${totalSetupSteps} of ${totalSetupSteps}`} />
          <h1>Plan ready. Start today.</h1>
          <p>Meetings, training, fuel, and proof are loaded around your baseline.</p>
          <img src="/mockup-assets/iron-habit-coach-v2.png" alt="" />
          <ul>
            <li>Profile created</li>
            <li>Daily plan building</li>
            <li>{form.supportLocation.trim() || 'Support area'} saved</li>
            <li>{selectedLevel.days} day starter split ready</li>
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
