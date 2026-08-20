import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Globe, MapPin, Wine, Utensils, Bed, Star, Eye, EyeOff,
  Plus, Trash2, Save, CheckCircle, ChevronDown, ChevronUp, ExternalLink, Copy
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const token = () => JSON.parse(localStorage.getItem('userInfo'))?.token;
const headers = () => ({ Authorization: `Bearer ${token()}` });

const Section = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 bg-white/5 hover:bg-white/10 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-amber-400" />
          <span className="font-semibold text-white">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-white/50" /> : <ChevronDown size={16} className="text-white/50" />}
      </button>
      {open && <div className="px-6 py-5 bg-white/[0.03] space-y-4">{children}</div>}
    </div>
  );
};

const Input = ({ label, value, onChange, placeholder, type = 'text', textarea = false }) => (
  <div>
    <label className="block text-xs text-white/50 uppercase tracking-widest mb-1">{label}</label>
    {textarea
      ? <textarea rows={4} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-400/60 resize-none" />
      : <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-amber-400/60" />}
  </div>
);

const Toggle = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-white/70">{label}</span>
    <button onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors ${value ? 'bg-amber-500' : 'bg-white/20'}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${value ? 'left-7' : 'left-1'}`} />
    </button>
  </div>
);

const ExperienceEditor = ({ items = [], onChange, label }) => {
  const add = () => onChange([...items, { name: '', description: '', price: '', duration: '', capacity: '', isAvailable: true }]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i, field, val) => onChange(items.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase text-white/50 tracking-widest">{label}</span>
        <button onClick={add} className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors">
          <Plus size={12} /> Add
        </button>
      </div>
      {items.map((exp, i) => (
        <div key={i} className="bg-white/5 rounded-lg p-4 mb-3 relative">
          <button onClick={() => remove(i)} className="absolute top-3 right-3 text-red-400/60 hover:text-red-400">
            <Trash2 size={14} />
          </button>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" value={exp.name} onChange={v => update(i, 'name', v)} placeholder="e.g. Classic Tasting" />
            <Input label="Price (R)" value={exp.price} onChange={v => update(i, 'price', v)} type="number" />
            <Input label="Duration" value={exp.duration} onChange={v => update(i, 'duration', v)} placeholder="e.g. 60 minutes" />
            <Input label="Max Guests" value={exp.capacity} onChange={v => update(i, 'capacity', v)} type="number" />
          </div>
          <div className="mt-3">
            <Input label="Description" value={exp.description} onChange={v => update(i, 'description', v)} textarea placeholder="Describe this experience..." />
          </div>
        </div>
      ))}
    </div>
  );
};

export default function EstateBuilder() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const notify = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    axios.get(`${API}/api/estates/vendor/my-profile`, { headers: headers() })
      .then(res => setProfile(res.data || {}))
      .catch(() => setProfile({}))
      .finally(() => setLoading(false));
  }, []);

  const set = (path, value) => {
    setProfile(prev => {
      const keys = path.split('.');
      const updated = { ...prev };
      let cur = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...(cur[keys[i]] || {}) };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await axios.post(`${API}/api/estates/vendor/my-profile`, profile, { headers: headers() });
      setProfile(res.data.estate);
      notify('Estate profile saved!');
    } catch (err) {
      notify(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    try {
      const res = await axios.patch(`${API}/api/estates/vendor/my-profile/publish`, {}, { headers: headers() });
      setProfile(prev => ({ ...prev, isPublished: res.data.isPublished }));
      notify(res.data.message);
    } catch (err) {
      notify(err.response?.data?.message || 'Error toggling publish', 'error');
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const p = profile || {};

  return (
    <div className="max-w-3xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Your Estate Profile</h1>
          <p className="text-white/50 text-sm">Build your digital home on Grand Store</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${p.isPublished ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50'}`}>
            {p.isPublished ? <><Eye size={12} /> Published</> : <><EyeOff size={12} /> Draft</>}
          </div>
          <button onClick={togglePublish}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${p.isPublished ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-green-500 text-white hover:bg-green-600'}`}>
            {p.isPublished ? 'Unpublish' : 'Publish'}
          </button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition-colors disabled:opacity-50">
            <Save size={15} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      {/* ── Live Estate URL Banner ─────────────── */}
      {p.slug && (
        <div className={`mb-6 rounded-xl px-5 py-4 flex items-center justify-between gap-4 ${
          p.isPublished
            ? 'bg-green-500/10 border border-green-500/30'
            : 'bg-white/5 border border-white/10'
        }`}>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-1">
              {p.isPublished ? '🟢 Your estate is live at' : '⚪ Estate URL (publish to go live)'}
            </p>
            <p className="text-sm text-amber-400 font-mono break-all">
              {import.meta.env.VITE_APP_URL}/estate/{p.slug}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${import.meta.env.VITE_APP_URL}/estate/${p.slug}`);
                notify('Link copied!');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs rounded-lg transition-colors"
            >
              <Copy size={12} /> Copy
            </button>
            {p.isPublished && (
              <a
                href={`/estate/${p.slug}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg transition-colors"
              >
                <ExternalLink size={12} /> View Estate
              </a>
            )}
          </div>
        </div>
      )}

      <Section title="Core Details" icon={Globe} defaultOpen>
        <Input label="Estate Name *" value={p.estateName} onChange={v => set('estateName', v)} placeholder="ABC Wine Estate" />
        <Input label="Tagline" value={p.tagline} onChange={v => set('tagline', v)} placeholder="Where tradition meets innovation" />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Region" value={p.region} onChange={v => set('region', v)} placeholder="Stellenbosch" />
          <Input label="Country" value={p.country} onChange={v => set('country', v)} placeholder="South Africa" />
        </div>
        <Input label="Hero Image URL" value={p.heroImageUrl} onChange={v => set('heroImageUrl', v)} placeholder="https://..." />
      </Section>

      {/* ── Our Story ─────────────────────────── */}
      <Section title="Our Story" icon={Star}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Founded Year" value={p.story?.foundedYear} onChange={v => set('story.foundedYear', v)} type="number" />
          <Input label="Founders" value={p.story?.founders} onChange={v => set('story.founders', v)} placeholder="John & Jane Smith" />
        </div>
        <Input label="History" value={p.story?.history} onChange={v => set('story.history', v)} textarea placeholder="Tell the story of your estate..." />
        <Input label="Winemaker Name" value={p.story?.winemaker} onChange={v => set('story.winemaker', v)} placeholder="James Smith" />
        <Input label="Winemaker Bio" value={p.story?.winemakerBio} onChange={v => set('story.winemakerBio', v)} textarea placeholder="The winemaker's journey..." />
        <Input label="Philosophy" value={p.story?.philosophy} onChange={v => set('story.philosophy', v)} textarea placeholder="Our approach to winemaking..." />
      </Section>

      {/* ── Vineyard ──────────────────────────── */}
      <Section title="Vineyard" icon={MapPin}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Altitude" value={p.vineyard?.altitude} onChange={v => set('vineyard.altitude', v)} placeholder="350m above sea level" />
          <Input label="Soil" value={p.vineyard?.soil} onChange={v => set('vineyard.soil', v)} placeholder="Decomposed granite" />
          <Input label="Climate" value={p.vineyard?.climate} onChange={v => set('vineyard.climate', v)} placeholder="Mediterranean" />
          <Input label="Viticulture" value={p.vineyard?.viticulture} onChange={v => set('vineyard.viticulture', v)} placeholder="Organic / Biodynamic" />
        </div>
        <Input label="Sustainability Notes" value={p.vineyard?.sustainability} onChange={v => set('vineyard.sustainability', v)} textarea placeholder="Our sustainable farming practices..." />
      </Section>

      {/* ── Wine Tastings ─────────────────────── */}
      <Section title="Wine Tastings" icon={Wine}>
        <Toggle label="We offer wine tastings" value={p.hospitality?.hasTastings} onChange={v => set('hospitality.hasTastings', v)} />
        {p.hospitality?.hasTastings && (
          <ExperienceEditor
            label="Tasting Packages"
            items={p.hospitality?.tastings || []}
            onChange={v => set('hospitality.tastings', v)}
          />
        )}
      </Section>

      {/* ── Restaurant ────────────────────────── */}
      <Section title="Restaurant" icon={Utensils}>
        <Toggle label="We have a restaurant" value={p.hospitality?.hasRestaurant} onChange={v => set('hospitality.hasRestaurant', v)} />
        {p.hospitality?.hasRestaurant && (
          <>
            <Input label="Restaurant Name" value={p.hospitality?.restaurant?.name} onChange={v => set('hospitality.restaurant.name', v)} placeholder="The Cellar Restaurant" />
            <Input label="Description" value={p.hospitality?.restaurant?.description} onChange={v => set('hospitality.restaurant.description', v)} textarea placeholder="What makes dining here special..." />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Opening Hours" value={p.hospitality?.restaurant?.openingHours} onChange={v => set('hospitality.restaurant.openingHours', v)} placeholder="Wed–Sun 12:00–15:00" />
              <Input label="Phone" value={p.hospitality?.restaurant?.phoneNumber} onChange={v => set('hospitality.restaurant.phoneNumber', v)} placeholder="+27 21 000 0000" />
            </div>
          </>
        )}
      </Section>

      {/* ── Accommodation ─────────────────────── */}
      <Section title="Accommodation" icon={Bed}>
        <Toggle label="We offer accommodation" value={p.hospitality?.hasAccommodation} onChange={v => set('hospitality.hasAccommodation', v)} />
        {p.hospitality?.hasAccommodation && (
          <>
            <Input label="Description" value={p.hospitality?.accommodation?.description} onChange={v => set('hospitality.accommodation.description', v)} textarea placeholder="Describe your accommodation..." />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Price From (R/night)" value={p.hospitality?.accommodation?.priceFrom} onChange={v => set('hospitality.accommodation.priceFrom', v)} type="number" />
              <Input label="Booking Email" value={p.hospitality?.accommodation?.bookingEmail} onChange={v => set('hospitality.accommodation.bookingEmail', v)} placeholder="stay@myfarm.co.za" />
            </div>
          </>
        )}
      </Section>

      {/* ── Other Experiences ─────────────────── */}
      <Section title="Other Experiences" icon={Star}>
        <ExperienceEditor
          label="Experiences (vineyard tours, harvests, etc.)"
          items={p.hospitality?.experiences || []}
          onChange={v => set('hospitality.experiences', v)}
        />
      </Section>

      {/* ── Contact ───────────────────────────── */}
      <Section title="Contact & Social" icon={Globe}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Email" value={p.contact?.email} onChange={v => set('contact.email', v)} placeholder="info@myestate.co.za" />
          <Input label="Phone" value={p.contact?.phone} onChange={v => set('contact.phone', v)} placeholder="+27 21 000 0000" />
          <Input label="Website" value={p.contact?.website} onChange={v => set('contact.website', v)} placeholder="https://myestate.co.za" />
          <Input label="Instagram" value={p.contact?.instagram} onChange={v => set('contact.instagram', v)} placeholder="@myestate" />
        </div>
        <Input label="Physical Address" value={p.contact?.address} onChange={v => set('contact.address', v)} placeholder="1 Farm Road, Stellenbosch, 7600" />
        <Input label="Google Maps Link" value={p.contact?.mapLink} onChange={v => set('contact.mapLink', v)} placeholder="https://maps.google.com/..." />
      </Section>

      {/* Save button at bottom */}
      <div className="flex justify-end pt-4 pb-12">
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-colors disabled:opacity-50">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Estate Profile'}
        </button>
      </div>
    </div>
  );
}
