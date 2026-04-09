import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API } from '../App';

export default function OrganizationProfile({ user }) {
  const { id } = useParams();
  const [org, setOrg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

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
      setMessage('Please select a star rating');
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
      setMessage('Review submitted successfully!');
      setMessageType('success');
      setRating(0);
      setComment('');
      loadReviews();
      // Refresh org data for updated average
      fetch(`${API}/organizations/${id}`).then(r => r.json()).then(setOrg);
    } else {
      const data = await res.json();
      setMessage(data.message || 'Failed to submit review');
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

  if (!org) return <div className="py-20 text-center text-slate-500 font-medium">Loading organization...</div>;

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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Link */}
      <Link to="/organizations" className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-700 transition-colors font-medium">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        All Organizations
      </Link>

      {/* Hero Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 h-32"></div>
        <div className="px-8 pb-8 -mt-12">
          <div className="flex items-end gap-6 mb-6">
            {org.logoUrl ? (
              <img src={org.logoUrl} alt={org.name} className="w-24 h-24 rounded-xl object-cover border-4 border-white shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-3xl border-4 border-white shadow-lg">
                {org.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="pb-1">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{org.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <StarRating value={Math.round(org.averageRating)} size="w-5 h-5" />
                <span className="text-sm text-slate-500 font-medium">
                  {org.averageRating > 0 ? `${org.averageRating} / 5` : 'No ratings yet'}
                  {org.reviewCount > 0 && ` · ${org.reviewCount} review${org.reviewCount !== 1 ? 's' : ''}`}
                </span>
              </div>
            </div>
          </div>

          {org.description && (
            <p className="text-slate-600 leading-relaxed mb-6">{org.description}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm font-medium text-slate-800 truncate">{org.email}</p>
            </div>
            {org.phoneNumber && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                <p className="text-sm font-medium text-slate-800">{org.phoneNumber}</p>
              </div>
            )}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tasks Posted</p>
              <p className="text-sm font-medium text-slate-800">{org.taskCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      {org.tasks && org.tasks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {org.tasks.map(t => (
              <Link
                key={t.id}
                to={`/tasks/${t.id}`}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all hover:-translate-y-0.5 group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-1">{t.title}</h3>
                  <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded-full shrink-0 ml-2 ${
                    t.status === 'open' ? 'bg-emerald-100 text-emerald-800' :
                    t.status === 'closed' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {t.status}
                  </span>
                </div>
                {t.description && <p className="text-sm text-slate-600 line-clamp-2">{t.description}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Reviews</h2>

        {message && (
          <div className={`border-l-4 p-4 mb-6 rounded-r-md ${
            messageType === 'success' ? 'bg-emerald-50 border-emerald-500' : 'bg-red-50 border-red-500'
          }`}>
            <p className={`text-sm font-medium ${messageType === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>{message}</p>
          </div>
        )}

        {/* Submit Review Form */}
        {isStudent && !alreadyReviewed && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Leave a Review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Your Rating</label>
                <StarRating
                  interactive={true}
                  size="w-8 h-8"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Comment (Optional)</label>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows="3"
                  placeholder="Share your experience with this organization..."
                  className="w-full px-3 py-2 rounded-md border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
              <button
                onClick={handleSubmitReview}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Submit Review
              </button>
            </div>
          </div>
        )}

        {isStudent && alreadyReviewed && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span className="font-medium text-sm">You've already reviewed this organization.</span>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
            <p className="text-slate-500">No reviews yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {r.userPicture ? (
                      <img src={r.userPicture} alt={r.userName} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200">
                        {(r.userName || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{r.userName}</p>
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
                {r.comment && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
