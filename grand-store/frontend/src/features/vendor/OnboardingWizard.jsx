import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useGeoLocation } from '../../context/LocationContext';
import { CheckCircle2, ChevronRight, UploadCloud, Building2, User, FileText, BadgeCheck, FileSpreadsheet, Landmark, Package, Truck, FileSignature, Globe, Image as ImageIcon } from 'lucide-react';
import LocationInput from '../../components/LocationInput';

export default function OnboardingWizard() {
  const { user } = useAuth();
  const { country_code } = useGeoLocation();
  const navigate = useNavigate();
  
  const isLocal = country_code === 'ZA';

  const steps = useMemo(() => {
    if (isLocal) {
      return [
        { id: 1, title: 'Account', icon: User },
        { id: 2, title: 'Business', icon: Building2 },
        { id: 3, title: 'KYC', icon: FileText },
        { id: 4, title: 'Tax', icon: FileSpreadsheet },
        { id: 5, title: 'Licence', icon: BadgeCheck },
        { id: 6, title: 'Customs', icon: Truck },
        { id: 7, title: 'Banking', icon: Landmark },
        { id: 8, title: 'Products', icon: Package },
        { id: 9, title: 'Delivery', icon: Truck },
        { id: 10, title: 'Agreement', icon: FileSignature }
      ];
    } else {
      return [
        { id: 1, title: 'Account', icon: User },
        { id: 2, title: 'Business', icon: Building2 },
        { id: 3, title: 'Credentials', icon: BadgeCheck },
        { id: 4, title: 'Market', icon: Globe },
        { id: 5, title: 'Logistics', icon: Truck },
        { id: 6, title: 'Story', icon: ImageIcon },
        { id: 7, title: 'Banking', icon: Landmark },
        { id: 8, title: 'Products', icon: Package },
        { id: 9, title: 'Agreement', icon: FileSignature }
      ];
    }
  }, [isLocal]);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State for each step
  const [accountInfo, setAccountInfo] = useState({ name: '', email: '', password: '' });
  const [businessInfo, setBusinessInfo] = useState({ legalName: '', tradingName: '', registrationNumber: '', businessType: '', address: '' });
  const [kycInfo, setKycInfo] = useState({ directorName: '', idNumber: '', contactNumber: '', idDocumentUrl: '' });
  const [taxInfo, setTaxInfo] = useState({ taxNumber: '', vatNumber: '', taxClearanceUrl: '' });
  const [licenceInfo, setLicenceInfo] = useState({ licenceNumber: '', licenceType: '', expiryDate: '', licenceDocumentUrl: '', wlaDocumentUrl: '' });
  const [customsInfo, setCustomsInfo] = useState({ exportCode: '', exportDocumentUrl: '' });
  const [bankingInfo, setBankingInfo] = useState({ bankName: '', accountName: '', accountNumber: '', branchCode: '', swiftCode: '', bankConfirmationUrl: '', payoutPreference: 'Monthly' });
  const [productCategories, setProductCategories] = useState([]);
  const [deliveryInfo, setDeliveryInfo] = useState({ fulfillmentMethod: '', dispatchLocation: '', dispatchDays: '', cutoffTime: '', processingTime: '' });
  const [agreements, setAgreements] = useState({ termsAccepted: false, informationAccurate: false });
  
  // International specific state
  const [credentialsInfo, setCredentialsInfo] = useState({ exportLicenceNumber: '', homeCountryLicence: '', certificates: '' });
  const [marketInfo, setMarketInfo] = useState({ targetRegions: [] });
  const [logisticsInfo, setLogisticsInfo] = useState({ currentImporter: '', freightForwarder: '' });
  const [storyInfo, setStoryInfo] = useState({ wineryPhotosUrl: '', winemakerBio: '', brandStory: '' });

  useEffect(() => {
    // If logged in, populate account info
    if (user && !accountInfo.email) {
      setAccountInfo({ name: user.name || '', email: user.email || '', password: '' });
    }

    const fetchVendorData = async () => {
      try {
        let hasBackendData = false;
        
        // Attempt to fetch from backend if user is vendor_pending, vendor_active, or vendor_rejected
        if (user && (user.role === 'vendor_active' || user.role === 'vendor_pending' || user.role === 'vendor_rejected')) {
          const userInfo = JSON.parse(localStorage.getItem('userInfo'));
          const token = userInfo?.token || user?.token;
          
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/vendor/onboarding`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (data && data.businessInfo) {
            hasBackendData = true;
            if (data.businessInfo) setBusinessInfo(data.businessInfo);
            if (data.kycInfo) setKycInfo(data.kycInfo);
            if (data.taxInfo) setTaxInfo(data.taxInfo);
            if (data.licenceInfo) setLicenceInfo(data.licenceInfo);
            if (data.customsInfo) setCustomsInfo(data.customsInfo);
            if (data.bankingInfo) setBankingInfo(data.bankingInfo);
            if (data.productCategories) setProductCategories(data.productCategories);
            if (data.deliveryInfo) setDeliveryInfo(data.deliveryInfo);
            if (data.agreements) setAgreements(data.agreements);
          }
        }

        // If no backend data, try to fetch from localStorage
        if (!hasBackendData) {
          const savedData = localStorage.getItem('vendor-onboarding-draft');
          if (savedData) {
            const data = JSON.parse(savedData);
            if (data.currentStep) setCurrentStep(data.currentStep);
            if (data.accountInfo && !user) setAccountInfo(data.accountInfo);
            if (data.businessInfo) setBusinessInfo(data.businessInfo);
            if (data.kycInfo) setKycInfo(data.kycInfo);
            if (data.taxInfo) setTaxInfo(data.taxInfo);
            if (data.licenceInfo) setLicenceInfo(data.licenceInfo);
            if (data.customsInfo) setCustomsInfo(data.customsInfo);
            if (data.bankingInfo) setBankingInfo(data.bankingInfo);
            if (data.productCategories) setProductCategories(data.productCategories);
            if (data.deliveryInfo) setDeliveryInfo(data.deliveryInfo);
            if (data.agreements) setAgreements(data.agreements);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [user]);

  const handleFileUpload = async (e, setUrlFn) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('document', file);
    
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/vendor/upload-public`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user?.token}` },
        body: formData
      });
      const data = await res.json();
      setUrlFn(data.url);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setSaving(false);
    }
  };

  const isStepComplete = (stepId) => {
    if (isLocal) {
      switch (stepId) {
        case 1:
          if (!accountInfo.name || !accountInfo.email) return false;
          if (!user && !accountInfo.password) return false;
          return true;
        case 2:
          return !!(businessInfo.legalName && businessInfo.tradingName && businessInfo.registrationNumber && businessInfo.address);
        case 3:
          return !!(kycInfo.directorName && kycInfo.idNumber && kycInfo.contactNumber);
        case 4:
          return !!(taxInfo.taxNumber && taxInfo.vatNumber);
        case 5:
          return !!(licenceInfo.licenceNumber && licenceInfo.licenceType);
        case 6:
          return true; // Optional
        case 7:
          return !!(bankingInfo.bankName && bankingInfo.accountName && bankingInfo.accountNumber && bankingInfo.branchCode);
        case 8:
          if (productCategories.length === 0) return false;
          if (productCategories.includes('Wine') && !licenceInfo.wlaDocumentUrl) return false;
          return true;
        case 9:
          return !!(deliveryInfo.fulfillmentMethod && deliveryInfo.dispatchLocation && deliveryInfo.processingTime);
        case 10:
          return agreements.termsAccepted && agreements.informationAccurate;
        default:
          return false;
      }
    } else {
      switch (stepId) {
        case 1:
          if (!accountInfo.name || !accountInfo.email) return false;
          if (!user && !accountInfo.password) return false;
          return true;
        case 2:
          return !!(businessInfo.legalName && businessInfo.address);
        case 3:
          return !!credentialsInfo.homeCountryLicence;
        case 4:
          return marketInfo.targetRegions.length > 0;
        case 5:
          return true; // Optional
        case 6:
          return !!(storyInfo.brandStory);
        case 7:
          return !!(bankingInfo.bankName && bankingInfo.accountNumber);
        case 8:
          return productCategories.length > 0;
        case 9:
          return agreements.termsAccepted && agreements.informationAccurate;
        default:
          return false;
      }
    }
  };

  const canAccessStep = (stepId) => {
    if (stepId === 1) return true;
    for (let i = 1; i < stepId; i++) {
      if (!isStepComplete(i)) return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!isStepComplete(currentStep)) {
      alert("Please fill in all required fields before continuing.");
      return;
    }
    // Save to localStorage
    const dataToSave = {
      currentStep: currentStep + 1,
      accountInfo, businessInfo, kycInfo, taxInfo, licenceInfo, customsInfo, bankingInfo, productCategories, deliveryInfo, agreements
    };
    localStorage.setItem('vendor-onboarding-draft', JSON.stringify(dataToSave));
    setCurrentStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload = {
        vendorType: isLocal ? 'local' : 'international',
        accountInfo, businessInfo, bankingInfo, productCategories, agreements,
        ...(isLocal ? { kycInfo, taxInfo, licenceInfo, customsInfo, deliveryInfo } : { credentialsInfo, marketInfo, logisticsInfo, storyInfo })
      };
      
      const headers = { 'Content-Type': 'application/json' };
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        const parsed = JSON.parse(userInfo);
        if (parsed.token) {
          headers['Authorization'] = `Bearer ${parsed.token}`;
        }
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/vendor/register-full`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Submission failed');

      localStorage.removeItem('vendor-onboarding-draft');
      localStorage.setItem('userInfo', JSON.stringify(data));
      window.location.href = '/customer/profile';
    } catch (err) {
      console.error(err);
      alert('Error submitting application: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const InputField = ({ label, value, onChange, placeholder, type = 'text' }) => (
    <div className="mb-6">
      <label className="block text-[#bdb5a6] text-[10px] font-bold uppercase tracking-widest mb-2">{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} className="block w-full py-4 border-b border-white/10 bg-transparent text-[#eee8dd] placeholder-white/20 focus:outline-none focus:border-[#c9a35b] sm:text-sm transition-colors rounded-none" />
    </div>
  );

  const FileUploadField = ({ label, url, onUpload }) => (
    <div className="mb-6">
      <label className="block text-[#bdb5a6] text-[10px] font-bold uppercase tracking-widest mb-2">{label}</label>
      <div className="flex items-center gap-4">
        <label className="flex items-center justify-center gap-2 px-4 py-4 bg-transparent border-b border-white/10 border-dashed rounded-none cursor-pointer hover:border-[#c9a35b] transition-colors flex-1">
          <UploadCloud size={18} className="text-[#918a7f]" />
          <span className="text-[#eee8dd] text-sm">Upload Document</span>
          <input type="file" className="hidden" onChange={onUpload} accept=".pdf,.png,.jpg,.jpeg" />
        </label>
        {url && <div className="text-green-500 flex items-center gap-1 text-sm"><CheckCircle2 size={16} /> Uploaded</div>}
      </div>
    </div>
  );

  if (loading) return <div className="vendor-theme min-h-screen bg-[#0a0907] flex items-center justify-center text-[#e1bd70]">Loading...</div>;

  return (
    <div className="vendor-theme min-h-screen bg-[#0a0907] pt-8 pb-20 px-4 relative overflow-hidden">
      {/* Massive subtle golden glow background */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#c9a35b]/5 pointer-events-none rounded-full blur-3xl opacity-60"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-6 text-center">
          <h1 className="text-[#eee8dd] font-serif text-4xl font-medium mb-4">Become a Grand Store Vendor</h1>
          <p className="text-[#918a7f] max-w-xl mx-auto">Sell your wines and spirits to customers across South Africa. Application takes approximately 10–15 minutes.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12 overflow-x-auto pb-4 hide-scrollbar">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            let isComplete = false;
            if (isLocal && step.id === 6) {
              isComplete = currentStep > 6 || !!customsInfo.exportCode;
            } else if (!isLocal && step.id === 5) {
              isComplete = currentStep > 5 || !!logisticsInfo.currentImporter || !!logisticsInfo.freightForwarder;
            } else {
              isComplete = isStepComplete(step.id);
            }
            
            return (
              <div key={step.id} className="flex items-center min-w-max">
                <div 
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex flex-col items-center gap-2 transition-all cursor-pointer hover:scale-105 ${isActive ? 'text-[#e1bd70]' : isComplete ? 'text-green-500' : 'text-[#4a4740]'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isActive ? 'border-[#c9a35b] bg-[#c9a35b]/10' : isComplete ? 'border-green-500 bg-green-500/10' : 'border-[#4a4740] bg-transparent'}`}>
                    {isComplete ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                  </div>
                  <span className="text-xs font-semibold tracking-wider uppercase">{step.title}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-8 h-[2px] mx-2 ${isComplete ? 'bg-green-500' : 'bg-[#4a4740]'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-transparent mt-4 relative">
          {!canAccessStep(currentStep) && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#c9a35b]/10 text-[#e1bd70] border border-[#c9a35b]/20 px-4 py-2 rounded-full text-sm font-medium z-10">
              🔒 Please complete all previous steps to unlock this section
            </div>
          )}
          
          {(() => {
            const activeStep = steps.find(s => s.id === currentStep)?.title;
            return (
          <div className={`${!canAccessStep(currentStep) ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Step: Account */}
            {activeStep === 'Account' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl text-[#eee8dd] mb-6">Account Details</h2>
                <p className="text-[#918a7f] mb-6">Create your vendor account to manage your products and orders.</p>
                <InputField label="Contact Name" value={accountInfo.name} onChange={e => setAccountInfo({...accountInfo, name: e.target.value})} placeholder="Your full name" />
                <InputField label="Email Address" type="email" value={accountInfo.email} onChange={e => setAccountInfo({...accountInfo, email: e.target.value})} placeholder="you@company.com" />
                {!user && (
                  <InputField label="Password" type="password" value={accountInfo.password} onChange={e => setAccountInfo({...accountInfo, password: e.target.value})} placeholder="Create a strong password" />
                )}
              </div>
            )}

            {/* Step: Business */}
            {activeStep === 'Business' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl text-[#eee8dd] mb-6">Business Information</h2>
                <InputField label="Legal Company Name" value={businessInfo.legalName} onChange={e => setBusinessInfo({...businessInfo, legalName: e.target.value})} />
                <InputField label="Trading Name" value={businessInfo.tradingName} onChange={e => setBusinessInfo({...businessInfo, tradingName: e.target.value})} />
                <InputField label="Registration Number" value={businessInfo.registrationNumber} onChange={e => setBusinessInfo({...businessInfo, registrationNumber: e.target.value})} />
                <div className="mb-6">
                  <label className="block text-[#bdb5a6] text-[10px] font-bold uppercase tracking-widest mb-2">Business Address</label>
                  <LocationInput name="address" value={businessInfo.address} onChange={e => setBusinessInfo({...businessInfo, address: e.target.value})} placeholder="Start typing address..." className="block w-full py-4 border-b border-white/10 bg-transparent text-[#eee8dd] placeholder-white/20 focus:outline-none focus:border-[#c9a35b] sm:text-sm transition-colors rounded-none" />
                </div>
              </div>
            )}

            {/* Step: KYC (Local) */}
            {activeStep === 'KYC' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl text-[#eee8dd] mb-6">Director KYC</h2>
                <InputField label="Director Full Name" value={kycInfo.directorName} onChange={e => setKycInfo({...kycInfo, directorName: e.target.value})} />
                <InputField label="ID Number" value={kycInfo.idNumber} onChange={e => setKycInfo({...kycInfo, idNumber: e.target.value})} />
                <InputField label="Contact Number" value={kycInfo.contactNumber} onChange={e => setKycInfo({...kycInfo, contactNumber: e.target.value})} />
                <FileUploadField label="Director ID Document" url={kycInfo.idDocumentUrl} onUpload={(e) => handleFileUpload(e, (url) => setKycInfo({...kycInfo, idDocumentUrl: url}))} />
              </div>
            )}

            {/* Step: Tax (Local) */}
            {activeStep === 'Tax' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl text-[#eee8dd] mb-6">Tax Details</h2>
                <InputField label="Tax Number" value={taxInfo.taxNumber} onChange={e => setTaxInfo({...taxInfo, taxNumber: e.target.value})} />
                <InputField label="VAT Number" value={taxInfo.vatNumber} onChange={e => setTaxInfo({...taxInfo, vatNumber: e.target.value})} />
                <FileUploadField label="SARS Tax Clearance" url={taxInfo.taxClearanceUrl} onUpload={(e) => handleFileUpload(e, (url) => setTaxInfo({...taxInfo, taxClearanceUrl: url}))} />
              </div>
            )}

            {/* Step: Licence (Local) */}
            {activeStep === 'Licence' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl text-[#eee8dd] mb-6">Liquor Licence</h2>
                <InputField label="Licence Number" value={licenceInfo.licenceNumber} onChange={e => setLicenceInfo({...licenceInfo, licenceNumber: e.target.value})} />
                <InputField label="Licence Type" value={licenceInfo.licenceType} onChange={e => setLicenceInfo({...licenceInfo, licenceType: e.target.value})} />
                <FileUploadField label="Licence Document" url={licenceInfo.licenceDocumentUrl} onUpload={(e) => handleFileUpload(e, (url) => setLicenceInfo({...licenceInfo, licenceDocumentUrl: url}))} />
              </div>
            )}

            {/* Step: Customs (Local) */}
            {activeStep === 'Customs' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl text-[#eee8dd] mb-6">Customs (Optional)</h2>
                <InputField label="Export Code" value={customsInfo.exportCode} onChange={e => setCustomsInfo({...customsInfo, exportCode: e.target.value})} />
                <FileUploadField label="Customs Document" url={customsInfo.exportDocumentUrl} onUpload={(e) => handleFileUpload(e, (url) => setCustomsInfo({...customsInfo, exportDocumentUrl: url}))} />
              </div>
            )}

            {/* Step: Banking */}
            {activeStep === 'Banking' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl text-[#eee8dd] mb-6">Banking Details</h2>
                <InputField label="Bank Name" value={bankingInfo.bankName} onChange={e => setBankingInfo({...bankingInfo, bankName: e.target.value})} />
                <InputField label="Account Name" value={bankingInfo.accountName} onChange={e => setBankingInfo({...bankingInfo, accountName: e.target.value})} />
                <InputField label="Account Number" value={bankingInfo.accountNumber} onChange={e => setBankingInfo({...bankingInfo, accountNumber: e.target.value})} />
                <InputField label="Branch Code" value={bankingInfo.branchCode} onChange={e => setBankingInfo({...bankingInfo, branchCode: e.target.value})} />
                <FileUploadField label="Bank Confirmation Letter" url={bankingInfo.bankConfirmationUrl} onUpload={(e) => handleFileUpload(e, (url) => setBankingInfo({...bankingInfo, bankConfirmationUrl: url}))} />
              </div>
            )}

            {/* Step: Products */}
            {activeStep === 'Products' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl text-[#eee8dd] mb-6">Products & Inventory</h2>
                <p className="text-[#918a7f] mb-4">Select the categories you intend to sell:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {['Whisky', 'Wine', 'Spirits'].map(cat => (
                    <label key={cat} className="flex items-center gap-2 text-[#eee8dd] p-3 border border-white/5 rounded-md hover:border-white/20 cursor-pointer">
                      <input type="checkbox" checked={productCategories.includes(cat)} 
                             onChange={(e) => {
                               if(e.target.checked) setProductCategories([...productCategories, cat]);
                               else setProductCategories(productCategories.filter(c => c !== cat));
                             }} />
                      {cat}
                    </label>
                  ))}
                </div>
                
                {productCategories.includes('Wine') && (
                  <div className="animate-in fade-in bg-white/5 p-6 rounded-lg border border-[#c9a35b]/30">
                    <h3 className="text-lg text-[#e1bd70] mb-4">Wine Selling Requirements</h3>
                    <p className="text-[#918a7f] mb-4 text-sm">Because you selected Wine, you are required to upload a Wholesale Liquor Authority (WLA) document.</p>
                    <FileUploadField 
                      label="WLA Document *" 
                      url={licenceInfo.wlaDocumentUrl} 
                      onUpload={(e) => handleFileUpload(e, (url) => setLicenceInfo({...licenceInfo, wlaDocumentUrl: url}))} 
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step: Delivery (Local) */}
            {activeStep === 'Delivery' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl text-[#eee8dd] mb-6">Delivery & Fulfillment</h2>
                <InputField label="Fulfillment Method" placeholder="e.g. Vendor ships directly" value={deliveryInfo.fulfillmentMethod} onChange={e => setDeliveryInfo({...deliveryInfo, fulfillmentMethod: e.target.value})} />
                <div className="mb-6">
                  <label className="block text-[#bdb5a6] text-[10px] font-bold uppercase tracking-widest mb-2">Dispatch Location</label>
                  <LocationInput name="dispatchLocation" value={deliveryInfo.dispatchLocation} onChange={e => setDeliveryInfo({...deliveryInfo, dispatchLocation: e.target.value})} placeholder="Start typing address..." className="block w-full py-4 border-b border-white/10 bg-transparent text-[#eee8dd] placeholder-white/20 focus:outline-none focus:border-[#c9a35b] sm:text-sm transition-colors rounded-none" />
                </div>
                <InputField label="Processing Time" placeholder="e.g. 1-2 Business Days" value={deliveryInfo.processingTime} onChange={e => setDeliveryInfo({...deliveryInfo, processingTime: e.target.value})} />
              </div>
            )}

            {/* Step: Credentials (International) */}
            {activeStep === 'Credentials' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl text-[#eee8dd] mb-6">Export Credentials</h2>
                <InputField label="Export Licence Number" value={credentialsInfo.exportLicenceNumber} onChange={e => setCredentialsInfo({...credentialsInfo, exportLicenceNumber: e.target.value})} />
                <FileUploadField label="Home Country Licence" url={credentialsInfo.homeCountryLicence} onUpload={(e) => handleFileUpload(e, (url) => setCredentialsInfo({...credentialsInfo, homeCountryLicence: url}))} />
                <FileUploadField label="Quality/Origin Certificates (Optional)" url={credentialsInfo.certificates} onUpload={(e) => handleFileUpload(e, (url) => setCredentialsInfo({...credentialsInfo, certificates: url}))} />
              </div>
            )}

            {/* Step: Market (International) */}
            {activeStep === 'Market' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl text-[#eee8dd] mb-6">Target Markets</h2>
                <p className="text-[#918a7f] mb-4">Which regions are you targeting in South Africa?</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {['Western Cape', 'Gauteng', 'KwaZulu-Natal', 'Nationwide'].map(region => (
                    <label key={region} className="flex items-center gap-2 text-[#eee8dd] p-3 border border-white/5 rounded-md hover:border-white/20 cursor-pointer">
                      <input type="checkbox" checked={marketInfo.targetRegions.includes(region)} 
                             onChange={(e) => {
                               if(e.target.checked) setMarketInfo({...marketInfo, targetRegions: [...marketInfo.targetRegions, region]});
                               else setMarketInfo({...marketInfo, targetRegions: marketInfo.targetRegions.filter(r => r !== region)});
                             }} />
                      {region}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step: Logistics (International) */}
            {activeStep === 'Logistics' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl text-[#eee8dd] mb-6">Current Importer Details</h2>
                <InputField label="Current Importer in SA (Optional)" value={logisticsInfo.currentImporter} onChange={e => setLogisticsInfo({...logisticsInfo, currentImporter: e.target.value})} placeholder="If applicable" />
                <InputField label="Preferred Freight Forwarder (Optional)" value={logisticsInfo.freightForwarder} onChange={e => setLogisticsInfo({...logisticsInfo, freightForwarder: e.target.value})} />
              </div>
            )}

            {/* Step: Story (International) */}
            {activeStep === 'Story' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl text-[#eee8dd] mb-6">Brand Story</h2>
                <InputField label="Winemaker/Master Distiller Bio" type="text" value={storyInfo.winemakerBio} onChange={e => setStoryInfo({...storyInfo, winemakerBio: e.target.value})} />
                <InputField label="Brand Story / Heritage" type="text" value={storyInfo.brandStory} onChange={e => setStoryInfo({...storyInfo, brandStory: e.target.value})} placeholder="Tell your customers about your legacy..." />
                <FileUploadField label="Winery/Estate Photos" url={storyInfo.wineryPhotosUrl} onUpload={(e) => handleFileUpload(e, (url) => setStoryInfo({...storyInfo, wineryPhotosUrl: url}))} />
              </div>
            )}

            {/* Step: Agreement */}
            {activeStep === 'Agreement' && (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-2xl text-[#eee8dd] mb-6">Final Agreement</h2>
                <div className="space-y-4 mb-8">
                  <label className="flex items-start gap-3 text-[#eee8dd] p-4 bg-[#0a0907] border border-white/5 rounded-md cursor-pointer">
                    <input type="checkbox" className="mt-1" checked={agreements.informationAccurate} onChange={e => setAgreements({...agreements, informationAccurate: e.target.checked})} />
                    <span className="text-sm">I confirm that all information provided is accurate and I am authorised to represent the business. I hold the required licences applicable to my products.</span>
                  </label>
                  <label className="flex items-start gap-3 text-[#eee8dd] p-4 bg-[#0a0907] border border-white/5 rounded-md cursor-pointer">
                    <input type="checkbox" className="mt-1" checked={agreements.termsAccepted} onChange={e => setAgreements({...agreements, termsAccepted: e.target.checked})} />
                    <span className="text-sm">I agree to Grand Store's Vendor Terms & Conditions, Commission Structure, and Prohibited Products Policy.</span>
                  </label>
                </div>
              </div>
            )}
          </div>
          );
          })()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12 pt-6 border-t border-white/10">
            <button 
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1 || saving}
              className="px-4 py-4 text-[#bdb5a6] hover:text-white text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
            >
              Return
            </button>
            
            {currentStep < steps.length ? (
              <button 
                onClick={handleNext}
                disabled={saving || !canAccessStep(currentStep)}
                className={`px-8 py-4 text-xs font-bold uppercase tracking-widest text-black flex items-center gap-2  transition-all ${saving || !canAccessStep(currentStep) ? 'bg-[#e1bd70]/50 cursor-not-allowed' : 'bg-[#c9a35b] hover:brightness-110'}`}
              >
                {saving ? 'Saving...' : 'Save & Continue'} <ChevronRight size={16} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={saving || !canAccessStep(currentStep) || !agreements.termsAccepted || !agreements.informationAccurate}
                className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-black flex items-center gap-2  transition-all bg-[#c9a35b] hover:brightness-110 disabled:opacity-50"
              >
                {saving ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
