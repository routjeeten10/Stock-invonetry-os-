import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../utils/api';

const EMPTY_FORM = { name: '', sku: '', description: '', price: '', stock_quantity: '', category: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getProducts().then(r => setProducts(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku, description: p.description || '', price: p.price, stock_quantity: p.stock_quantity, category: p.category || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, price: parseFloat(form.price), stock_quantity: parseInt(form.stock_quantity) };
    try {
      if (editing) {
        await updateProduct(editing.id, payload);
        toast.success('Product updated');
      } else {
        await createProduct(payload);
        toast.success('Product created');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await deleteProduct(p.id);
      toast.success('Product deleted');
      load();
    } catch {
      toast.error('Cannot delete product');
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const stockClass = (q) => q === 0 ? 'stock-low' : q <= 10 ? 'stock-warn' : 'stock-ok';

  return (
    <>
      <div className="topbar">
        <span className="topbar-title">Products</span>
      </div>
      <div className="page-content">
        <div className="page-header">
          <h2>Product Catalog</h2>
          <div className="page-header-actions">
            <div className="search-wrap">
              <Search />
              <input className="search-input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={openCreate}><Plus size={14} /> Add Product</button>
          </div>
        </div>

        <div className="card">
          {loading ? <div className="loading-wrap"><div className="spinner" /></div> : filtered.length === 0 ? (
            <div className="empty-state"><Package /><p>No products found</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                        {p.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.description.slice(0, 60)}{p.description.length > 60 ? '…' : ''}</div>}
                      </td>
                      <td><span className="mono">{p.sku}</span></td>
                      <td style={{ color: 'var(--text-muted)' }}>{p.category || '—'}</td>
                      <td><span className="mono">${p.price.toFixed(2)}</span></td>
                      <td><span className={`mono ${stockClass(p.stock_quantity)}`}>{p.stock_quantity}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}><Edit2 size={12} /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Edit Product' : 'New Product'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Product Name *</label>
                    <input className="form-control" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wireless Mouse" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">SKU *</label>
                    <input className="form-control" required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. WM-001" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price *</label>
                    <input className="form-control" required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock Quantity *</label>
                    <input className="form-control" required type="number" min="0" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: e.target.value })} placeholder="0" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Electronics" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
