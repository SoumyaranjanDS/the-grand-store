import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  FileCheck2,
  FileText,
  Globe2,
  Landmark,
  Mail,
  PackageCheck,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  Store,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import api from "../../api";

const STATUS_STYLES = {
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  rejected: "border-red-500/30 bg-red-500/10 text-red-300",
  suspended: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  pending_approval: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  draft: "border-white/15 bg-white/5 text-white/60",
};

const formatDate = (value, withTime = false) => {
  if (!value) return "Not provided";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return withTime ? date.toLocaleString() : date.toLocaleDateString();
};

const present = (value) => value !== undefined && value !== null && value !== "";
const LOCAL_STEP_NAMES = ["Not started", "Account", "Business", "KYC", "Tax", "Licence", "Customs", "Banking", "Products", "Delivery", "Agreement"];
const INTERNATIONAL_STEP_NAMES = ["Not started", "Account", "Business", "Credentials", "Market", "Logistics", "Story", "Banking", "Products", "Agreement"];

const getOnboardingProgress = (vendor) => {
  const international = vendor.vendorType === "international";
  const total = international ? 9 : 10;
  const current = Math.min(total, Math.max(0, Number(vendor.onboardingStep) || 0));
  const names = international ? INTERNATIONAL_STEP_NAMES : LOCAL_STEP_NAMES;
  return {
    current,
    total,
    percent: Math.round((current / total) * 100),
    label: names[current] || "Application progress",
  };
};

const show = (value) => {
  if (!present(value)) return "Not provided";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Not provided";
  return String(value);
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] ${STATUS_STYLES[status] || STATUS_STYLES.draft}`}>
      {(status || "draft").replaceAll("_", " ")}
    </span>
  );
}

function SummaryCard({ icon: Icon, label, children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111] p-4">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
        <Icon size={15} className="text-[#c9a35b]" /> {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-white">{children}</div>
    </div>
  );
}

function Section({ icon: Icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#101010]">
      <div className="flex items-start gap-3 border-b border-white/[0.08] px-5 py-4">
        <span className="rounded-lg bg-[#c9a35b]/10 p-2 text-[#d5b46c]"><Icon size={18} /></span>
        <div>
          <h2 className="font-serif text-xl font-semibold text-white">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-white/40">{description}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Fields({ items }) {
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {items.map(({ label, value, wide }) => (
        <div key={label} className={wide ? "sm:col-span-2" : ""}>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">{label}</dt>
          <dd className={`mt-1.5 break-words text-sm ${present(value) ? "text-white/80" : "italic text-white/30"}`}>{show(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function DocumentLink({ label, url }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.025] p-3">
      <div className="flex min-w-0 items-center gap-3">
        <FileText size={17} className={url ? "shrink-0 text-[#c9a35b]" : "shrink-0 text-white/20"} />
        <div className="min-w-0">
          <p className="truncate text-sm text-white/75">{label}</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-white/30">{url ? "Uploaded" : "Not uploaded"}</p>
        </div>
      </div>
      {url && (
        <a href={url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[#c9a35b]/30 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d6b66f] hover:bg-[#c9a35b]/10">
          Open <ExternalLink size={12} />
        </a>
      )}
    </div>
  );
}

export default function AdminVendorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fee, setFee] = useState("2500");
  const [reason, setReason] = useState("");
  const [working, setWorking] = useState("");

  const fetchVendor = useCallback(async () => {
    try {
      setError("");
      const { data } = await api.get(`/admin/vendors/${id}`);
      setVendor(data);
      setFee(String(data.registrationFee ?? 2500));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load this vendor application.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchVendor(); }, [fetchVendor]);

  const updateStatus = async (status) => {
    if (status === "approved" && (!fee || Number(fee) < 0)) {
      setError("Enter a valid registration fee before approving.");
      return;
    }
    if (status === "rejected" && !reason.trim()) {
      setError("Add a reason so the applicant receives a useful decision email.");
      return;
    }
    const labels = { approved: "approve", rejected: "reject", suspended: "suspend", pending_approval: "return to review" };
    if (!window.confirm(`Are you sure you want to ${labels[status]} this vendor?`)) return;
    try {
      setWorking(status);
      setError("");
      setMessage("");
      await api.put(`/admin/vendors/${id}/status`, {
        status,
        reason: reason.trim(),
        ...(status === "approved" ? { registrationFee: Number(fee) } : {}),
      });
      setMessage(`Vendor application updated to ${status.replaceAll("_", " ")}.`);
      await fetchVendor();
    } catch (err) {
      setError(err.response?.data?.message || "The vendor status could not be updated.");
    } finally {
      setWorking("");
    }
  };

  const sendPaymentReminder = async () => {
    try {
      setWorking("reminder");
      setError("");
      setMessage("");
      const { data } = await api.post(`/admin/vendors/${id}/remind-payment`);
      setMessage(data.message || "Payment reminder sent.");
      await fetchVendor();
    } catch (err) {
      setError(err.response?.data?.message || "The payment reminder could not be sent.");
    } finally {
      setWorking("");
    }
  };

  const documents = useMemo(() => vendor ? [
    ["Identity document", vendor.kycInfo?.idDocumentUrl],
    ["Tax clearance", vendor.taxInfo?.taxClearanceUrl],
    ["Liquor licence", vendor.licenceInfo?.licenceDocumentUrl],
    ["Bank confirmation", vendor.bankingInfo?.bankConfirmationUrl],
    ["Export document", vendor.customsInfo?.exportDocumentUrl],
    ["Home-country licence", vendor.credentialsInfo?.homeCountryLicence],
    ["Certificates", vendor.credentialsInfo?.certificates],
  ] : [], [vendor]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center bg-[#090909] text-sm text-white/50">Loading vendor application...</div>;

  if (error && !vendor) {
    return (
      <div className="min-h-full bg-[#090909] p-6 text-white">
        <div className="mx-auto max-w-xl rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <AlertCircle className="mx-auto text-red-300" />
          <p className="mt-3 text-red-100">{error}</p>
          <button onClick={() => navigate("/admin/vendors")} className="mt-5 text-sm font-semibold text-[#d5b46c]">Back to vendors</button>
        </div>
      </div>
    );
  }

  const business = vendor.businessInfo || {};
  const account = vendor.userId || {};
  const address = business.address || {};
  const pickup = vendor.shippingProfile?.pickupAddress || {};
  const businessName = business.tradingName || business.legalName || "Unnamed business";
  const onboarding = getOnboardingProgress(vendor);

  return (
    <div className="min-h-full bg-[#090909] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link to="/admin/vendors" className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/45 transition hover:text-[#d5b46c]">
          <ArrowLeft size={15} /> All vendor applications
        </Link>

        <header className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#17140e] via-[#111] to-[#0e0e0e] p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                {business.logoUrl ? <img src={business.logoUrl} alt="" className="h-full w-full object-cover" /> : <Store className="text-[#c9a35b]" />}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2"><StatusBadge status={vendor.status} /><span className="text-xs capitalize text-white/40">{vendor.vendorType || "local"} vendor</span></div>
                <h1 className="mt-3 break-words font-serif text-3xl font-semibold sm:text-4xl">{businessName}</h1>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/50">
                  <span className="inline-flex items-center gap-2"><UserRound size={14} /> {account.name || vendor.kycInfo?.directorName || "Applicant not provided"}</span>
                  <span className="inline-flex items-center gap-2"><Mail size={14} /> {account.email || "Email not provided"}</span>
                  {vendor.kycInfo?.contactNumber && <span className="inline-flex items-center gap-2"><Phone size={14} /> {vendor.kycInfo.contactNumber}</span>}
                </div>
              </div>
            </div>
            <div className="min-w-[220px]">
              <div className="flex justify-between text-xs text-white/45"><span>Onboarding progress</span><span>{onboarding.percent}%</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#c9a35b]" style={{ width: `${onboarding.percent}%` }} /></div>
              <p className="mt-2 text-right text-[10px] uppercase tracking-[0.12em] text-white/30">{onboarding.label} · Step {onboarding.current} of {onboarding.total}</p>
            </div>
          </div>
        </header>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={PackageCheck} label="Progress">{onboarding.percent}% complete</SummaryCard>
          <SummaryCard icon={CircleDollarSign} label="Subscription">
            <span className="capitalize text-xs">
              {vendor.couponUsed ? (
                <>1 month free ends on {formatDate(new Date(new Date(vendor.createdAt).setMonth(new Date(vendor.createdAt).getMonth() + 1)))}. After that, payment is required.</>
              ) : (
                <span className="text-sm">{vendor.paymentStatus || "Unpaid"}</span>
              )}
            </span>
          </SummaryCard>
          <SummaryCard icon={Banknote} label="Registration fee">R {Number(vendor.registrationFee || 0).toLocaleString()}</SummaryCard>
          <SummaryCard icon={CalendarDays} label="Application created">{formatDate(vendor.createdAt)}</SummaryCard>
        </div>

        {(error || message) && (
          <div className={`mt-4 flex items-start gap-3 rounded-lg border p-4 text-sm ${error ? "border-red-500/20 bg-red-500/10 text-red-100" : "border-emerald-500/20 bg-emerald-500/10 text-emerald-100"}`}>
            {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}{error || message}
          </div>
        )}

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="space-y-5">
            <Section icon={Building2} title="Business information" description="Company identity and registered address">
              <Fields items={[
                { label: "Legal name", value: business.legalName }, { label: "Trading name", value: business.tradingName },
                { label: "Registration number", value: business.registrationNumber }, { label: "Business type", value: business.businessType },
                { label: "Address", value: [address.street, address.city, address.province, address.postalCode, address.country].filter(Boolean).join(", "), wide: true },
              ]} />
            </Section>

            <Section icon={UserRound} title="Applicant & identity" description="Director contact and KYC details">
              <Fields items={[
                { label: "Account holder", value: account.name }, { label: "Account email", value: account.email },
                { label: "Director / representative", value: vendor.kycInfo?.directorName }, { label: "Contact number", value: vendor.kycInfo?.contactNumber },
                { label: "Identity number", value: vendor.kycInfo?.idNumber }, { label: "Email verified", value: account.isEmailVerified },
              ]} />
            </Section>

            <Section icon={ShieldCheck} title="Tax & licence" description="Compliance information supplied during registration">
              <Fields items={[
                { label: "Tax number", value: vendor.taxInfo?.taxNumber }, { label: "VAT number", value: vendor.taxInfo?.vatNumber },
                { label: "Licence number", value: vendor.licenceInfo?.licenceNumber }, { label: "Licence type", value: vendor.licenceInfo?.licenceType },
                { label: "Licence expiry", value: formatDate(vendor.licenceInfo?.expiryDate) }, { label: "Export code", value: vendor.customsInfo?.exportCode },
              ]} />
            </Section>

            <Section icon={Landmark} title="Banking information" description="Payout account supplied by the applicant">
              <Fields items={[
                { label: "Bank", value: vendor.bankingInfo?.bankName }, { label: "Account name", value: vendor.bankingInfo?.accountName },
                { label: "Account number", value: vendor.bankingInfo?.accountNumber }, { label: "Branch code", value: vendor.bankingInfo?.branchCode },
                { label: "SWIFT code", value: vendor.bankingInfo?.swiftCode }, { label: "Payout preference", value: vendor.bankingInfo?.payoutPreference },
              ]} />
            </Section>

            <Section icon={Truck} title="Products & fulfilment" description="What the vendor sells and how orders will be handled">
              <Fields items={[
                { label: "Product categories", value: vendor.productCategories, wide: true },
                { label: "Fulfilment method", value: vendor.deliveryInfo?.fulfillmentMethod }, { label: "Dispatch location", value: vendor.deliveryInfo?.dispatchLocation },
                { label: "Dispatch days", value: vendor.deliveryInfo?.dispatchDays }, { label: "Cut-off time", value: vendor.deliveryInfo?.cutoffTime },
                { label: "Processing time", value: vendor.deliveryInfo?.processingTime }, { label: "Handling time", value: vendor.shippingProfile?.handlingTimeDays ? `${vendor.shippingProfile.handlingTimeDays} days` : null },
                { label: "Pickup address", value: [pickup.street, pickup.city, pickup.postal, pickup.country].filter(Boolean).join(", "), wide: true },
                { label: "Free delivery threshold", value: vendor.shippingProfile?.freeDeliveryThreshold }, { label: "Default weight", value: vendor.shippingProfile?.defaultWeight },
              ]} />
            </Section>

            {vendor.vendorType === "international" && (
              <Section icon={Globe2} title="International operations" description="Export credentials, target markets and logistics partners">
                <Fields items={[
                  { label: "Export licence number", value: vendor.credentialsInfo?.exportLicenceNumber }, { label: "Target regions", value: vendor.marketInfo?.targetRegions },
                  { label: "Current importer", value: vendor.logisticsInfo?.currentImporter }, { label: "Freight forwarder", value: vendor.logisticsInfo?.freightForwarder },
                ]} />
              </Section>
            )}

            <Section icon={FileCheck2} title="Uploaded documents" description="Open each source document in a separate tab">
              <div className="grid gap-3 sm:grid-cols-2">{documents.map(([label, url]) => <DocumentLink key={label} label={label} url={url} />)}</div>
            </Section>

            {(vendor.storyInfo?.winemakerBio || vendor.storyInfo?.brandStory || vendor.storyInfo?.wineryPhotosUrl) && (
              <Section icon={BadgeCheck} title="Brand story" description="Public-facing story supplied by the vendor">
                <Fields items={[
                  { label: "Winemaker biography", value: vendor.storyInfo?.winemakerBio, wide: true },
                  { label: "Brand story", value: vendor.storyInfo?.brandStory, wide: true },
                  { label: "Winery photos", value: vendor.storyInfo?.wineryPhotosUrl, wide: true },
                ]} />
              </Section>
            )}
          </main>

          <aside className="space-y-5 xl:sticky xl:top-6">
            <section className="rounded-xl border border-[#c9a35b]/25 bg-[#12110e] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c9a35b]">Application decision</p>
              <h2 className="mt-2 font-serif text-2xl font-semibold">Review controls</h2>
              <p className="mt-2 text-xs leading-5 text-white/40">Status changes notify the applicant by email where applicable.</p>

              {vendor.status !== "approved" && (
                <div className="mt-5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Registration fee (ZAR)</label>
                  <input type="number" min="0" value={fee} onChange={(event) => setFee(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm outline-none focus:border-[#c9a35b]" />
                  <button disabled={Boolean(working)} onClick={() => updateStatus("approved")} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#d2ad5f] px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-black transition hover:bg-[#e2c275] disabled:opacity-50">
                    <Check size={16} /> {working === "approved" ? "Approving..." : "Approve vendor"}
                  </button>
                </div>
              )}

              {vendor.status !== "rejected" && (
                <div className="mt-5 border-t border-white/10 pt-5">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Rejection reason</label>
                  <textarea rows="3" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain what needs attention..." className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-black/30 px-3 py-3 text-sm outline-none placeholder:text-white/20 focus:border-red-400/60" />
                  <button disabled={Boolean(working)} onClick={() => updateStatus("rejected")} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-500/35 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-red-300 hover:bg-red-500/10 disabled:opacity-50">
                    <X size={16} /> {working === "rejected" ? "Rejecting..." : "Reject application"}
                  </button>
                </div>
              )}

              <div className="mt-5 grid gap-2 border-t border-white/10 pt-5">
                {vendor.status !== "pending_approval" && <button disabled={Boolean(working)} onClick={() => updateStatus("pending_approval")} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-xs font-semibold text-white/65 hover:bg-white/5"><RefreshCw size={14} /> Return to review</button>}
                {vendor.status !== "suspended" && <button disabled={Boolean(working)} onClick={() => updateStatus("suspended")} className="inline-flex items-center justify-center gap-2 rounded-lg border border-orange-500/25 px-3 py-2.5 text-xs font-semibold text-orange-200/80 hover:bg-orange-500/10"><Clock3 size={14} /> Suspend vendor</button>}
              </div>
            </section>

            {vendor.status === "approved" && vendor.paymentStatus !== "paid" && (
              <section className="rounded-xl border border-white/10 bg-[#101010] p-5">
                <div className="flex items-center gap-2 text-sm font-semibold"><Mail size={17} className="text-[#c9a35b]" /> Registration payment</div>
                <p className="mt-2 text-xs leading-5 text-white/40">The approved vendor has not completed the registration payment.</p>
                <button disabled={Boolean(working)} onClick={sendPaymentReminder} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#c9a35b]/30 px-3 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[#d5b46c] hover:bg-[#c9a35b]/10 disabled:opacity-50">
                  <Send size={14} /> {working === "reminder" ? "Sending..." : "Send payment reminder"}
                </button>
                {vendor.paymentReminderSent && <p className="mt-3 text-center text-[10px] uppercase tracking-[0.12em] text-emerald-300/70">A reminder has already been sent</p>}
              </section>
            )}

            <section className="rounded-xl border border-white/10 bg-[#101010] p-5">
              <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck size={17} className="text-[#c9a35b]" /> Verification overview</div>
              <div className="mt-4 space-y-3">
                {Object.entries(vendor.verificationScore || {}).map(([key, verified]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="capitalize text-white/55">{key}</span>
                    <span className={`inline-flex items-center gap-1.5 ${verified ? "text-emerald-300" : "text-white/30"}`}>{verified ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}{verified ? "Verified" : "Pending"}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-white/10 pt-4 text-[11px] leading-5 text-white/35">
                <p>Terms accepted: <span className="text-white/60">{show(vendor.agreements?.termsAccepted)}</span></p>
                <p>Information declared accurate: <span className="text-white/60">{show(vendor.agreements?.informationAccurate)}</span></p>
                <p>Accepted on: <span className="text-white/60">{formatDate(vendor.agreements?.acceptedAt, true)}</span></p>
                <p>Last updated: <span className="text-white/60">{formatDate(vendor.updatedAt, true)}</span></p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
