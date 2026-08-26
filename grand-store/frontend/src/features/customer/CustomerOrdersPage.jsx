import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { formatCartPrice } from "../../data";
import {
  LogOut,
  User,
  Package,
  Heart,
  Building2,
  Gavel,
  CheckCircle2,
  ChevronRight,
  Search,
} from "lucide-react";
import Price from "../../components/ui/Price";

export default function CustomerOrdersPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        try {
          const { data } = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/orders/myorders`,
            {
              headers: { Authorization: `Bearer ${user.token}` },
            },
          );
          setOrders(data);
        } catch (error) {
          console.error("Failed to fetch orders", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredOrders = orders.filter(
    (order) =>
      (order.invoiceNumber || order._id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.orderItems?.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  return (
    <div className="customer-orders-page w-full max-w-5xl mx-auto flex flex-col gap-6 md:gap-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 border-b border-white/10 pb-5 md:pb-6 mb-2 md:mb-10">
        <div>
          <h1 className="text-[var(--color-ivory)] font-serif text-3xl md:text-4xl mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <div className="p-2.5 md:p-3 bg-[var(--color-gold)]/10 text-gold-gradient rounded-xl border border-[var(--color-gold)]/20 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
              <Package size={24} className="md:w-7 md:h-7" />
            </div>
            Order{" "}
            <span className="text-gold-gradient text-3xl sm:text-4xl md:text-5xl font-normal drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              History
            </span>
          </h1>
          <p className="text-[var(--color-ivory-muted)] text-sm max-w-2xl font-light mt-2 md:mt-4 leading-relaxed">
            Review all your past purchases and trace your private collection
            history.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/10 rounded-full py-3 px-5 pl-10 text-sm text-[var(--color-ivory)] placeholder:text-[var(--color-ivory-muted)]/50 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors backdrop-blur-md"
          />
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ivory-muted)]"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-gold-gradient py-20 text-center flex flex-col items-center gap-4">
          <Package className="animate-pulse opacity-50" size={40} />
          <p>Retrieving your collection...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center py-20 border border-white/5 rounded-3xl bg-white/[0.01]">
          <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-6 shadow-inner">
            <Package
              size={32}
              className="text-[var(--color-ivory-muted)] opacity-30"
            />
          </div>
          <p className="text-[var(--color-ivory-muted)] mb-8 text-lg font-light">
            Your order history is empty.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="px-8 py-3 rounded-full border border-[var(--color-gold)]/50 text-gold-gradient hover:bg-gold-gradient hover:text-black transition-all uppercase tracking-widest text-xs font-bold shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            Explore the Collection
          </button>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white/[0.02] backdrop-blur-md border border-white/[0.07] hover:border-white/10 hover:bg-white/[0.04] transition-all rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
            >
              <div className="p-4 sm:p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 border-b border-white/[0.05]">
                <div className="min-w-0 w-full md:w-auto">
                  <div className="text-gold-gradient text-xs sm:text-sm tracking-wider sm:tracking-widest uppercase mb-2 font-bold truncate">
                    {order.invoiceNumber || order._id}
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--color-ivory-muted)] flex flex-wrap items-center gap-2 sm:gap-3">
                    <span>
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                    <span>
                      {order.orderItems?.length}{" "}
                      {order.orderItems?.length === 1 ? "Item" : "Items"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full md:w-auto sm:justify-between md:justify-end">
                  <div className="flex sm:block items-end justify-between text-left sm:text-right border-t border-white/5 sm:border-0 pt-3 sm:pt-0">
                    <div className="text-xs sm:text-sm text-[var(--color-ivory-muted)] mb-0 sm:mb-1">
                      Order Total
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-serif text-[var(--color-ivory)]">
                        <Price amount={order.totalPrice} />
                      </div>
                      <div
                        className={`text-[10px] sm:text-xs mt-1 font-bold tracking-widest uppercase ${
                        order.paymentStatus === "Pending" ||
                        order.paymentStatus === "Awaiting_Approval"
                          ? "text-blue-400"
                          : order.paymentStatus === "Failed" ||
                              order.paymentStatus === "Rejected"
                            ? "text-red-500"
                            : "text-gold-gradient"
                        }`}
                      >
                        {order.paymentStatus
                          ? order.paymentStatus.replace("_", " ")
                          : "Processing"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/customer/order/${order._id}`)}
                    className="w-full sm:w-auto min-h-11 px-5 sm:px-6 py-3 rounded-xl sm:rounded-full bg-[var(--color-gold)]/10 text-gold-gradient border border-[var(--color-gold)]/20 hover:bg-gold-gradient hover:text-black transition-colors text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    {order.paymentMethod === "Bank Transfer" &&
                    order.paymentStatus === "Pending"
                      ? "Complete Payment"
                      : order.paymentMethod === "Bank Transfer" &&
                          order.paymentStatus === "Awaiting_Approval"
                        ? "View Status"
                        : order.paymentMethod === "Bank Transfer" &&
                            (order.paymentStatus === "Failed" ||
                              order.paymentStatus === "Rejected")
                          ? "Resubmit Proof"
                          : "View Receipt"}
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-6 md:px-8 bg-black/20">
                <div className="grid grid-cols-1 md:flex gap-3 md:gap-4 md:overflow-x-auto custom-scrollbar md:pb-2">
                  {order.orderItems?.map((item, idx) => (
                    <div
                      key={idx}
                      className="w-full md:w-64 md:flex-shrink-0 bg-white/[0.025] border border-white/[0.07] rounded-xl p-3 sm:p-4 flex gap-3 sm:gap-4 items-center"
                    >
                      <div className="w-14 h-16 sm:w-16 sm:h-16 rounded-lg bg-black border border-white/10 flex items-center justify-center overflow-hidden shrink-0 p-1">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full object-contain"
                          />
                        ) : (
                          <Package size={20} className="text-gold-gradient" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-[var(--color-ivory)] font-medium truncate">
                          {item.name}
                        </div>
                        {item.option && (
                          <div className="text-xs text-[var(--color-ivory-muted)] mt-1 truncate">
                            {item.option}
                          </div>
                        )}
                        <div className="text-xs text-gold-gradient mt-2 font-bold">
                          Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
