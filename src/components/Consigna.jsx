import { Container, Button} from "react-bootstrap";
// import Map from "./Map";
import { useAuth } from "../contexts/AuthContext";
import { NavLink } from "react-router-dom";

export const Consigna = () => {
  const { user } = useAuth();
  return (
    <Container className="mt-4">
      <h1>¡Publica gratis!</h1>

      <h3>Queremos ayudarte a vender. Es un servicio gratuito.</h3>
      <h5>- Claro que brindamos otros servicios qué sí tienen costo, pero dependerá de tí contratarlos o no</h5>
      {/* <Map/> */}
      <div>
        <h3>¿Querés ganar tiempo?:</h3>
        {user ? (
          <div>
            <p>Cargá ya datos del automotor, maquinaria o lo que quieras vender</p>
            <p>Si no estás seguro de algún dato, no te preocupes, después lo corregimos</p>
            <NavLink to="/newvehicle">
              <Button>Cargar Automotor</Button>
            </NavLink>
          </div>
        ) : (
          <div>
            <p>Inicia sesión para cargar automotores</p>
            <NavLink to="/login">
              <Button>Loguearse</Button>
            </NavLink>
          </div>
        )}
      </div>
    </Container>
  );
};