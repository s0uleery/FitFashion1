import './styles/maniqui.css';
import maniquiImagen from '../assets/maniqui-base.png';

const Maniqui = ({ cartItems }) => {
    return (
        <div className="cuarto-virtual">
            <div className="maniqui-contenedor">
                //capa 1 base maniqui
                <img
                    src="../assets/maniqui-base.png" //ruta donde tenemos q poner las fotos
                    alt="Maniquí base"
                    className="maniqui-base"
                />

                // Ropa
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
