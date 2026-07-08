import React, { useState, useEffect } from 'react';
import { productService } from '../../services/products.service';

const AdminEditProductModal = ({ product, onClose, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusMsg, setStatusMsg] = useState("");

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        description: '',
        categories: '',
        styles: '',
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                price: product.price || '',
                stock: product.stock || '',
                description: product.description || '',
                categories: product.categories ? product.categories.join(', ') : '',
                styles: product.styles ? product.styles.join(', ') : '',
            });
        }
    }, [product]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setStatusMsg("Validando datos...");

        try {
            const cleanName = formData.name.trim();
            const cleanDesc = formData.description.trim();
            const cleanPrice = parseInt(formData.price, 10);
            const cleanStock = parseInt(formData.stock, 10);

            if (!cleanName) throw new Error("El nombre no puede estar vacío.");
            if (isNaN(cleanPrice) || cleanPrice < 0) throw new Error("Precio inválido.");
            if (isNaN(cleanStock) || cleanStock < 0) throw new Error("Stock inválido.");

            const cleanCategories = formData.categories.split(',').map(c => c.trim()).filter(Boolean);
            const cleanStyles = formData.styles.split(',').map(s => s.trim()).filter(Boolean);

            const updatePayload = {
                name: cleanName,
                price: cleanPrice,
                stock: cleanStock,
                description: cleanDesc,
                categories: cleanCategories,
                styles: cleanStyles
            };

            setStatusMsg("Guardando cambios...");
            await productService.updateProduct(product.id, updatePayload);

            setStatusMsg("¡Actualizado con éxito!");
            setTimeout(() => {
                onUpdate();
                onClose();
            }, 1000);

        } catch (err) {
            console.error(err);
            setError(err.message || "Error al actualizar");
            setStatusMsg("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="create-card" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#fff', padding: '2rem', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: 0 }}>Editar Producto #{product?.id?.toString().slice(-4)}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>&times;</button>
                </div>

                {error && <div className="error-banner">{error}</div>}
                {statusMsg && <div className="status-banner" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '10px', borderRadius: '6px', marginBottom: '1rem', textAlign: 'center' }}>{statusMsg}</div>}

                <form onSubmit={handleSubmit} className="create-form">
                    <div className="form-section">
                        <h3>Información General</h3>
                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 2fr) 1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label>Nombre del Producto</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
                            </div>
                            <div className="form-group">
                                <label>Precio ($)</label>
                                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
                            </div>
                            <div className="form-group">
                                <label>Stock</label>
                                <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required min="0" style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginTop: '15px' }}>
                            <label>Descripción</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" required style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
                        </div>
                    </div>

                    <div className="form-section" style={{ marginTop: '20px' }}>
                        <h3>Categorización</h3>
                        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div className="form-group">
                                <label>Categorías (separadas por coma)</label>
                                <input type="text" name="categories" value={formData.categories} onChange={handleInputChange} style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
                            </div>
                            <div className="form-group">
                                <label>Estilos (separados por coma)</label>
                                <input type="text" name="styles" value={formData.styles} onChange={handleInputChange} style={{ width: '100%', padding: '10px', marginTop: '5px' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #ccc', background: 'white', cursor: 'pointer' }}>Cancelar</button>
                        <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#4CAF50', color: 'white', cursor: loading ? 'not-allowed' : 'pointer' }}>
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminEditProductModal;
