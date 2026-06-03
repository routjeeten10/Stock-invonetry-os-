import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, ShoppingCart, Trash2, ChevronDown } from 'lucide-react';
import { getOrders, createOrder, updateOrderStatus, getProducts, getCustomers } from '../utils/api';

const STATUS_COLORS = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  shipped: 'badge-shipped',
  delivered: 'badge-delivered',
  cancelled: 'badge-cancelled',
};

const ALL_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [saving, setSaving] = useState(false);

  // New order form state
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);
  const [notes, setNotes] = useState('');

  const load = () => {
    setLoading(true);
    getOrders(filterStatus || undefined).then(r => setOrders(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus]);

  const openCreate = async () => {
    const [p, c] = await Promise.all([getProducts(), getCustomers()]);
    setProducts(p.data);
    setCustomers(c.data);
    setSelectedCustomer('');
    setOrderItems([{ product_id: '', quantity: 1 }]);
    setNotes('');
    setShowModal(true);
  };

  const addItem = () => setOrderItems([...orderItems, { product_id: '', quantity: 1 }]);
  const removeItem = (i) => setOrderItems(orderItems.filter((_, idx) => idx !== i));
  const updateItem = (i, field, value) => {
    const next = [...orderItems];
    next[i] = { ...next[i], [field]: value };
    setOrderItems(next);
  };

  const calcTotal = () => {
    return orderItems.reduce((sum, item) => {
      const p = products.find(p => String(p.id) === String(item.product_id));
      return sum + (p ? p.price * (parseInt(item.quantity) || 0) : 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validItems = orderItems.filter(i => i.product_id && i.quantity > 0);
    if (!validItems.length) return toast.error('Add at least one item');
    setSaving(true);
    try {
      await createOrder({
        customer_id: parseInt(selectedCustomer),
        items: validItems.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })),
        notes,
      });
      toast.success('Order created');
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error creating order');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success(`Order marked as ${status}`);
      load();
      if (showDetail) setShowDetail({ ...showDetail, status });
    } catch {
      toast.error('Could not update status');
    }
  };

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    return (
      String(o.id).includes(q) ||
      (o.customer?.name || '').toLowerCase().includes(q) ||
      o.status.includes(q)
    );
  });

  return (
    <>
      <div className="topbar">
        <span className="topbar-title">Orders</span>
      </div>
      <div className="page-content">
        <div className="page-header">
          <h2>Order Management</h2>
          <div className="page-header-actions">
            <div className="search-wrap">
              <Search />
              <input className="search-input" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '7px 12px' }}
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> New Order</button>
          </div>
        </div>

        <div className="card">
          {loading ? <div className="loading-wrap"><div className="spinner" /></div> : filtered.length === 0 ? (
            <div className="empty-state"><ShoppingCart /><p>No orders found</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(o => (
                    <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => setShowDetail(o)}>
                      <td><span className="mono">#{String(o.id).padStart(4, '0')}</span></td>
                      <td style={{ fontWeight: 500 }}>{o.customer?.name || `#${o.customer_id}`}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{o.items?.length || 0}</td>
                      <td><span className="mono">${o.total_amount.toFixed(2)}</span></td>
                      <td><span className={`badge ${STATUS_COLORS[o.status]}`}>{o.status}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(o.created_at).toLocaleDateString()}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <select
                          className="form-control"
                          style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
                          value={o.status}
                          onChange={e => handleStatusChange(o.id, e.target.value)}
                        >
                          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Order</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Customer *</label>
                  <select className="form-control" required value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
                    <option value="">Select customer…</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.email}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="form-label" style={{ margin: 0 }}>Order Items *</label>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addItem}><Plus size={12} /> Add Item</button>
                </div>

                {orderItems.map((item, i) => {
                  const prod = products.find(p => String(p.id) === String(item.product_id));
                  return (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px auto', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                      <select
                        className="form-control"
                        value={item.product_id}
                        onChange={e => updateItem(i, 'product_id', e.target.value)}
                      >
                        <option value="">Select product…</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id} disabled={p.stock_quantity === 0}>
                            {p.name} (${p.price.toFixed(2)}) — Stock: {p.stock_quantity}
                          </option>
                        ))}
                      </select>
                      <input
                        className="form-control"
                        type="number"
                        min="1"
                        max={prod?.stock_quantity || 9999}
                        value={item.quantity}
                        onChange={e => updateItem(i, 'quantity', e.target.value)}
                      />
                      {orderItems.length > 1 && (
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(i)}><Trash2 size={12} /></button>
                      )}
                    </div>
                  );
                })}

                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Notes</label>
                  <input className="form-control" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional order notes" />
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
                  <span className="mono" style={{ fontSize: 15, color: 'var(--text)' }}>
                    Total: ${calcTotal().toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Placing…' : 'Place Order'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{String(showDetail.id).padStart(4, '0')}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDetail(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <div className="form-label">Customer</div>
                  <div style={{ fontWeight: 500 }}>{showDetail.customer?.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{showDetail.customer?.email}</div>
                </div>
                <div>
                  <div className="form-label">Status</div>
                  <span className={`badge ${STATUS_COLORS[showDetail.status]}`}>{showDetail.status}</span>
                </div>
                <div>
                  <div className="form-label">Date</div>
                  <div style={{ fontSize: 13 }}>{new Date(showDetail.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="form-label">Total</div>
                  <div className="mono" style={{ fontSize: 16, fontWeight: 600 }}>${showDetail.total_amount.toFixed(2)}</div>
                </div>
              </div>
              {showDetail.notes && (
                <div style={{ marginBottom: 16 }}>
                  <div className="form-label">Notes</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{showDetail.notes}</div>
                </div>
              )}
              <div className="form-label">Items</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '6px 0', fontSize: 11, color: 'var(--text-dim)', borderBottom: '1px solid var(--border)' }}>Product</th>
                    <th style={{ textAlign: 'right', padding: '6px 0', fontSize: 11, color: 'var(--text-dim)', borderBottom: '1px solid var(--border)' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '6px 0', fontSize: 11, color: 'var(--text-dim)', borderBottom: '1px solid var(--border)' }}>Unit</th>
                    <th style={{ textAlign: 'right', padding: '6px 0', fontSize: 11, color: 'var(--text-dim)', borderBottom: '1px solid var(--border)' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {showDetail.items?.map(item => (
                    <tr key={item.id}>
                      <td style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>{item.product?.name || `Product #${item.product_id}`}</td>
                      <td style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'DM Mono', fontSize: 13 }}>{item.quantity}</td>
                      <td style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'DM Mono', fontSize: 13 }}>${item.unit_price.toFixed(2)}</td>
                      <td style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', textAlign: 'right', fontFamily: 'DM Mono', fontSize: 13 }}>${(item.quantity * item.unit_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
