import { useState, useEffect } from 'react';
import LocationInput from '../../components/LocationInput';

const VendorShippingProfile = () => {
  const [profile, setProfile] = useState({
    pickupAddress: { street: '', city: '', postalCode: '', country: 'South Africa' },
    defaultDimensions: { length: 35, width: 25, height: 30, unit: 'cm' },
    defaultWeight: { value: 9, unit: 'kg' },
    shippingZones: [
      { name: 'Johannesburg', rate: 150 },
      { name: 'Cape Town', rate: 100 },
      { name: 'Durban', rate: 170 },
      { name: 'Pretoria', rate: 160 }
    ],
    freeDeliveryThreshold: 1500,
    handlingTimeDays: 2
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/vendor/shipping-profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Object.keys(data).length > 0) {
            setProfile(data);
          }
        }
      } catch (err) {
        console.error('Error fetching shipping profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e, section, field) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
    if (section) {
      setProfile({
        ...profile,
        [section]: { ...profile[section], [field]: value }
      });
    } else {
      setProfile({ ...profile, [field]: value });
    }
  };

  const handleZoneChange = (index, field, value) => {
    const updatedZones = [...profile.shippingZones];
    updatedZones[index][field] = field === 'rate' ? parseFloat(value) : value;
    setProfile({ ...profile, shippingZones: updatedZones });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/vendor/shipping-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shippingProfile: profile })
      });
      if (res.ok) {
        setMessage('Shipping profile updated successfully!');
      } else {
        setMessage('Failed to update shipping profile.');
      }
    } catch (err) {
      setMessage('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-gold">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-playfair font-bold text-gold mb-8">Shipping Profile</h1>
      <p className="text-white/60 mb-6">Configure your warehouse location, default packaging, and shipping rates.</p>

      {message && (
        <div className="bg-gold/20 text-gold p-4 mb-6 border border-gold/50 rounded">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* Pickup Address */}
        <div className="bg-black/40 border border-gold/30 p-6 rounded-lg">
          <h2 className="text-xl text-gold mb-4">Pickup Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 mb-1">Street Address</label>
              <LocationInput className="w-full bg-black border border-gold/30 rounded p-2 text-white focus:border-gold" 
                value={profile.pickupAddress.street || ''} 
                onChange={(e) => handleChange(e, 'pickupAddress', 'street')} 
                onPlaceDetails={({ city, postalCode, country }) => {
                  setProfile(prev => ({
                    ...prev,
                    pickupAddress: {
                      ...prev.pickupAddress,
                      city: city || prev.pickupAddress.city,
                      postalCode: postalCode || prev.pickupAddress.postalCode,
                      country: country || prev.pickupAddress.country
                    }
                  }));
                }}
                required placeholder="Start typing address..." />
            </div>
            <div>
              <label className="block text-white/70 mb-1">City</label>
              <input type="text" className="w-full bg-black border border-gold/30 rounded p-2 text-white focus:border-gold" 
                value={profile.pickupAddress.city || ''} onChange={(e) => handleChange(e, 'pickupAddress', 'city')} required />
            </div>
            <div>
              <label className="block text-white/70 mb-1">Postal Code</label>
              <input type="text" className="w-full bg-black border border-gold/30 rounded p-2 text-white focus:border-gold" 
                value={profile.pickupAddress.postalCode || ''} onChange={(e) => handleChange(e, 'pickupAddress', 'postalCode')} required />
            </div>
            <div>
              <label className="block text-white/70 mb-1">Country</label>
              <input type="text" className="w-full bg-black border border-gold/30 rounded p-2 text-white focus:border-gold" 
                value={profile.pickupAddress.country || 'South Africa'} onChange={(e) => handleChange(e, 'pickupAddress', 'country')} required />
            </div>
          </div>
        </div>

        {/* Packaging Defaults */}
        <div className="bg-black/40 border border-gold/30 p-6 rounded-lg">
          <h2 className="text-xl text-gold mb-4">Default Packaging (e.g. 6-bottle box)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-white/70 mb-1">Length ({profile.defaultDimensions.unit})</label>
              <input type="number" className="w-full bg-black border border-gold/30 rounded p-2 text-white focus:border-gold" 
                value={profile.defaultDimensions.length || 0} onChange={(e) => handleChange(e, 'defaultDimensions', 'length')} />
            </div>
            <div>
              <label className="block text-white/70 mb-1">Width ({profile.defaultDimensions.unit})</label>
              <input type="number" className="w-full bg-black border border-gold/30 rounded p-2 text-white focus:border-gold" 
                value={profile.defaultDimensions.width || 0} onChange={(e) => handleChange(e, 'defaultDimensions', 'width')} />
            </div>
            <div>
              <label className="block text-white/70 mb-1">Height ({profile.defaultDimensions.unit})</label>
              <input type="number" className="w-full bg-black border border-gold/30 rounded p-2 text-white focus:border-gold" 
                value={profile.defaultDimensions.height || 0} onChange={(e) => handleChange(e, 'defaultDimensions', 'height')} />
            </div>
            <div>
              <label className="block text-white/70 mb-1">Weight ({profile.defaultWeight.unit})</label>
              <input type="number" className="w-full bg-black border border-gold/30 rounded p-2 text-white focus:border-gold" 
                value={profile.defaultWeight.value || 0} onChange={(e) => handleChange(e, 'defaultWeight', 'value')} />
            </div>
          </div>
        </div>

        {/* Shipping Rates */}
        <div className="bg-black/40 border border-gold/30 p-6 rounded-lg">
          <h2 className="text-xl text-gold mb-4">Domestic Shipping Zones</h2>
          <p className="text-white/60 mb-4 text-sm">Set your flat rates for domestic shipping. The system will match the customer's city to these zones.</p>
          
          <div className="space-y-4">
            {profile.shippingZones.map((zone, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-white/70 mb-1">Zone Name / City</label>
                  <input type="text" className="w-full bg-black border border-gold/30 rounded p-2 text-white focus:border-gold" 
                    value={zone.name} onChange={(e) => handleZoneChange(index, 'name', e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="block text-white/70 mb-1">Flat Rate (R)</label>
                  <input type="number" className="w-full bg-black border border-gold/30 rounded p-2 text-white focus:border-gold" 
                    value={zone.rate} onChange={(e) => handleZoneChange(index, 'rate', e.target.value)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-black/40 border border-gold/30 p-6 rounded-lg">
          <h2 className="text-xl text-gold mb-4">Shipping Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/70 mb-1">Free Delivery Threshold (R)</label>
              <p className="text-white/40 text-xs mb-2">Leave blank or 0 for no free delivery</p>
              <input type="number" className="w-full bg-black border border-gold/30 rounded p-2 text-white focus:border-gold" 
                value={profile.freeDeliveryThreshold || ''} onChange={(e) => handleChange(e, null, 'freeDeliveryThreshold')} />
            </div>
            <div>
              <label className="block text-white/70 mb-1">Handling Time (Days)</label>
              <p className="text-white/40 text-xs mb-2">Days before package is handed to courier</p>
              <input type="number" className="w-full bg-black border border-gold/30 rounded p-2 text-white focus:border-gold" 
                value={profile.handlingTimeDays || 0} onChange={(e) => handleChange(e, null, 'handlingTimeDays')} />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="bg-gold text-black px-8 py-3 rounded font-bold uppercase tracking-wider hover:bg-yellow-600 transition-colors"
        >
          {saving ? 'Saving...' : 'Save Shipping Profile'}
        </button>
      </form>
    </div>
  );
};

export default VendorShippingProfile;
