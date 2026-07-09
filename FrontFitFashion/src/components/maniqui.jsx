import './styles/maniqui.css';
import maniquiImagen from '../assets/Maniqui.png';

const Maniqui = ({ cartItems }) => {
    return (
        <div className="cuarto-virtual">
            <div className="maniqui-contenedor">

                <img
                    src={maniquiImagen} 
                    alt="Maniqui" 
                    className="maniqui-base" />

                
                {cartItems.map((item) => (
                    <img
                        key={item.id}
                        src={maniquiImagen}
                        alt={item.name}
                        className="ropa"
                        style={{ zIndex: item.layer || 10 }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Maniqui;
