// Settings page

import { useState, useEffect } from 'react';
import {
  ArrowLeft, Moon, Sun, Monitor, Download, Upload, Trash2, Key, LogOut, Fingerprint,
} from 'lucide-react';
import { useToast } from '../ui/Toast';
import Modal from '../ui/Modal';
import { saveSettings } from '../../storage/settingsStore';
import { changeMasterPassword } from '../../auth/masterPassword';
import { clearAllData } from '../../storage/db';
import {
  isBiometricAvailable,
  enableBiometric,
  disableBiometric,
} from '../../auth/biometric';
import { exportEncrypted, exportCSV, importCSV, importEncrypted, downloadBlob } from '../../utils/importExport';
import { AUTO_LOCK_OPTIONS, CLIPBOARD_CLEAR_OPTIONS } from '../../utils/constants';

export default function SettingsPage({
  settings,
  cryptoKey,
  onUpdateSettings,
  onLock,
  onClose,
  biometricEnrolled,
  onBiometricEnrolledChange,
}) {
  const toast = useToast();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBiometricEnable, setShowBiometricEnable] = useState(false);
  const [biometricPassword, setBiometricPassword] = useState('');
  const [biometricError, setBiometricError] = useState('');
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [changePwdForm, setChangePwdForm] = useState({ current: '', new_: '', confirm: '' });
  const [changePwdError, setChangePwdError] = useState('');
  const [changePwdLoading, setChangePwdLoading] = useState(false);

  useEffect(() => {
    isBiometricAvailable().then(setBiometricSupported);
  }, []);

  const updateSetting = async (key, value) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    await saveSettings(updated, cryptoKey);
  };

  const handleExportEncrypted = async () => {
    const blob = await exportEncrypted(cryptoKey);
    downloadBlob(blob, `vaultsoft-backup-${new Date().toISOString().split('T')[0]}.vault`);
    toast.success('Encrypted backup exported');
  };

  const handleExportCSV = async () => {
    const blob = await exportCSV(cryptoKey);
    downloadBlob(blob, `vaultsoft-export-${new Date().toISOString().split('T')[0]}.csv`);
    toast.info('CSV exported (unencrypted!)');
  };

  const handleImport = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = type === 'csv' ? await importCSV(file, cryptoKey) : await importEncrypted(file, cryptoKey);
      toast.success(`Imported ${count} entries`);
      window.location.reload();
    } catch (err) {
      toast.error(`Import failed: ${err.message}`);
    }
    e.target.value = '';
  };

  const handleChangePassword = async () => {
    if (changePwdForm.new_ !== changePwdForm.confirm) {
      setChangePwdError('Passwords do not match');
      return;
    }
    if (changePwdForm.new_.length < 8) {
      setChangePwdError('New password must be at least 8 characters');
      return;
    }
    setChangePwdLoading(true);
    const newKey = await changeMasterPassword(changePwdForm.current, changePwdForm.new_);
    setChangePwdLoading(false);
    if (!newKey) {
      setChangePwdError('Current password is incorrect');
      return;
    }
    toast.success('Master password changed');
    setShowChangePassword(false);
    setChangePwdForm({ current: '', new_: '', confirm: '' });
    onBiometricEnrolledChange?.(false);
    onLock();
  };

  const handleDeleteAll = async () => {
    await clearAllData();
    toast.success('All data deleted');
    window.location.reload();
  };

  const handleToggleBiometric = async () => {
    if (biometricEnrolled) {
      setBiometricLoading(true);
      await disableBiometric();
      await updateSetting('biometricEnabled', false);
      onBiometricEnrolledChange?.(false);
      setBiometricLoading(false);
      toast.success('Biometric unlock disabled');
      return;
    }
    setBiometricPassword('');
    setBiometricError('');
    setShowBiometricEnable(true);
  };

  const handleEnableBiometric = async () => {
    if (!biometricPassword) {
      setBiometricError('Enter your master password');
      return;
    }
    setBiometricLoading(true);
    setBiometricError('');
    const result = await enableBiometric(biometricPassword);
    setBiometricLoading(false);
    if (!result.ok) {
      setBiometricError(result.error);
      return;
    }
    await updateSetting('biometricEnabled', true);
    onBiometricEnrolledChange?.(true);
    setShowBiometricEnable(false);
    setBiometricPassword('');
    toast.success('Biometric unlock enabled');
  };

  const themes = [
    { value: 'light', icon: <Sun size={15} />, label: 'Light' },
    { value: 'dark', icon: <Moon size={15} />, label: 'Dark' },
    { value: 'system', icon: <Monitor size={15} />, label: 'System' },
  ];

  const inputClass = "w-full py-2.5 px-3.5 text-sm text-txt bg-surface border border-border rounded-xl outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-muted)] placeholder:text-txt-tertiary";

  return (
    <div className="h-full overflow-y-auto animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border sticky top-0 bg-base/90 backdrop-blur-md z-10">
        <button type="button" className="flex items-center justify-center w-9 h-9 rounded-lg border-none bg-transparent text-txt-tertiary cursor-pointer transition-colors duration-150 hover:bg-overlay hover:text-txt" onClick={onClose} aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-base font-semibold text-txt tracking-[-0.03em]">Settings</h2>
      </div>

      <div className="px-5 py-6 flex flex-col gap-7 max-w-lg">
        <Section title="Appearance">
          <div className="flex gap-2">
            {themes.map(t => (
              <button
                type="button"
                key={t.value}
                className={`flex items-center justify-center gap-2 flex-1 py-2.5 px-3 text-sm font-medium rounded-xl border cursor-pointer transition-colors duration-150 ${settings.theme === t.value ? 'bg-accent-muted text-accent border-accent/25' : 'bg-surface text-txt-secondary border-border hover:bg-overlay'}`}
                onClick={() => updateSetting('theme', t.value)}
              >
                {t.icon} <span>{t.label}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section title="Security">
          <SettingRow label="Auto-lock">
            <select className="py-1.5 px-2.5 text-sm text-txt bg-input border border-transparent rounded-lg cursor-pointer outline-none focus:border-accent" value={settings.autoLockTimeout} onChange={(e) => updateSetting('autoLockTimeout', Number(e.target.value))}>
              {AUTO_LOCK_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </SettingRow>
          <SettingRow label="Clipboard clear">
            <select className="py-1.5 px-2.5 text-sm text-txt bg-input border border-transparent rounded-lg cursor-pointer outline-none focus:border-accent" value={settings.clipboardAutoClear} onChange={(e) => updateSetting('clipboardAutoClear', Number(e.target.value))}>
              {CLIPBOARD_CLEAR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </SettingRow>

          {biometricSupported && (
            <div className="flex items-center justify-between gap-4 px-3.5 py-3 bg-surface rounded-xl border border-border">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm text-txt">
                  <Fingerprint size={16} className="text-accent shrink-0" />
                  <span>Biometric unlock</span>
                </div>
                <p className="text-xs text-txt-tertiary mt-1 leading-snug">
                  {biometricEnrolled
                    ? 'Face ID / fingerprint can unlock this vault on this device'
                    : 'Requires Face ID, fingerprint, or device unlock with PRF support'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={biometricEnrolled}
                disabled={biometricLoading}
                onClick={handleToggleBiometric}
                className={`relative w-11 h-6 rounded-full border-none cursor-pointer transition-colors duration-150 shrink-0 disabled:opacity-40 ${biometricEnrolled ? 'bg-accent' : 'bg-border-strong'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-150 ${biometricEnrolled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          )}

          <ActionBtn icon={<Key size={16} />} label="Change master password" onClick={() => setShowChangePassword(true)} />
          <ActionBtn icon={<LogOut size={16} />} label="Lock vault now" onClick={onLock} />
        </Section>

        <Section title="Data">
          <ActionBtn icon={<Download size={16} />} label="Export encrypted backup" onClick={handleExportEncrypted} />
          <ActionBtn icon={<Download size={16} />} label="Export CSV (unencrypted)" onClick={handleExportCSV} />
          <label className="flex items-center gap-3 w-full px-3.5 py-3 text-sm text-txt-secondary bg-surface border border-border rounded-xl cursor-pointer transition-colors duration-150 hover:bg-overlay">
            <Upload size={16} /> <span>Import from CSV</span>
            <input type="file" accept=".csv" onChange={(e) => handleImport(e, 'csv')} hidden />
          </label>
          <label className="flex items-center gap-3 w-full px-3.5 py-3 text-sm text-txt-secondary bg-surface border border-border rounded-xl cursor-pointer transition-colors duration-150 hover:bg-overlay">
            <Upload size={16} /> <span>Import encrypted backup</span>
            <input type="file" accept=".vault,.json" onChange={(e) => handleImport(e, 'vault')} hidden />
          </label>
        </Section>

        <Section title="Danger zone" danger>
          <button
            type="button"
            className="flex items-center gap-3 w-full px-3.5 py-3 text-sm text-bad bg-transparent border border-bad/20 rounded-xl cursor-pointer transition-colors duration-150 hover:bg-bad-muted"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 size={16} /> <span>Delete all data</span>
          </button>
        </Section>
      </div>

      <Modal isOpen={showBiometricEnable} onClose={() => !biometricLoading && setShowBiometricEnable(false)} title="Enable biometric unlock" size="sm">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-txt-secondary leading-relaxed">
            Confirm your master password. Your vault key will be wrapped with this device&apos;s biometrics and never leave the device.
          </p>
          <input
            type="password"
            placeholder="Master password"
            value={biometricPassword}
            onChange={(e) => { setBiometricPassword(e.target.value); setBiometricError(''); }}
            className={inputClass}
            autoFocus
            disabled={biometricLoading}
          />
          {biometricError && <p className="text-sm text-bad">{biometricError}</p>}
          <button
            type="button"
            className="w-full py-2.5 text-sm font-semibold text-white bg-accent rounded-xl cursor-pointer transition-colors duration-150 hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleEnableBiometric}
            disabled={biometricLoading || !biometricPassword}
          >
            {biometricLoading ? 'Waiting for biometrics…' : 'Continue'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} title="Change Master Password" size="sm">
        <div className="flex flex-col gap-3">
          <input type="password" placeholder="Current password" value={changePwdForm.current}
            onChange={(e) => { setChangePwdForm(f => ({ ...f, current: e.target.value })); setChangePwdError(''); }}
            className={inputClass} />
          <input type="password" placeholder="New password" value={changePwdForm.new_}
            onChange={(e) => { setChangePwdForm(f => ({ ...f, new_: e.target.value })); setChangePwdError(''); }}
            className={inputClass} />
          <input type="password" placeholder="Confirm new password" value={changePwdForm.confirm}
            onChange={(e) => { setChangePwdForm(f => ({ ...f, confirm: e.target.value })); setChangePwdError(''); }}
            className={inputClass} />
          {changePwdError && <p className="text-sm text-bad">{changePwdError}</p>}
          <button type="button" className="w-full py-2.5 text-sm font-semibold text-white bg-accent rounded-xl cursor-pointer transition-all duration-200 hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed" onClick={handleChangePassword} disabled={changePwdLoading}>
            {changePwdLoading ? 'Changing...' : 'Change Password'}
          </button>
        </div>
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete All Data" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-bad leading-relaxed">
            This will permanently delete your vault, all saved passwords, and settings. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button type="button" className="flex-1 py-2.5 text-sm font-semibold text-txt-secondary bg-surface rounded-xl cursor-pointer transition-all duration-200 hover:bg-overlay" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            <button type="button" className="flex-1 py-2.5 text-sm font-semibold text-white bg-bad rounded-xl cursor-pointer transition-all duration-200 hover:opacity-90 active:scale-[0.98]" onClick={handleDeleteAll}>Delete Everything</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Section({ title, danger, children }) {
  return (
    <div className={`flex flex-col gap-2.5 ${danger ? 'pt-4 border-t border-bad/10' : ''}`}>
      <h3 className={`text-[11px] font-semibold uppercase tracking-wider ${danger ? 'text-bad' : 'text-txt-tertiary'}`}>{title}</h3>
      {children}
    </div>
  );
}

function SettingRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 px-3.5 py-3 bg-surface rounded-xl border border-border">
      <span className="text-sm text-txt">{label}</span>
      {children}
    </div>
  );
}

function ActionBtn({ icon, label, onClick }) {
  return (
    <button type="button" className="flex items-center gap-3 w-full px-3.5 py-3 text-sm text-txt-secondary bg-surface border border-border rounded-xl cursor-pointer transition-colors duration-150 hover:bg-overlay text-left" onClick={onClick}>
      {icon} <span>{label}</span>
    </button>
  );
}
