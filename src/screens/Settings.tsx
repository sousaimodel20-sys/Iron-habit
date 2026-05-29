import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/UI';
import { defaultData, loadData, replaceData, resetData, type IronHabitData } from '../utils/storage';
import { formatLocalDateKey } from '../utils/date';
import { BrandHeader, HelmetCoach, StatCard } from './IronHabitMockup';

const Settings = () => {
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'success'>('idle');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const savedData = loadData();
  const profile = savedData.profile;
  const supportReady = Boolean(profile.supportName.trim() && profile.supportPhone.trim());

  const handleExportData = () => {
    try {
      const data = loadData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `iron-habit-backup-${formatLocalDateKey()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      setDownloadStatus('success');
      setTimeout(() => setDownloadStatus('idle'), 2000);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleCopyBackup = async () => {
    try {
      const data = loadData();
      const json = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(json);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('loading');
    setImportError('');

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as { data?: Partial<IronHabitData> } | Partial<IronHabitData>;
      const incoming: Partial<IronHabitData> = 'data' in parsed && parsed.data ? parsed.data : parsed as Partial<IronHabitData>;
      
      if (!incoming.profile && !incoming.bodyProfile && !incoming.checkIns && !incoming.fitnessEntries) {
        throw new Error('Invalid backup file: missing Iron Habit data');
      }

      const mergedData: IronHabitData = {
        ...defaultData,
        ...incoming,
        profile: { ...defaultData.profile, ...(incoming.profile || {}) },
        bodyProfile: { ...defaultData.bodyProfile, ...(incoming.bodyProfile || {}) },
        checkIns: incoming.checkIns || {},
        habits: incoming.habits || defaultData.habits,
        fitnessEntries: incoming.fitnessEntries || [],
        activeLoadout: incoming.activeLoadout || null,
        completedLoadouts: incoming.completedLoadouts || [],
        latestVictoryProof: incoming.latestVictoryProof || null,
      };
      
      replaceData(mergedData);
      setImportStatus('success');
      setTimeout(() => {
        setImportStatus('idle');
        window.location.reload();
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import backup';
      setImportError(message);
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearData = () => {
    resetData();
    setShowClearConfirm(false);
    window.location.reload();
  };

  return (
    <div className="page ih-page ih-real-settings warrior-page stack-lg">
      <BrandHeader step="SETUP" />

      <section className="ih-card ih-ai-card ih-real-settings-hero" aria-label="Iron Habit setup control room">
        <HelmetCoach small />
        <div>
          <small>SETUP CONTROL</small>
          <h1>Manage your Iron Habit data.</h1>
          <p>Profile, support chain, local backup, restore, and launch kit links — all kept on this device.</p>
        </div>
      </section>

      <div className="ih-stat-grid four ih-real-settings-stat-grid" aria-label="Setup state snapshot">
        <StatCard label="Profile" value={profile.name ? 'Ready' : 'Unset'} sub={profile.name || 'nickname'} tone={profile.name ? 'green' : 'red'} />
        <StatCard label="Support" value={supportReady ? 'Ready' : 'Missing'} sub={supportReady ? profile.supportName : 'safe person'} tone={supportReady ? 'green' : 'amber'} />
        <StatCard label="Backup" value={downloadStatus === 'success' ? 'Saved' : 'Local'} sub="device data" tone="blue" />
        <StatCard label="Beta" value="1.0" sub="tester ready" tone="red" />
      </div>

      <Card className="stack-sm settings-profile-card">
        <span className="tag danger-tag">Profile</span>
        <h2>Your sober-fitness baseline</h2>
        <p>
          Settings is the control room: review your saved profile, edit the baseline, then back up before any reset.
        </p>
        <div className="mission-brief-grid">
          <div><span>Name</span><strong>{profile.name || 'Not set'}</strong></div>
          <div><span>Sober start</span><strong>{profile.sobrietyDate || 'Not set'}</strong></div>
          <div><span>Support</span><strong>{supportReady ? profile.supportName : 'Missing'}</strong></div>
        </div>
        <div className="button-group stack-xs">
          <Link to="/setup-profile" className="btn btn-primary">Edit profile</Link>
          <Link to="/setup-profile?focus=support" className="btn btn-secondary">Edit support contact</Link>
        </div>
        <small>Your profile and support contact stay on this device. Export a backup before switching phones, clearing browser data, or resetting Iron Habit.</small>
      </Card>

      <Card className="stack-sm">
        <span className="tag">Backup</span>
        <h2>Save your progress</h2>
        <p>
          Export your sober dates, training logs, check-ins, and proof so you can restore them later or move to a new device.
        </p>
        <div className="button-group stack-xs">
          <button
            onClick={handleExportData}
            className="btn btn-primary"
            aria-label="Download backup as JSON file"
          >
            {downloadStatus === 'success' ? '✓ Download Ready' : 'Download Backup'}
          </button>
          <button
            onClick={handleCopyBackup}
            className="btn btn-secondary"
            aria-label="Copy backup JSON to clipboard"
          >
            {copyStatus === 'success' ? '✓ Copied to clipboard' : copyStatus === 'error' ? 'Copy failed' : 'Copy Backup to Clipboard'}
          </button>
        </div>
        <small>Keep your backup file safe. You will need it to restore your data.</small>
      </Card>

      <Card className="stack-sm">
        <span className="tag">Restore</span>
        <h2>Load a previous backup</h2>
        <p>
          Upload a backup JSON file to restore all your sober dates, training logs, check-ins, and proof.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          aria-label="Select backup file to restore"
        />
        <button onClick={handleImportClick} className="btn btn-primary" disabled={importStatus === 'loading'}>
          {importStatus === 'loading' ? '⏳ Restoring...' : importStatus === 'success' ? '✓ Restored' : 'Select Backup File'}
        </button>
        {importStatus === 'error' && <p style={{ color: 'var(--error, #ff4444)' }}>{importError}</p>}
        <small>
          Your backup will be merged with current app defaults to ensure compatibility. This will reload the app.
        </small>
      </Card>

      <Card className="stack-sm">
        <span className="tag">Advanced</span>
        <h2>Clear all data</h2>
        <p>
          Remove the local Iron Habit save and reload back to first-launch defaults. This action cannot be undone. A backup will be required to recover.
        </p>
        {!showClearConfirm ? (
          <button onClick={() => setShowClearConfirm(true)} className="btn btn-danger">
            Clear All Data
          </button>
        ) : (
          <div className="stack-xs">
            <p style={{ color: 'var(--error, #ff4444)', fontWeight: 600 }}>
              ⚠ Are you sure? This will delete all your progress.
            </p>
            <div className="button-group stack-xs">
              <button onClick={handleClearData} className="btn btn-danger">
                Yes, Clear Everything
              </button>
              <button onClick={() => setShowClearConfirm(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>

      <Card className="stack-sm">
        <span className="tag">About</span>
        <h2>Iron Habit</h2>
        <p>
          <strong>Version:</strong> 1.0 Beta
        </p>
        <p>
          <strong>Storage:</strong> All data is stored locally on your device using browser localStorage. We do not send your data to servers.
        </p>
        <p>
          <strong>Privacy:</strong> Your sober dates, training logs, and personal details stay on your device. Make sure to back up your data.
        </p>
        <div className="button-group stack-xs">
          <Link to="/launch-kit" className="btn btn-primary">Open tester launch kit</Link>
          <Link to="/share-progress#founder-launch-copy" className="btn btn-secondary">Founder launch copy</Link>
        </div>
      </Card>

      <style>{`
        .button-group {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .button-group .btn {
          flex: 1;
          min-width: 120px;
        }

        .button-group .btn-danger {
          color: #fff;
        }
      `}</style>
    </div>
  );
};

export default Settings;
