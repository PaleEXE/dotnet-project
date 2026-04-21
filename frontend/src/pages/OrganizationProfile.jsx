import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API } from '../App';
import { useI18n } from '../i18n/I18nContext';
import ProfileAvatar from '../components/ProfileAvatar';

export default function OrganizationProfile({ user }) {
  const { t } = useI18n();
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLogoFile, setEditLogoFile] = useState(null);
  const [editBannerFile, setEditBannerFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`${API}/organizations/${id}`).then(r => r.json()).then(setOrg);
    loadReviews();
  }, [id]);

  const loadReviews = () => {
    fetch(`${API}/reviews/organization/${id}`).then(r => r.json()).then(setReviews);
  };

  const handleSubmitReview = async () => {
    setMessage('');
    if (rating === 0) {
      setMessage(t('orgProfile.yourRating'));
      setMessageType('error');
      return;
    }

    const res = await fetch(`${API}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organizationId: parseInt(id),
        userId: user.id,
        rating,
        comment: comment.trim() || null,
      }),
    });

    if (res.ok) {
      setMessage(t('orgProfile.reviewSubmitted'));
      setMessageType('success');
      setRating(0);
      setComment('');
      loadReviews();
      // Refresh org data for updated average
      fetch(`${API}/organizations/${id}`).then(r => r.json()).then(setOrg);
    } else {
      const data = await res.json();
      setMessage(data.message || t('orgProfile.reviewFailed'));
      setMessageType('error');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const res = await fetch(`${API}/reviews/${reviewId}`, { method: 'DELETE' });
    if (res.ok) {
      setMessage('Review deleted.');
      setMessageType('success');
      loadReviews();
      fetch(`${API}/organizations/${id}`).then(r => r.json()).then(setOrg);
    }
  };

  const startEditing = () => {
    setEditName(org.name || '');
    setEditDescription(org.description || '');
    setEditPhone(org.phoneNumber || '');
    setEditLogoFile(null);
    setEditBannerFile(null);
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    let finalLogoUrl = org.logoUrl;
    let finalBannerUrl = org.bannerUrl;

    try {
      if (editLogoFile) {
        const fd = new FormData();
        fd.append('file', editLogoFile);
        const r = await fetch(`${API}/upload`, { method: 'POST', body: fd });
        if (r.ok) { const d = await r.json(); finalLogoUrl = d.url; }
      }
      if (editBannerFile) {
        const fd = new FormData();
        fd.append('file', editBannerFile);
        const r = await fetch(`${API}/upload`, { method: 'POST', body: fd });
        if (r.ok) { const d = await r.json(); finalBannerUrl = d.url; }
      }

      const payload = {
        name: editName,
        description: editDescription,
        phoneNumber: editPhone,
        logoUrl: finalLogoUrl,
        bannerUrl: finalBannerUrl
      };

      const res = await fetch(`${API}/organizations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        // keep nested properties (Tasks/Reviews) and just update the top level fields
        setOrg(prev => ({ ...prev, ...updated }));
        setIsEditing(false);
      } else {
        setMessage('Failed to save profile updates.');
        setMessageType('error');
      }
    } catch (e) {
      setMessage('Error saving profile.');
      setMessageType('error');
    }
    setIsSaving(false);
  };

  if (!org) return <div className="py-20 text-center text-earth font-medium">{t('orgProfile.loading')}</div>;

  const isStudent = user.role === 'student' || user.role === 'admin';
  const alreadyReviewed = reviews.some(r => r.userId === user.id);

  const StarRating = ({ value, interactive = false, size = 'w-5 h-5' }) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg
          key={i}
          className={`${size} ${interactive ? 'cursor-pointer' : ''} transition-colors ${
            i <= (interactive ? (hoverRating || rating) : value) ? 'text-amber-400' : 'text-slate-300'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          onClick={() => interactive && setRating(i)}
          onMouseEnter={() => interactive && setHoverRating(i)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-10">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <Link to="/organizations" className="inline-flex items-center text-sm text-earth hover:text-sage-hover transition-colors font-medium">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          {t('organizations.title')}
        </Link>
        {user.role === 'organization' && user.id === parseInt(id) && !isEditing && (
          <button onClick={startEditing} className="px-4 py-1.5 text-sm bg-sand/30 hover:bg-sand/60 text-earth font-bold rounded-xl transition-colors">
            Edit Profile
          </button>
        )}
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-sand overflow-hidden">
        {org.bannerUrl ? (
          <div className="h-40 w-full overflow-hidden">
            <img src={org.bannerUrl} alt="Organization Banner" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="bg-gradient-to-r from-sage-600 to-sage-700 h-32"></div>
        )}
        <div className="px-8 pb-8 -mt-12">
          <div className="flex items-end gap-6 mb-6">
            <div className="border-4 border-white rounded-2xl shadow-lg overflow-hidden shrink-0">
              <ProfileAvatar
                src={org.logoUrl}
                name={org.name}
                size="xl"
                clickable={!!org.logoUrl}
                className="!rounded-none"
                borderColor="border-transparent"
              />
            </div>
            <div className="pb-1 max-w-[65%]">
              {isEditing ? (
                <input 
                  type="text" 
                  value={editName} 
                  onChange={e => setEditName(e.target.value)}
                  className="w-full text-2xl font-bold border-b border-sand focus:border-sage outline-none mb-2"
                  placeholder="Organization Name"
                />
              ) : (
                <h1 className="text-3xl font-bold text-ink tracking-tight">{org.name}</h1>
              )}
              <div className="flex items-center gap-3 mt-2">
                <StarRating value={Math.round(org.averageRating)} size="w-5 h-5" />
                <span className="text-sm text-earth font-medium">
                  {org.averageRating > 0 ? `${org.averageRating} / 5` : t('organizations.noRatings')}
                  {org.reviewCount > 0 && ` · ${org.reviewCount} review${org.reviewCount !== 1 ? 's' : ''}`}
                </span>
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="mb-6 space-y-4 bg-offwhite p-6 rounded-2xl border border-sand">
              <h3 className="font-bold text-ink mb-2">Edit Details</h3>
              <div>
                <label className="block text-sm font-semibold text-earth mb-1">Description</label>
                <textarea 
                  value={editDescription} 
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sand focus:ring-2 focus:ring-sage outline-none text-sm text-ink"
                  rows="3"
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-earth mb-1">Phone Number</label>
                <input 
                  type="text" 
                  value={editPhone} 
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sand focus:ring-2 focus:ring-sage outline-none text-sm text-ink"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-earth mb-1">Upload New Logo (Image)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setEditLogoFile(e.target.files[0])}
                  className="text-sm text-earth cursor-pointer file:mr-3 file:py-1 file:px-3 file:border-0 file:rounded-xl file:bg-sand/30 file:text-ink hover:file:bg-sand"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-earth mb-1">Upload New Banner (Image)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setEditBannerFile(e.target.files[0])}
                  className="text-sm text-earth cursor-pointer file:mr-3 file:py-1 file:px-3 file:border-0 file:rounded-xl file:bg-sand/30 file:text-ink hover:file:bg-sand"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button onClick={handleSaveProfile} disabled={isSaving} className="px-6 py-2 bg-sage hover:bg-sage-hover text-white font-bold rounded-xl transition-colors">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setIsEditing(false)} disabled={isSaving} className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-ink font-bold rounded-xl transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            org.description && (
              <p className="text-earth leading-relaxed mb-6">{org.description}</p>
            )
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-offwhite rounded-2xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-earth uppercase tracking-wider mb-1">{t('orgProfile.email')}</p>
              <p className="text-sm font-medium text-ink truncate">{org.email}</p>
            </div>
            {org.phoneNumber && (
              <div className="bg-offwhite rounded-2xl p-4 border border-slate-100">
                <p className="text-xs font-semibold text-earth uppercase tracking-wider mb-1">{t('orgProfile.phone')}</p>
                <p className="text-sm font-medium text-ink">{org.phoneNumber}</p>
              </div>
            )}
            <div className="bg-offwhite rounded-2xl p-4 border border-slate-100">
              <p className="text-xs font-semibold text-earth uppercase tracking-wider mb-1">{t('orgProfile.tasks')}</p>
              <p className="text-sm font-medium text-ink">{org.taskCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      {org.tasks && org.tasks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-ink mb-4">{t('orgProfile.tasks')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
            {org.tasks.map(task => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="bg-white rounded-2xl shadow-sm border border-sand p-5 card-hover group animate-fade-in"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-ink group-hover:text-sage-700 transition-colors line-clamp-1">{task.title}</h3>
                  <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded-full shrink-0 ml-2 ${
                    task.status === 'open' ? 'bg-sage-100 text-sage-800' :
                    task.status === 'closed' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
                {task.description && <p className="text-sm text-earth line-clamp-2">{task.description}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-bold text-ink mb-6">{t('orgProfile.reviews')}</h2>

        {message && (
          <div className={`border-l-4 p-4 mb-6 rounded-r-md animate-slide-up ${
            messageType === 'success' ? 'bg-sage-50 border-sage-500' : 'bg-red-50 border-red-500'
          }`}>
            <p className={`text-sm font-medium ${messageType === 'success' ? 'text-sage-700' : 'text-red-700'}`}>{message}</p>
          </div>
        )}

        {/* Submit Review Form */}
        {isStudent && !alreadyReviewed && (
          <div className="bg-white rounded-2xl shadow-sm border border-sand p-6 mb-6">
            <h3 className="text-lg font-bold text-ink mb-4">{t('orgProfile.writeReview')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">{t('orgProfile.yourRating')}</label>
                <StarRating
                  interactive={true}
                  size="w-8 h-8"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1">{t('orgProfile.comment')}</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows="3"
                  placeholder={t('orgProfile.commentPlaceholder')}
                  className="w-full px-3 py-2 rounded-2xl border border-sand focus:ring-2 focus:ring-sage-500 focus:border-sage-500 text-sm"
                />
              </div>
              <button
                onClick={handleSubmitReview}
                className="px-6 py-2.5 bg-sage hover:bg-sage-hover text-white font-semibold rounded-2xl transition-colors text-sm"
              >
                {t('orgProfile.submitReview')}
              </button>
            </div>
          </div>
        )}

        {isStudent && alreadyReviewed && (
          <div className="bg-sage-50 border border-sage-200 text-sage-800 p-4 rounded-2xl mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-sage-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="font-medium text-sm">You've already reviewed this organization.</span>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-sand p-8 text-center">
            <p className="text-earth">{t('orgProfile.noReviews')}</p>
          </div>
        ) : (
          <div className="space-y-4 stagger-children">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-sand p-5 animate-fade-in">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar
                      src={r.userPicture}
                      name={r.userName || '?'}
                      size="sm"
                    />
                    <div>
                      <p className="font-semibold text-ink text-sm">{r.userName}</p>
                      <p className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StarRating value={r.rating} size="w-4 h-4" />
                    {r.userId === user.id && (
                      <button
                        onClick={() => handleDeleteReview(r.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete review"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    )}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-earth mt-2 leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
