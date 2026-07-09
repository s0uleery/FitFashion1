import { useState, useEffect } from 'react';
import { useCart } from '../store/CartContext';
import { productService } from '../services/products.service';
import maniquiImagen from '../assets/Maniqui.png';
import './styles/Probador.css';

const Probador = () => {
    const { items } = useCart();
    const [productosCarrito, setProductosCarrito] = useState([]);
    const [prendasEnManiqui, setPrendasEnManiqui] = useState([]);
    const [loading, setLoading] = useState(true);

    
    // Trae el detalle completo (incluye builderImage) de cada producto del carrito
    useEffect(() => {
        console.log('Items del carrito:', items);
        const fetchDetails = async () => {
            if (!items || items.length === 0) {
                setProductosCarrito([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const detalles = await Promise.all(
                    items.map((item) => productService.getProductById(item.id))
                );
                setProductosCarrito(detalles.filter(Boolean));
            } catch (err) {
                console.error('Error cargando detalles del carrito:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [items]);

    const handleDragStart = (e, producto) => {
        e.dataTransfer.setData('application/json', JSON.stringify(producto));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json');
        if (!data) return;
        const producto = JSON.parse(data);

        const stage = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - stage.left - 75; // centra aprox. el ancho de la prenda
        const y = e.clientY - stage.top - 75;

        setPrendasEnManiqui((prev) => {
            const yaExiste = prev.some((p) => p.id === producto.id);
            if (yaExiste) {
                return prev.map((p) =>
                    p.id === producto.id ? { ...p, x, y } : p
                );
            }
            return [...prev, { ...producto, x, y }];
        });
    };

    const quitarPrenda = (id) => {
        setPrendasEnManiqui((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <div className="probador-page">
            <h1>Probador Virtual</h1>
            <p className="probador-subtitle">Arrastra una prenda de tu carrito hacia el maniquí</p>

            <div className="probador-layout">
                {/* MANIQUÍ */}
                <div
                    className="probador-stage"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <img src={maniquiImagen} alt="Maniquí base" className="probador-maniqui-base" />

                    {prendasEnManiqui.map((prenda) => (
                        <img
                            key={prenda.id}
                            src={prenda.builderImage}
                            alt={prenda.name}
                            className="probador-prenda"
                            style={{ left: prenda.x, top: prenda.y }}
                            onDoubleClick={() => quitarPrenda(prenda.id)}
                            title="Doble click para quitar"
                        />
                    ))}
                </div>

                {/* LISTA DEL CARRITO */}
                <div className="probador-carrito">
                    <h3>Tu carrito</h3>

                    {loading && <p>Cargando prendas...</p>}

                    {!loading && productosCarrito.length === 0 && (
                        <p className="probador-vacio">No tienes productos en el carrito.</p>
                    )}

                    <div className="probador-lista">
                        {productosCarrito.map((producto) => (
                            <div
                                key={producto.id}
                                className="probador-item"
                                draggable
                                onDragStart={(e) => handleDragStart(e, producto)}
                            >
                                <img src={producto.builderImage} alt={producto.name} />
                                <span>{producto.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Probador;