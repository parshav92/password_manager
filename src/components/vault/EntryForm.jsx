// Entry form — add or edit a vault entry

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Plus, X, Wand2, Tag } from 'lucide-react';
import PasswordGenerator from '../tools/PasswordGenerator';
import { calculateStrength } from '../../utils/passwordStrength';
import { CATEGORIES } from '../../utils/constants';

export default function EntryForm({ entry, onSave, onCancel, loading }) {
  const isEdit = !!entry;

  const [form, setForm] = useState({
    title: '', username: '', password: '', url: '', notes: '',
    category: 'other', tags: [], customFields: [], isFavorite: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (entry) {
      setForm({
        title: entry.title || '', username: entry.username || '', password: entry.password || '',
        url: entry.url || '', notes: entry.notes || '', category: entry.category || 'other',
        tags: entry.tags || [], customFields: entry.customFields || [], isFavorite: entry.isFavorite || false,
      });
    }
  }, [entry]);

  const strength = calculateStrength(form.password);

  const strengthColor = {
    Weak: 'bg-bad', Fair: 'bg-warn', Good: 'bg-accent', Strong: 'bg-ok', None: 'bg-txt-tertiary',
  };

  const updateField = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: null }));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      updateField('tags', [...form.tags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag) => updateField('tags', form.tags.filter(t => t !== tag));

  const addCustomField = () => updateField('customFields', [...form.customFields, { key: '', value: '' }]);

  const updateCustomField = (index, field, value) => {
    const updated = [...form.customFields];
    updated[index] = { ...updated[index], [field]: value };
    updateField('customFields', updated);
  };

  const removeCustomField = (index) => updateField('customFields', form.customFields.filter((_, i) => i !== index));

  const handleGeneratedPassword = (pwd) => {
    updateField('password', pwd);
    setShowGenerator(false);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const cleanForm = {
      ...form,
      customFields: form.customFields.filter(cf => cf.key.trim() || cf.value.trim()),
    };
    await onSave(cleanForm);
  };

  const inputClass = "w-full py-2.5 px-3.5 text-sm text-txt bg-surface border border-border rounded-xl outline-none transition-[border-color,box-shadow] duration-150 focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-muted)] placeholder:text-txt-tertiary";

  return (
    <div className="h-full overflow-y-auto animate-fade-in">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border sticky top-0 bg-base/90 backdrop-blur-md z-10">
        <h2 className="text-base font-semibold text-txt tracking-[-0.03em]">{isEdit ? 'Edit entry' : 'New entry'}</h2>
        <button type="button" className="flex items-center justify-center w-9 h-9 rounded-lg border-none bg-transparent text-txt-tertiary cursor-pointer transition-colors duration-150 hover:bg-overlay hover:text-txt" onClick={onCancel} aria-label="Cancel">
          <X size={18} />
        </button>
      </div>

      <form className="px-5 py-6 flex flex-col gap-5 max-w-lg mx-auto" onSubmit={handleSubmit}>
        <FormField label="Title" required error={errors.title}>
          <input id="entry-title" type="text" className={`${inputClass} ${errors.title ? '!border-bad' : ''}`} placeholder="e.g. Google" value={form.title} onChange={(e) => updateField('title', e.target.value)} autoFocus autoComplete="off" />
        </FormField>

        {/* Category */}
        <FormField label="Category">
          <select id="entry-category" className={`${inputClass} cursor-pointer`} value={form.category} onChange={(e) => updateField('category', e.target.value)}>
            {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
          </select>
        </FormField>

        {/* Username */}
        <FormField label="Username / Email">
          <input id="entry-username" type="text" className={inputClass} placeholder="user@example.com" value={form.username} onChange={(e) => updateField('username', e.target.value)} autoComplete="off" />
        </FormField>

        {/* Password */}
        <FormField label="Password">
          <div className="relative flex items-center">
            <input
              id="entry-password"
              type={showPassword ? 'text' : 'password'}
              className={`${inputClass} pr-20`}
              placeholder="Enter or generate a password"
              value={form.password}
              onChange={(e) => updateField('password', e.target.value)}
              autoComplete="off"
            />
            <div className="absolute right-1.5 flex items-center gap-0.5">
              <button type="button" className="flex items-center justify-center w-7 h-7 rounded-md border-none bg-transparent text-txt-tertiary cursor-pointer transition-all duration-150 hover:text-txt hover:bg-overlay" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
              <button type="button" className="flex items-center justify-center w-7 h-7 rounded-md border-none bg-accent-muted text-accent cursor-pointer transition-all duration-150 hover:bg-accent-subtle" onClick={() => setShowGenerator(!showGenerator)} title="Generate password">
                <Wand2 size={15} />
              </button>
            </div>
          </div>

          {form.password && (
            <div className="flex items-center gap-2.5 mt-1.5">
              <div className="flex-1 h-1 rounded-full bg-surface overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-400 ${strengthColor[strength.label] || 'bg-txt-tertiary'}`} style={{ width: `${strength.score}%` }} />
              </div>
              <span className="text-[11px] font-semibold" style={{ color: strength.color }}>{strength.label}</span>
            </div>
          )}

          {showGenerator && (
            <PasswordGenerator onSelect={handleGeneratedPassword} onClose={() => setShowGenerator(false)} />
          )}
        </FormField>

        {/* URL */}
        <FormField label="Website URL">
          <input id="entry-url" type="text" className={inputClass} placeholder="https://example.com" value={form.url} onChange={(e) => updateField('url', e.target.value)} autoComplete="off" />
        </FormField>

        {/* Notes */}
        <FormField label="Notes">
          <textarea id="entry-notes" className={`${inputClass} resize-none min-h-[80px]`} placeholder="Additional notes..." value={form.notes} onChange={(e) => updateField('notes', e.target.value)} rows={3} />
        </FormField>

        {/* Tags */}
        <FormField label="Tags">
          <div className={`flex flex-wrap items-center gap-1.5 ${inputClass} !p-2`}>
            {form.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-accent bg-accent-muted rounded-md">
                <Tag size={10} />
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="flex items-center justify-center w-3.5 h-3.5 rounded-md border-none bg-transparent text-accent cursor-pointer hover:text-bad transition-colors" aria-label={`Remove ${tag}`}>
                  <X size={10} />
                </button>
              </span>
            ))}
            <input
              type="text"
              className="flex-1 min-w-[80px] py-0.5 bg-transparent border-none outline-none text-sm text-txt placeholder:text-txt-tertiary"
              placeholder={form.tags.length ? '' : 'Add tags...'}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addTag(); }
                if (e.key === 'Backspace' && !tagInput && form.tags.length) {
                  removeTag(form.tags[form.tags.length - 1]);
                }
              }}
              onBlur={addTag}
            />
          </div>
        </FormField>

        {/* Custom Fields */}
        <FormField label="Custom Fields" action={
          <button type="button" className="flex items-center gap-1 text-xs font-medium text-accent cursor-pointer bg-transparent border-none transition-colors hover:text-accent-hover" onClick={addCustomField}>
            <Plus size={13} /> Add
          </button>
        }>
          {form.customFields.length > 0 && (
            <div className="flex flex-col gap-2">
              {form.customFields.map((cf, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" className={`${inputClass} flex-1`} placeholder="Label" value={cf.key} onChange={(e) => updateCustomField(i, 'key', e.target.value)} />
                  <input type="text" className={`${inputClass} flex-1`} placeholder="Value" value={cf.value} onChange={(e) => updateCustomField(i, 'value', e.target.value)} />
                  <button type="button" className="flex items-center justify-center w-8 h-8 rounded-lg border-none bg-transparent text-txt-tertiary cursor-pointer transition-all duration-150 hover:text-bad hover:bg-bad-muted shrink-0" onClick={() => removeCustomField(i)}>
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </FormField>

        <div className="flex gap-3 pt-4 border-t border-border">
          <button type="button" className="flex-1 py-2.5 text-sm font-semibold text-txt-secondary bg-surface border border-border rounded-xl cursor-pointer transition-colors duration-150 hover:bg-overlay" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="flex-1 py-2.5 text-sm font-semibold text-white bg-accent rounded-xl cursor-pointer transition-colors duration-150 hover:bg-accent-hover active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed" disabled={loading}>
            {isEdit ? 'Save changes' : 'Add entry'}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, required, error, action, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-txt-tertiary uppercase tracking-wider">
          {label} {required && <span className="text-bad">*</span>}
        </label>
        {action}
      </div>
      {children}
      {error && <span className="text-xs text-bad">{error}</span>}
    </div>
  );
}
