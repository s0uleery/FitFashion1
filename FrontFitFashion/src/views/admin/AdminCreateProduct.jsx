import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/products.service'; 
import './styles/AdminCreateProduct.css';

const AdminCreateProduct = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusMsg, setStatusMsg] = useState("");

    // Estado del formulario
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        description: '',
        categories: '',
        styles: '',
    });

    // Manejo de cambios en inputs de texto
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
            // Limpiar espacios en blanco al inicio y final
            const cleanName = formData.name.trim();
            const cleanDesc = formData.description.trim();
            const cleanPrice = parseInt(formData.price, 10);
            const cleanStock = parseInt(formData.stock, 10);

            // Validaciones de Texto
            if (!cleanName) throw new Error("El nombre del producto no puede estar vacío.");
            if (cleanName.length < 3) throw new Error("El nombre es muy corto.");
            if (!cleanDesc) throw new Error("La descripción es obligatoria.");

            // Validaciones Numéricas
            if (isNaN(cleanPrice) || cleanPrice < 0) throw new Error("El precio debe ser un número válido mayor o igual a 0.");
            if (isNaN(cleanStock) || cleanStock < 0) throw new Error("El stock debe ser un número válido mayor o igual a 0.");

            // Validaciones de Listas
            const cleanCategories = formData.categories.split(',').map(c => c.trim()).filter(Boolean);
            const cleanStyles = formData.styles.split(',').map(s => s.trim()).filter(Boolean);

            if (cleanCategories.length === 0) throw new Error("Debes agregar al menos una categoría válida.");
            if (cleanStyles.length === 0) throw new Error("Debes agregar al menos un estilo.");

            // Preparar payload
            setStatusMsg("Guardando producto en base de datos...");

            const productPayload = {
                name: cleanName,
                price: cleanPrice,
                stock: cleanStock,
                description: cleanDesc,
                categories: cleanCategories,
                styles: cleanStyles,
                layerIndex: 1, // Valor fijo
                builderImage: "", // Dejado vacío como tarea
                galleryImages: [] // Dejado vacío como tarea
            };

            // Enviar al backend
            await productService.createProduct(productPayload);

            // Éxito
            setStatusMsg("¡Producto creado exitosamente!");
            setTimeout(() => {
                navigate('/');
            }, 1500);

        } catch (err) {
            console.error(err);
            setError(err.message || "Error al crear producto");
            setStatusMsg("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-create-container">
            <div className="create-card">
                <h2>Crear Nuevo Producto</h2>

                {error && <div className="error-banner">{error}</div>}
                {statusMsg && <div className="status-banner">{statusMsg}</div>}

                <form onSubmit={handleSubmit} className="create-form">

                    {/* SECCIÓN 1: DATOS BÁSICOS */}
                    <div className="form-section">
                        <h3>Información General</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nombre del Producto</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group short">
                                <label>Precio ($)</label>
                                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required min="0" />
                            </div>
                            <div className="form-group short">
                                <label>Stock Inicial</label>
                                <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} required min="0" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Descripción</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" required />
                        </div>
                    </div>

                    {/* SECCIÓN 2: CATEGORIZACIÓN */}
                    <div className="form-section">
                        <h3>Categorización</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Categorías (separadas por coma)</label>
                                <input type="text" name="categories" value={formData.categories} onChange={handleInputChange} placeholder="Ej: Poleras, Verano, Ofertas" />
                            </div>
                            <div className="form-group">
                                <label>Estilos (separados por coma)</label>
                                <input type="text" name="styles" value={formData.styles} onChange={handleInputChange} placeholder="Ej: Casual, Urbano" />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => navigate('/')}>Cancelar</button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Procesando...' : 'Publicar Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminCreateProduct;