import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ChevronLeft, Download, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCurrency } from "../../context/CurrencyContext";
import Price from "../../components/ui/Price";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function OrderSuccessPage({ onClearCart }) {
  const { id } = useParams();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const [searchParams] = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    document.title = "Order Confirmation - The Grand Store";
    window.scrollTo({ top: 0, behavior: "auto" });

    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setOrder(data);
          if (paymentStatus === "success" && onClearCart) {
            onClearCart();
          }
        }
      } catch (error) {
        console.error("Error fetching order", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchOrder();
    }
  }, [id, user]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] flex items-center justify-center text-gold-gradient">
        Loading receipt...
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <h2>Order not found</h2>
        <Link to="/" className="text-gold-gradient mt-4">
          Return Home
        </Link>
      </main>
    );
  }

  const generatePDF = () => {
    setIsGenerating(true);
    const doc = new jsPDF();
    const invoiceNo = order.invoiceNumber || order._id;

    const buildPdfContent = (img) => {
      // Draw Logo
      if (img) {
        // Logo dimensions approx 260x56, scale to 45x12
        doc.addImage(img, "PNG", 14, 15, 45, 12);
      } else {
        doc.setFontSize(22);
        doc.setTextColor(0);
        doc.text("The Grand Store", 14, 22);
      }

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Premium Goods & Accessories", 14, 32);
      doc.text("VAT No: 123456789", 14, 38);

      // Invoice Details
      doc.setFontSize(10);
      doc.text("Invoice Number:", 140, 22);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.text(invoiceNo, 140, 28);
      
      doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.text("Date:", 140, 38);
      doc.setTextColor(0);
      doc.text(new Date(order.createdAt).toLocaleDateString(), 140, 44);

      // Addresses
      doc.setTextColor(100);
      doc.text("Billed To:", 14, 56);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.text(order.user?.name || "", 14, 62);
      doc.setFont("helvetica", "normal");
      doc.text(order.user?.email || "", 14, 68);

      doc.setTextColor(100);
      doc.text("Shipped To:", 100, 56);
      doc.setTextColor(0);
      doc.setFont("helvetica", "bold");
      doc.text(order.shippingAddress?.address || "", 100, 62);
      doc.setFont("helvetica", "normal");
      doc.text(`${order.shippingAddress?.city || ""}, ${order.shippingAddress?.postalCode || ""}`, 100, 68);
      doc.text(order.shippingAddress?.country || "", 100, 74);

      // Table
      const tableData = order.orderItems.map((item) => [
        item.name,
        item.qty || item.quantity || 1,
        formatPrice(item.price),
        formatPrice(item.price * (item.qty || item.quantity || 1)),
      ]);

      autoTable(doc, {
        startY: 85,
        head: [["Item", "Qty", "Price", "Total"]],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [10, 10, 10] },
      });

      const finalY = doc.lastAutoTable.finalY + 10;

      // Totals
      doc.text("Subtotal:", 140, finalY);
      doc.text(formatPrice(order.totalPrice - order.shippingCost), 180, finalY, { align: "right" });

      doc.text("Shipping:", 140, finalY + 8);
      doc.text(order.shippingCost === 0 ? "Complimentary" : formatPrice(order.shippingCost), 180, finalY + 8, { align: "right" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Total:", 140, finalY + 18);
      doc.text(formatPrice(order.totalPrice), 180, finalY + 18, { align: "right" });

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.text(`Payment Method: ${order.paymentMethod}`, 14, finalY + 18);

      doc.save(`${invoiceNo}_Receipt.pdf`);
      setIsGenerating(false);
    };

    // Load Logo image
    const img = new Image();
    img.src = "/logo.png";
    img.onload = () => {
      buildPdfContent(img);
    };
    img.onerror = () => {
      buildPdfContent(null);
    };
  };

  return (
    <main className="min-h-screen bg-[#050505] text-[var(--color-ivory)] pt-0 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Success Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-[var(--color-gold)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-gold-gradient" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">
            Order Placed Successfully
          </h1>

          {paymentStatus === "success" ? (
            <div className="inline-block px-4 py-2 bg-green-900/30 border border-green-500/50 rounded-lg text-green-400 font-medium mb-4">
              Payment completed successfully via PayFast.
            </div>
          ) : paymentStatus === "cancel" ? (
            <div className="inline-block px-4 py-2 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 font-medium mb-4">
              Payment was cancelled. You can retry payment from your account dashboard.
            </div>
          ) : order.paymentMethod === "Bank Transfer" &&
            order.paymentStatus === "Pending" ? (
            <div className="inline-block px-4 py-2 bg-yellow-900/30 border border-yellow-500/50 rounded-lg text-yellow-400 font-medium mb-4">
              Awaiting Bank Transfer. Please upload proof of payment below.
            </div>
          ) : order.paymentMethod === "Bank Transfer" &&
            order.paymentStatus === "Awaiting_Approval" ? (
            <div className="inline-block px-4 py-2 bg-blue-900/30 border border-blue-500/50 rounded-lg text-blue-400 font-medium mb-4">
              Proof of Payment Uploaded. Awaiting verification by our team.
            </div>
          ) : order.paymentMethod === "Bank Transfer" &&
            (order.paymentStatus === "Failed" ||
              order.paymentStatus === "Rejected") ? (
            <div className="inline-block px-4 py-2 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 font-medium mb-4">
              Your previous proof of payment was rejected. Please review and resubmit below.
            </div>
          ) : (
            <p className="text-[var(--color-ivory-muted)]">
              Thank you for your purchase. Your order is being processed.
            </p>
          )}
        </div>

        {/* Bank Transfer Upload Form */}
        {order.paymentMethod === "Bank Transfer" &&
          (order.paymentStatus === "Pending" ||
            order.paymentStatus === "Failed" ||
            order.paymentStatus === "Rejected") && (
            <div className="bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-[var(--color-gold)]/20 shadow-[0_0_30px_rgba(212,175,55,0.05)] rounded-2xl p-8 md:p-12 mb-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-gold)]/5 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-serif text-[var(--color-gold)] mb-2">
                  Upload Proof of Payment
                </h3>
                <p className="text-sm text-[var(--color-ivory-muted)] mb-6">
                  Please transfer exactly{" "}
                  <strong className="text-white">
                    <Price amount={order.totalPrice} />
                  </strong>{" "}
                  to our bank account.
                </p>

                <div className="bg-black/50 border border-white/5 p-6 rounded-xl text-left max-w-sm mx-auto mb-6">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Bank Name
                  </p>
                  <p className="text-sm text-white mb-3">Standard Bank</p>

                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Account Name
                  </p>
                  <p className="text-sm text-white mb-3">
                    The Grand Store PTY LTD
                  </p>

                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Account Number
                  </p>
                  <p className="text-sm text-white font-mono mb-3">
                    0123456789
                  </p>

                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Branch Code
                  </p>
                  <p className="text-sm text-white font-mono mb-3">051001</p>

                  <p className="text-xs text-[var(--color-gold)] uppercase tracking-widest mb-1">
                    Reference
                  </p>
                  <p className="text-lg text-white font-mono font-bold">
                    {(order.invoiceNumber || order._id).slice(-6).toUpperCase()}
                  </p>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const url = e.target.proofUrl.value;
                    if (!url) return;
                    try {
                      const res = await fetch(
                        `${import.meta.env.VITE_API_URL}/api/orders/${order._id}/bank-transfer/upload`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${user.token}`,
                          },
                          body: JSON.stringify({ proofUrl: url }),
                        }
                      );
                      if (res.ok) {
                        window.location.reload();
                      } else {
                        const data = await res.json();
                        alert(data.message || "Failed to upload proof");
                      }
                    } catch (err) {
                      console.error(err);
                      alert("Network Error");
                    }
                  }}
                  className="max-w-sm mx-auto text-left"
                >
                  <label className="block text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">
                    Proof of Payment URL (Image/PDF)
                  </label>
                  <input
                    name="proofUrl"
                    type="url"
                    required
                    placeholder="https://..."
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-gold)]/50 focus:outline-none transition-colors mb-4"
                  />

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#c9a35b] to-[#b58b38] text-black font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    Submit Proof
                  </button>
                </form>
              </div>
            </div>
          )}

        {/* Invoice Display for Screen */}
        {!(
          order.paymentMethod === "Bank Transfer" &&
          ["Pending", "Awaiting_Approval"].includes(order.paymentStatus)
        ) && (
          <>
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 md:p-12 relative">
              <div className="flex flex-col md:flex-row justify-between items-start border-b border-white/10 pb-8 mb-8">
                <div>
                  <img
                    src="/logo.png"
                    alt="The Grand Store"
                    className="h-10 w-auto mb-4"
                  />
                  <div className="text-sm text-[var(--color-ivory-muted)]">
                    Premium Goods & Accessories
                  </div>
                  <div className="text-xs text-[var(--color-ivory-muted)]/50 mt-1">
                    VAT No: 123456789
                  </div>
                </div>
                <div className="mt-6 md:mt-0 text-left md:text-right">
                  <div className="text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-1">
                    Invoice Number
                  </div>
                  <div className="font-mono text-white">
                    {order.invoiceNumber || order._id}
                  </div>
                  <div className="text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mt-4 mb-1">
                    Date
                  </div>
                  <div className="text-white">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 border-b border-white/10 pb-8">
                <div>
                  <div className="text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">
                    Billed To
                  </div>
                  <div className="text-sm text-white">{order.user?.name}</div>
                  <div className="text-sm text-[var(--color-ivory-muted)]">
                    {order.user?.email}
                  </div>
                </div>
                <div className="md:text-right">
                  <div className="text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-2">
                    Shipped To
                  </div>
                  <div className="text-sm text-white">
                    {order.shippingAddress?.address}
                  </div>
                  <div className="text-sm text-[var(--color-ivory-muted)]">
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.postalCode}
                  </div>
                  <div className="text-sm text-[var(--color-ivory-muted)]">
                    {order.shippingAddress?.country}
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-[var(--color-ivory-muted)]">
                      <th className="pb-3 font-normal uppercase tracking-widest text-xs">
                        Item
                      </th>
                      <th className="pb-3 font-normal uppercase tracking-widest text-xs text-right hidden md:table-cell">
                        Qty
                      </th>
                      <th className="pb-3 font-normal uppercase tracking-widest text-xs text-right">
                        Price
                      </th>
                      <th className="pb-3 font-normal uppercase tracking-widest text-xs text-right">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {order.orderItems?.map((item, index) => (
                      <tr key={index}>
                        <td className="py-4">
                          <div className="flex items-center gap-4">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-contain bg-white/[0.02] rounded border border-white/5"
                              />
                            )}
                            <div>
                              <div className="text-white font-medium">
                                {item.name}
                              </div>
                              {item.vendorName && (
                                <div className="text-xs text-gray-500">
                                  Sold by {item.vendorName}
                                </div>
                              )}
                              <div className="md:hidden text-[var(--color-ivory-muted)] mt-1">
                                Qty: {item.qty}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-right text-white hidden md:table-cell">
                          {item.qty || item.quantity}
                        </td>
                        <td className="py-4 text-right text-white">
                          <Price amount={item.price} />
                        </td>
                        <td className="py-4 text-right text-white">
                          <Price amount={item.price * (item.qty || item.quantity || 1)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end border-t border-white/10 pt-6">
                <div className="w-full md:w-64 space-y-2">
                  <div className="flex justify-between py-2 text-sm text-[var(--color-ivory-muted)]">
                    <span>Subtotal</span>
                    <span>
                      <Price amount={order.totalPrice - order.shippingCost} />
                    </span>
                  </div>
                  <div className="flex justify-between py-2 text-sm text-[var(--color-ivory-muted)] border-b border-white/10">
                    <span>Shipping</span>
                    <span>
                      {order.shippingCost === 0 ? (
                        "Complimentary"
                      ) : (
                        <Price amount={order.shippingCost} />
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-4 text-xl font-serif text-gold-gradient">
                    <span>Total</span>
                    <span>
                      <Price amount={order.totalPrice} />
                    </span>
                  </div>
                  <div className="flex justify-between py-2 text-xs text-[var(--color-ivory-muted)]">
                    <span>Payment Method</span>
                    <span>{order.paymentMethod} (Paid)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6">
              <Link
                to="/shop"
                className="text-sm uppercase tracking-widest hover:text-gold-gradient transition-colors flex items-center gap-2"
              >
                <ChevronLeft size={16} /> Continue Shopping
              </Link>
              <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl text-sm uppercase tracking-widest transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
                {isGenerating ? 'Generating PDF...' : 'Download Receipt (PDF)'}
              </button>
            </div>
          </>
        )}

        {order.paymentMethod !== "Bank Transfer" && (
          <div className="mt-8 text-center">
            <Link
              to="/customer/orders"
              className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-xl text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2 max-w-sm mx-auto"
            >
              View My Orders
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
