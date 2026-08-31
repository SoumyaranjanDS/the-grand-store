import React, { useEffect, useState } from "react";
import api from '../../api';
import { useAuth } from "../../context/AuthContext";
import { CheckCircle, XCircle, Clock, Search, FileText, ChevronDown, ChevronUp, Link as LinkIcon } from "lucide-react";

export default function AdminVendors() {
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [approveId, setApproveId] = useState(null);
  const [feeAmount, setFeeAmount] = useState(2500);

  const goldText = "text-[#c9a35b]";
  const fetchVendors = async () => {
    try {
      const res = await api.get(`/admin/vendors`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setVendors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [user]);

  const handleStatusUpdate = async (vendorId, newStatus) => {
    if (newStatus !== 'approved' && !window.confirm(`Are you sure you want to mark this vendor as ${newStatus}?`)) return;
    
    try {
      const payload = { status: newStatus };
      if (newStatus === 'approved') {
        payload.registrationFee = Number(feeAmount);
      }

      await api.put(`/admin/vendors/${vendorId}/status`, 
        payload,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      if (newStatus === 'approved') {
        setApproveId(null);
        setFeeAmount(2500);
      }
      // Refresh list
      fetchVendors();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 w-max"><CheckCircle size={12}/> Approved</span>;
      case 'pending_approval': return <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 w-max"><Clock size={12}/> Pending</span>;
      case 'rejected': return <span className="px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 w-max"><XCircle size={12}/> Rejected</span>;
      case 'draft': return <span className="px-2 py-1 bg-white/5 text-white/50 border border-white/10 rounded text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 w-max"><FileText size={12}/> Draft</span>;
      default: return <span className="px-2 py-1 bg-white/5 text-white/50 border border-white/10 rounded text-[10px] uppercase font-bold tracking-widest w-max">{status}</span>;
    }
  };

  const filtered = vendors.filter(v => 
    v.businessInfo?.legalName?.toLowerCase().includes(search.toLowerCase()) ||
    v.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
    v.status.toLowerCase().includes(search.toLowerCase())
  );

  const DetailRow = ({ label, value, isLink }) => {
    if (!value) return null;
    return (
      <div className="flex gap-4 mb-2">
        <span className="text-[10px] uppercase tracking-widest text-stone-400 w-32 flex-shrink-0 pt-0.5">{label}</span>
        {isLink ? (
          <a href={value} target="_blank" rel="noreferrer" className="text-gold flex items-center gap-1 hover:underline text-sm">
            <LinkIcon size={12} /> View Document
          </a>
        ) : (
          <span className="text-stone-300 text-sm">{value}</span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-10 w-full max-w-7xl mx-auto pb-10">
      <section>
        <h1 className="text-[var(--color-ivory)] font-serif text-5xl mb-4 leading-tight">
          Vendor <span className={goldText} >Management</span>
        </h1>
        <p className="text-[var(--color-ivory-muted)] text-lg font-light">
          Review, approve, or reject vendor applications.
        </p>
      </section>

      <div className="flex items-center gap-2 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 w-full md:w-96">
        <Search size={16} className="text-[var(--color-ivory-muted)]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by legal name, email, or status..."
          className="bg-transparent text-sm text-white outline-none placeholder:text-white/30 w-full"
        />
      </div>

      <div className="overflow-x-auto bg-[#0a0a0a] border border-white/5 rounded-2xl">
        {loading ? (
          <div className="p-12 text-center text-[var(--color-ivory-muted)] animate-pulse">Loading vendors...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[var(--color-ivory-muted)]">No vendors found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[10px] uppercase tracking-widest text-[var(--color-ivory-muted)] bg-black/20">
                <th className="py-4 pl-6 font-semibold">Business Name</th>
                <th className="py-4 font-semibold">Email</th>
                <th className="py-4 font-semibold">Status</th>
                <th className="py-4 font-semibold">Step</th>
                <th className="py-4 font-semibold">Date Applied</th>
                <th className="py-4 pr-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v, i) => (
                <React.Fragment key={v._id}>
                  <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-4 pl-6 text-sm text-[var(--color-ivory)] font-serif">{v.businessInfo?.legalName || 'N/A'}</td>
                  <td className="py-4 text-xs text-[var(--color-ivory-muted)]">{v.userId?.email || 'N/A'}</td>
                  <td className="py-4">{getStatusBadge(v.status)}</td>
                  <td className="py-4 text-xs text-[var(--color-gold)] font-mono">{v.onboardingStep}/10</td>
                  <td className="py-4 text-xs text-[var(--color-ivory-muted)]">
                    {new Date(v.createdAt).toLocaleDateString("en-ZA")}
                  </td>
                  <td className="py-4 pr-6">
                    <div className="flex justify-end items-center gap-2">
                      {v.status === 'pending_approval' && (
                        <>
                          <button onClick={() => { setApproveId(v._id); setExpanded(v._id); }} className="px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded border border-green-500/30 text-[10px] font-bold uppercase tracking-widest transition-colors">
                            Approve
                          </button>
                          <button onClick={() => handleStatusUpdate(v._id, 'rejected')} className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded border border-red-500/30 text-[10px] font-bold uppercase tracking-widest transition-colors">
                            Reject
                          </button>
                        </>
                      )}
                      {v.status === 'approved' && (
                        <button onClick={() => handleStatusUpdate(v._id, 'suspended')} className="px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded border border-red-500/30 text-[10px] font-bold uppercase tracking-widest transition-colors">
                          Suspend
                        </button>
                      )}
                      {v.status === 'rejected' && (
                        <button onClick={() => handleStatusUpdate(v._id, 'pending_approval')} className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 rounded border border-yellow-500/30 text-[10px] font-bold uppercase tracking-widest transition-colors">
                          Allow Reapply
                        </button>
                      )}
                      <button
                        onClick={() => setExpanded(expanded === v._id ? null : v._id)}
                        className="text-white/20 hover:text-white/60 transition-colors p-1.5 ml-2"
                      >
                        {expanded === v._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded === v._id && (
                  <tr className="bg-[#111] border-b border-white/5">
                    <td colSpan="6" className="p-6">
                      {approveId === v._id && (
                        <div className="bg-green-500/10 border border-green-500/20 p-4 mb-6 rounded flex items-center gap-4">
                          <span className="text-green-400 text-sm font-medium">Set Registration Fee (R):</span>
                          <input 
                            type="number" 
                            value={feeAmount} 
                            onChange={(e) => setFeeAmount(e.target.value)}
                            className="bg-black border border-green-500/30 text-white px-3 py-1.5 rounded w-32 focus:outline-none"
                          />
                          <button onClick={() => handleStatusUpdate(v._id, 'approved')} className="bg-green-500 text-black font-bold uppercase tracking-widest text-[10px] px-4 py-2 rounded">
                            Confirm Approval
                          </button>
                          <button onClick={() => setApproveId(null)} className="text-white/40 uppercase tracking-widest text-[10px] hover:text-white">
                            Cancel
                          </button>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div>
                          <h4 className="text-gold text-xs uppercase tracking-widest mb-4">Business Info</h4>
                          <DetailRow label="Legal Name" value={v.businessInfo?.legalName} />
                          <DetailRow label="Trading Name" value={v.businessInfo?.tradingName} />
                          <DetailRow label="Reg Number" value={v.businessInfo?.registrationNumber} />
                          <DetailRow label="Type" value={v.businessInfo?.businessType} />
                          <DetailRow label="Address" value={v.businessInfo?.address} />
                        </div>
                        
                        <div>
                          <h4 className="text-gold text-xs uppercase tracking-widest mb-4">Documents</h4>
                          <DetailRow label="ID Document" value={v.kycInfo?.idDocumentUrl} isLink={true} />
                          <DetailRow label="Tax Clearance" value={v.taxInfo?.taxClearanceUrl} isLink={true} />
                          <DetailRow label="Licence Doc" value={v.licenceInfo?.licenceDocumentUrl} isLink={true} />
                          <DetailRow label="Customs Export" value={v.customsInfo?.exportDocumentUrl} isLink={true} />
                          <DetailRow label="Bank Confirmation" value={v.bankingInfo?.bankConfirmationUrl} isLink={true} />
                        </div>
                        
                        <div>
                          <h4 className="text-gold text-xs uppercase tracking-widest mb-4">KYC & Tax</h4>
                          <DetailRow label="Director Name" value={v.kycInfo?.directorName} />
                          <DetailRow label="ID Number" value={v.kycInfo?.idNumber} />
                          <DetailRow label="Tax Number" value={v.taxInfo?.taxNumber} />
                          <DetailRow label="VAT Number" value={v.taxInfo?.vatNumber} />
                          <DetailRow label="Bank Name" value={v.bankingInfo?.bankName} />
                          <DetailRow label="Payment Status" value={v.paymentStatus} />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
