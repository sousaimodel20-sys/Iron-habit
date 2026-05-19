import { NavLink, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Onboarding from './screens/Onboarding';
import DailyCheckIn from './screens/DailyCheckIn';
import HabitTracker from './screens/HabitTracker';
import FitnessTracker from './screens/FitnessTracker';
import ProgressDashboard from './screens/ProgressDashboard';
import ShareProgressScreen from './screens/ShareProgressScreen';
import CravingRescue from './screens/CravingRescue';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/fitness-tracker', label: 'Train' },
  { to: '/daily-check-in', label: 'Check-In' },
  { to: '/share-progress', label: 'Community' },
  { to: '/progress-dashboard', label: 'Profile' },
];

function App() {
  return (
    <Router>
      <div className="app-shell">
        <header className="topbar">
          <NavLink to="/" className="brand" aria-label="Iron Habit home">
            <span className="brand-mark">IH</span>
            <span>
              <strong>Iron Habit</strong>
              <small>Sober • Strong • Consistent</small>
            </span>
          </NavLink>
          <span className="live-pill">Beta Access</span>
        </header>

        <main className="screen-frame">
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/daily-check-in" element={<DailyCheckIn />} />
            <Route path="/habit-tracker" element={<HabitTracker />} />
            <Route path="/fitness-tracker" element={<FitnessTracker />} />
            <Route path="/progress-dashboard" element={<ProgressDashboard />} />
            <Route path="/share-progress" element={<ShareProgressScreen />} />
            <Route path="/craving-rescue" element={<CravingRescue />} />
          </Routes>
        </main>

        <nav className="bottom-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </Router>
  );
}

export default App;
