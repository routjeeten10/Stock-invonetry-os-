import { useEffect, useState } from 'react';
import { getStats, getOrders } from '../utils/api';
import { Package, Users, ShoppingCart, DollarSign, AlertTriangle, Clock } from 'lucide-react';

const STATUS_COLORS = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  shipped: 'badge-shipped',
  delivered: 'badge-delivered',
  cancelled: 'badge-cancelled',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getOrders()])
      .then(([s, o]) => {
        setStats(s.data);
        setRecentOrders(o.data.slice(0, 8));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <>
      <div className="topbar"><span className="topbar-title">Dashboard</span></div>
      <div className="page-content"><div className="loading-wrap"><div className="spinner" /></div></div>
    </>
  );

  const cards = [
    { label: 'Total Products', value: stats.total_products, icon: Package, color: '' },
    { label: 'Total Customers', value: stats.total_customers, icon: Users, color: 'green' },
    { label: 'Total Orders', value: stats.total_orders, icon: ShoppingCart, color: 'purple' },
    { label: 'Total Revenue', value: `$${stats.total_revenue.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'green' },
    { label: 'Low Stock Items', value: stats.low_stock_products, icon: AlertTriangle, color: 'red' },
    { label: 'Pending Orders', value: stats.pending_orders, icon: Clock, color: 'amber' },
  ];

  return (
    <>
      <div className="topbar"><span className="topbar-title">Dashboard</span></div>
      <div className="page-content">
        <div className="stat-grid">
          {cards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`stat-card ${color}`}>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
              <div className="stat-icon"><Icon size={36} /></div>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15 }}>Recent Orders</h3>
          </div>
          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart />
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td><span className="mono">#{String(order.id).padStart(4, '0')}</span></td>
                      <td>{order.customer?.name || `Customer #${order.customer_id}`}</td>
                      <td>{order.items?.length || 0} item(s)</td>
                      <td><span className="mono">${order.total_amount.toFixed(2)}</span></td>
                      <td><span className={`badge ${STATUS_COLORS[order.status]}`}>{order.status}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
