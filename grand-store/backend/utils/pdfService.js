const { jsPDF } = require("jspdf");
require("jspdf-autotable");
const fs = require("fs");
const path = require("path");

const generateOrderReceiptBuffer = async (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();
      const invoiceNo = order.invoiceNumber || order._id.toString();

      // --- THEME COLORS ---
      const themeColor = [15, 15, 15]; // Charcoal/Black
      const accentColor = [216, 183, 109]; // Grand Store Gold

      // Format price helper
      const formatPrice = (amount) => {
        return `R ${Number(amount).toFixed(2)}`;
      };

      const pdfPrice = (amount) => {
        return formatPrice(amount).replace(/\u00A0/g, ' ').replace(/[^\x20-\x7E]/g, '');
      };

      // --- LOGO Handling ---
      let logoData = null;
      let logoExt = 'PNG';
      try {
        const logoPath = path.join(__dirname, '../../frontend/public/logo.png');
        if (fs.existsSync(logoPath)) {
          const logoBuffer = fs.readFileSync(logoPath);
          logoData = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        }
      } catch (err) {
        console.warn("Could not load logo.png for PDF generation:", err);
      }

      // --- WATERMARK ---
      if (logoData) {
        doc.setGState(new doc.GState({ opacity: 0.04 }));
        doc.addImage(logoData, logoExt, 35, 133, 140, 30, 'logo', 'FAST');
        doc.setGState(new doc.GState({ opacity: 1.0 }));
      }

      // --- LOGO (Top Left) ---
      if (logoData) {
        doc.addImage(logoData, logoExt, 14, 15, 45, 15, 'logo', 'FAST');
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
      doc.text(new Date(order.createdAt || Date.now()).toLocaleDateString(), 196, 30, { align: "right" });
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
      
      const customerName = (user && user.name) || order.shippingAddress?.name || "Customer";
      const customerEmail = (user && user.email) || "";
      
      doc.text(customerName, 120, 55);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60);
      doc.text(customerEmail, 120, 60);
      
      // Wrap Address so it doesn't overflow page
      const addressLines = doc.splitTextToSize(order.shippingAddress?.address || "", 76);
      doc.text(addressLines, 120, 65);
      const addressOffset = 65 + (addressLines.length * 4.5); // line height spacing

      doc.text(`${order.shippingAddress?.city || ""}, ${order.shippingAddress?.postalCode || ""}`, 120, addressOffset);
      doc.text(order.shippingAddress?.country || "", 120, addressOffset + 5);

      // --- TABLE ---
      const tableData = (order.orderItems || []).map((item) => [
        item.name,
        pdfPrice(item.price),
        item.qty || item.quantity || 1,
        pdfPrice(item.price * (item.qty || item.quantity || 1)),
      ]);

      const tableStartY = Math.max(85, addressOffset + 15);

      const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');
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

      // Output as Node Buffer
      const buffer = Buffer.from(doc.output('arraybuffer'));
      resolve(buffer);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateOrderReceiptBuffer
};
