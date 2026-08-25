import React, { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ChevronLeft, Download, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCurrency } from "../../context/CurrencyContext";
import Price from "../../components/ui/Price";
import api from "../../api";
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
        const res = await api.get(`/orders/${id}`);
        const data = res.data;
        setOrder(data);
        if (paymentStatus === "success" && onClearCart) {
          onClearCart();
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
      // --- THEME COLORS ---
      const themeColor = [15, 15, 15]; // Charcoal/Black
      const accentColor = [216, 183, 109]; // Grand Store Gold

      // --- WATERMARK ---
      if (img) {
        doc.setGState(new doc.GState({ opacity: 0.04 }));
        doc.addImage(img, "PNG", 35, 133, 140, 30);
        doc.setGState(new doc.GState({ opacity: 1.0 }));
      }

      // --- LOGO (Top Left) ---
      if (img) {
        // Fix squeezing by calculating aspect ratio
        const ratio = img.height / img.width;
        const targetWidth = 45;
        const targetHeight = targetWidth * ratio;
        doc.addImage(img, "PNG", 14, 15, targetWidth, targetHeight);
      } else {
        doc.setFont("times", "bold");
        doc.setFontSize(22);
        doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
        doc.text("THE GRAND STORE", 14, 25);
      }

      // --- HEADER (Top Right) ---
      doc.setFont("times", "bold");
      doc.setFontSize(26);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]); // Gold
      doc.text("INVOICE", 196, 24, { align: "right" });
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(new Date(order.createdAt).toLocaleDateString(), 196, 30, { align: "right" });
      doc.text(`Ref: #${invoiceNo.toUpperCase()}`, 196, 35, { align: "right" });

      // --- ADDRESSES ---
      // Left: Store Address
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(0);
      doc.text("Office Address", 14, 50);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60);
      doc.text("The Grand Store", 14, 55);
      doc.text("Premium Goods & Accessories", 14, 60);
      doc.text("VAT No: 123456789", 14, 65);

      // Right: Customer Address
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("To :", 120, 50);
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text(order.user?.name || "Customer", 120, 55);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60);
      doc.text(order.user?.email || "", 120, 60);
      
      // Wrap Address so it doesn't overflow page
      const addressLines = doc.splitTextToSize(order.shippingAddress?.address || "", 76);
      doc.text(addressLines, 120, 65);
      const addressOffset = 65 + (addressLines.length * 4.5); // line height spacing

      doc.text(`${order.shippingAddress?.city || ""}, ${order.shippingAddress?.postalCode || ""}`, 120, addressOffset);
      doc.text(order.shippingAddress?.country || "", 120, addressOffset + 5);

      // --- CURRENCY HELPER ---
      const pdfPrice = (amount) => {
        return formatPrice(amount).replace(/\u00A0/g, ' ').replace(/[^\x20-\x7E]/g, '');
      };

      // --- TABLE ---
      const tableData = order.orderItems.map((item) => [
        item.name,
        pdfPrice(item.price),
        item.qty || item.quantity || 1,
        pdfPrice(item.price * (item.qty || item.quantity || 1)),
      ]);

      const tableStartY = Math.max(85, addressOffset + 15);

      autoTable(doc, {
        startY: tableStartY,
        head: [["Items Description", "Unit Price", "Qnt", "Total"]],
        body: tableData,
        theme: "plain",
        styles: {
          font: "helvetica",
          fontSize: 9,
          textColor: [0, 0, 0],
          cellPadding: { top: 6, right: 4, bottom: 6, left: 4 },
        },
        headStyles: { 
          fillColor: themeColor,
          textColor: accentColor,
          font: "times",
          fontStyle: "bold",
        },
        bodyStyles: {
          lineWidth: { bottom: 0.5 },
          lineColor: [200, 200, 200],
        },
        columnStyles: {
          0: { cellWidth: 'auto', fontStyle: 'bold' },
          1: { halign: 'center' },
          2: { halign: 'center' },
          3: { halign: 'right' },
        }
      });

      const finalY = doc.lastAutoTable.finalY + 10;

      // --- NOTES (Left) ---
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("Note:", 14, finalY + 5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      doc.text("Payment Method:", 14, finalY + 10);
      doc.text(order.paymentMethod || "N/A", 14, finalY + 15);

      // --- TOTALS (Right) ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(0);
      doc.text("SUBTOTAL :", 150, finalY + 5, { align: "right" });
      doc.text(pdfPrice(order.totalPrice - order.shippingCost), 196, finalY + 5, { align: "right" });

      doc.text("SHIPPING :", 150, finalY + 12, { align: "right" });
      doc.text(order.shippingCost === 0 ? "Complimentary" : pdfPrice(order.shippingCost), 196, finalY + 12, { align: "right" });

      // TOTAL BLOCK
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.rect(120, finalY + 18, 80, 12, "F");

      doc.setFont("times", "bold");
      doc.setFontSize(11);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text("TOTAL DUE :", 130, finalY + 26);
      doc.setTextColor(255, 255, 255);
      doc.text(pdfPrice(order.totalPrice), 196, finalY + 26, { align: "right" });

      // --- THANK YOU ---
      doc.setFontSize(14);
      doc.setFont("times", "bold");
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text("Thank you for your Business", 14, finalY + 45);

      // --- FOOTER DIVIDER ---
      const pageHeight = doc.internal.pageSize.height;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(14, pageHeight - 35, 196, pageHeight - 35);

      // --- FOOTER 3 COLUMNS ---
      doc.setFontSize(8);
      
      // Col 1
      doc.setFont("helvetica", "bold");
      doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.text("Questions?", 14, pageHeight - 25);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      doc.text("Email    : info@grandstore.com", 14, pageHeight - 20);
      doc.text("Call us  : +1 234 567 890", 14, pageHeight - 15);

      // Col 2
      doc.setFont("helvetica", "bold");
      doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.text("Payment Info :", 85, pageHeight - 25);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      doc.text(`Method   : ${order.paymentMethod}`, 85, pageHeight - 20);
      doc.text(`Status   : ${order.paymentStatus}`, 85, pageHeight - 15);

      // Col 3
      doc.setFont("helvetica", "bold");
      doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.text("Terms & Conditions/Note:", 145, pageHeight - 25);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(80);
      doc.text("All sales are final.", 145, pageHeight - 20);
      doc.text("Keep this receipt for your records.", 145, pageHeight - 15);

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
              Payment was cancelled. You can retry payment from your account
              dashboard.
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
              Your previous proof of payment was rejected. Please review and
              resubmit below.
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
                      await api.post(`/orders/${order._id}/bank-transfer/upload`, { proofUrl: url });
                      window.location.reload();
                    } catch (error) {
                      alert(error.response?.data?.message || "Failed to upload proof");
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
                    className="h-10 w-auto object-contain mb-4"
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
                          <Price
                            amount={
                              item.price * (item.qty || item.quantity || 1)
                            }
                          />
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
                {isGenerating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                {isGenerating ? "Generating PDF..." : "Download Receipt (PDF)"}
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
