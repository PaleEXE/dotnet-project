import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../App';
import { useI18n } from '../i18n/I18nContext';

export default function PostTask({ user }) {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maxVolunteers, setMaxVolunteers] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [error, setError] = useState('');
  const [dateError, setDateError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTags();
  }, []);

  // ── Date validation (frontend) ───────────────────────────────
  useEffect(() => {
    if (startDate && endDate && startDate >= endDate) {
      setDateError(t('postTask.dateError'));
    } else {
      setDateError('');
    }
  }, [startDate, endDate, t]);
  
  const fetchTags = () => {
    fetch(`${API}/tags`)
      .then(r => r.json())
      .then(setAvailableTags);
  };

  const handleCreateTag = async () => {
    if (!newTag.trim()) return;
    const res = await fetch(`${API}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTag.trim() })
    });
    if (res.ok) {
      setNewTag('');
      fetchTags();
    }
  };

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Block submission if dates are invalid
    if (dateError) return;

    setUploading(true);

    let finalImageUrl = '';

    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      const uploadRes = await fetch(`${API}/upload`, {
        method: 'POST',
        body: formData
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      } else {
        setError(t('postTask.uploadFailed'));
        setUploading(false);
        return;
      }
    }

    const body = {
      organizationId: user.id,
      title,
      description,
      maxVolunteers: maxVolunteers ? parseInt(maxVolunteers) : null,
      startDate: startDate || null,
      endDate: endDate || null,
      tagIds: selectedTags
    };

    const res = await fetch(`${API}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const task = await res.json();
      if (finalImageUrl.trim()) {
        await fetch(`${API}/tasks/${task.id}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: finalImageUrl.trim() })
        });
      }
      setUploading(false);
      navigate('/');
    } else {
      const data = await res.json();
      setError(data.message || t('postTask.createFailed'));
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{t('postTask.title')}</h1>
        <p className="text-slate-500 mt-2">{t('postTask.subtitle')}</p>
      </div>

      {error && (
         <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md error-banner">
           <p className="text-sm text-red-700 font-medium">{error}</p>
         </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('postTask.taskTitle')}</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required 
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-800"
              placeholder={t('postTask.titlePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('postTask.description')}</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              required 
              rows="5"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-800 resize-y"
              placeholder={t('postTask.descriptionPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('postTask.volunteersNeeded')}</label>
              <input 
                type="number" 
                min="1" 
                value={maxVolunteers} 
                onChange={e => setMaxVolunteers(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('postTask.startDate')}</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all text-slate-800 ${dateError ? 'date-error-field' : 'border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('postTask.endDate')}</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                min={startDate || undefined}
                className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all text-slate-800 ${dateError ? 'date-error-field' : 'border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'}`}
              />
            </div>
          </div>

          {/* Date validation error message */}
          {dateError && (
            <div className="flex items-center gap-2 text-red-600 text-sm font-medium error-banner animate-shake">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {dateError}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-semibold text-slate-700 mb-3">{t('postTask.tags')}</label>
            <div className="flex flex-wrap gap-3 mb-4">
              {availableTags.map(tag => (
                <label key={tag.id} className="inline-flex items-center cursor-pointer bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={selectedTags.includes(tag.id)} 
                    onChange={() => handleTagToggle(tag.id)} 
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 transition-none"
                  />
                  <span className="ml-2 text-sm text-slate-700 font-medium">{tag.name}</span>
                </label>
              ))}
            </div>
            
            <div className="flex gap-3 max-w-sm">
              <input 
                type="text" 
                placeholder={t('postTask.newTagPlaceholder')} 
                value={newTag} 
                onChange={e => setNewTag(e.target.value)} 
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm text-slate-800"
              />
              <button 
                type="button" 
                onClick={handleCreateTag}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm border border-slate-200"
              >
                {t('postTask.addTag')}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('postTask.coverImage')}</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={e => setImageFile(e.target.files[0])} 
              className="w-full text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            {imageFile && <p className="mt-2 text-xs text-emerald-600 font-medium pb-2">{t('postTask.selected')}: {imageFile.name}</p>}
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={uploading || !!dateError}
              className={`w-full md:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition-colors text-base ${(uploading || dateError) ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {uploading ? t('postTask.submitting') : t('postTask.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
