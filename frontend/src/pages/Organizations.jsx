import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../App';
import { useI18n } from '../i18n/I18nContext';
import ProfileAvatar from '../components/ProfileAvatar';

export default function Organizations() {
  const { t } = useI18n();
  const [orgs, setOrgs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API}/organizations`)
      .then(r => r.json())
      .then(setOrgs);
  }, []);

  const filtered = orgs.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const StarDisplay = ({ rating, size = 'text-sm' }) => (
    <div className={`flex items-center gap-0.5 ${size}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-amber-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink tracking-tight">{t('organizations.title')}</h1>
        <p className="text-earth mt-2">{t('organizations.subtitle')}</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            type="text"
            placeholder={t('organizations.searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-sand focus:ring-2 focus:ring-sage-500 focus:border-sage-500 text-sm bg-white"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-sand p-12 text-center">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          <p className="text-earth text-lg">{t('organizations.noOrgs')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {filtered.map(org => (
            <Link
              key={org.id}
              to={`/organizations/${org.id}`}
              className="bg-white rounded-2xl shadow-sm border border-sand overflow-hidden card-hover group animate-fade-in"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <ProfileAvatar
                    src={org.logoUrl}
                    name={org.name}
                    size="lg"
                    clickable={false}
                    className="!rounded-2xl"
                  />
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-ink group-hover:text-sage-700 transition-colors truncate">{org.name}</h3>
                    <p className="text-sm text-earth truncate">{org.email}</p>
                  </div>
                </div>

                {org.description && (
                  <p className="text-sm text-earth mb-4 line-clamp-2">{org.description}</p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <StarDisplay rating={org.averageRating} />
                    <span className="text-xs text-earth ml-1">
                      {org.averageRating > 0 ? `${org.averageRating}` : t('organizations.noRatings')}
                      {org.reviewCount > 0 && ` (${org.reviewCount})`}
                    </span>
                  </div>
                  <span className="text-xs text-earth bg-slate-100 px-2 py-1 rounded-full font-medium">
                    {org.taskCount} {org.taskCount === 1 ? t('organizations.task') : t('organizations.tasks')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
