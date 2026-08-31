import React, { useEffect, useState } from "react";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import {
  ShoppingBag,
  Package,
  MapPin,
  Search,
  Truck,
} from "lucide-react";
import { formatCartPrice } from "../../data";
import Price from '../../components/ui/Price';

const SHIPMENT_STATUSES = [
  'Order Confirmed',
  'Preparing',
  'Collected',
  'In Transit',
  'Out for Delivery',
  'Delivered',
  'Delayed',
  'Failed',
];

export default function AdminOrders() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await api.get(`/orders/vendor/sales`);
        setShipments(res.data);
      } catch (error) {
        console.error("Failed to fetch retail orders", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchSales();
    }
  }, [user]);

  const updateStatus = async (shipmentId, status) => {
    try {
      setUpdatingId(shipmentId);
      const res = await api.patch(`/orders/vendor/sales/${shipmentId}/status`, { status });
      const data = res.data;
      setShipments((current) => current.map((shipment) => (
        shipment._id === shipmentId ? { ...shipment, status: data.status } : shipment
      )));
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to update shipment';
      alert(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const goldTextClass =
    "text-[#c9a35b] ";
  const filteredShipments = shipments.filter(
    (shp) =>
      (shp.shipmentId || shp._id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (shp.customerName || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-[var(--color-ivory)] font-serif text-4xl mb-2 flex items-center gap-4">
            <div className="p-3 bg-[var(--color-gold)]/10 text-[#e1bd70] rounded-xl border border-[var(--color-gold)]/20 ">
              <ShoppingBag size={28} />
            </div>
            Retail{" "}
            <span className={`${goldTextClass} ml-2`}>Order History</span>
          </h1>
          <p className="text-[var(--color-ivory-muted)] text-sm max-w-2xl font-light">
            Review Grand Store retail shipments and update their fulfilment status.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search by Shipment ID or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-full py-3 px-5 pl-10 text-sm text-[var(--color-ivory)] placeholder:text-[var(--color-ivory-muted)]/50 focus:outline-none focus:border-[var(--color-gold)]/50 transition-colors"
          />
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ivory-muted)]"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-[#e1bd70] p-10 text-center">
          Loading your shipments...
        </div>
      ) : filteredShipments.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/[0.01]">
          <Truck
            size={48}
            className="mx-auto mb-4 text-[var(--color-ivory-muted)] opacity-20"
          />
          <p className="text-[var(--color-ivory-muted)] text-lg">
            No shipments found.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="space-y-6">
            {filteredShipments.map((shp) => (
              <div
                key={shp._id}
                className="bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden transition-all"
              >
                {/* Shipment Header */}
                <div className="bg-black/40 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 gap-4">
                  <div className="flex flex-col md:flex-row gap-2 md:gap-8">
                    <div>
                      <div className="text-[10px] text-[var(--color-ivory-muted)] uppercase tracking-widest mb-1">
                        Shipment ID
                      </div>
                      <div className="text-sm text-[#e1bd70] font-bold">
                        {shp.shipmentId || shp._id}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--color-ivory-muted)] uppercase tracking-widest mb-1">
                        Date
                      </div>
                      <div className="text-sm text-[var(--color-ivory)] font-serif">
                        {new Date(shp.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--color-ivory-muted)] uppercase tracking-widest mb-1">
                        Status
                      </div>
                      <select
                        value={shp.status}
                        disabled={updatingId === shp._id}
                        onChange={(event) => updateStatus(shp._id, event.target.value)}
                        className="text-xs text-[var(--color-ivory)] bg-[#15130f] px-3 py-2 rounded border border-[var(--color-gold)]/25 outline-none disabled:opacity-50"
                        aria-label={`Shipment status for ${shp.shipmentId}`}
                      >
                        {SHIPMENT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-[10px] text-[var(--color-ivory-muted)] uppercase tracking-widest mb-1">
                      Products Total
                    </div>
                    <div className="text-xl font-serif text-[#e1bd70]">
                      <Price amount={shp.vendorTotal} />
                    </div>
                  </div>
                </div>

                {/* Order Details Body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Customer Info */}
                  <div className="col-span-1 border-r border-white/5 pr-4">
                    <h4 className="text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-4 flex items-center gap-2">
                      <MapPin size={14} className="text-[#e1bd70]" />{" "}
                      Shipping Details
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-[var(--color-ivory)]">
                        {shp.customerName}
                      </p>
                      <p className="text-xs text-[var(--color-ivory-muted)]">
                        Courier: {shp.courierName}
                      </p>
                    </div>

                    {shp.deliveryAddress ? (
                      <div className="mt-4 text-sm text-[var(--color-ivory-muted)] leading-relaxed">
                        {shp.deliveryAddress.address}
                        <br />
                        {shp.deliveryAddress.city},{" "}
                        {shp.deliveryAddress.postalCode}
                        <br />
                        {shp.deliveryAddress.country}
                      </div>
                    ) : (
                      <div className="mt-4 text-xs italic text-[var(--color-ivory-muted)] opacity-50">
                        No shipping address provided
                      </div>
                    )}

                    {shp.trackingNumber && (
                      <div className="mt-4 p-3 bg-white/5 rounded border border-white/10">
                        <p className="text-xs text-[var(--color-ivory-muted)] uppercase tracking-widest mb-1">
                          Tracking Number
                        </p>
                        <p className="text-sm text-gold font-mono">
                          {shp.trackingNumber}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="col-span-1 md:col-span-2">
                    <h4 className="text-xs uppercase tracking-widest text-[var(--color-ivory-muted)] mb-4 flex items-center gap-2">
                      <Package size={14} className="text-[#e1bd70]" />{" "}
                      Products to Pack
                    </h4>
                    <div className="space-y-4">
                      {shp.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 last:pb-0"
                        >
                          <div className="flex gap-4 items-center">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 object-contain bg-black rounded border border-white/10 p-1"
                              />
                            )}
                            <div>
                              <p className="text-sm font-serif text-[var(--color-ivory)]">
                                {item.name}
                              </p>
                              {item.option && (
                                <p className="text-xs text-[var(--color-ivory-muted)] mt-1">
                                  {item.option}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-[var(--color-ivory)]">
                              {item.quantity} × <Price amount={item.price} />
                            </div>
                            <div className="text-xs font-bold text-[#e1bd70] mt-1">
                              <Price amount={item.price * item.quantity} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
