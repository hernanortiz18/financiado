import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Container, Button} from "react-bootstrap";
import { EquineList } from "./EquineList";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { NavLink } from "react-router-dom";


export const EquineListContainer = (props) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  const { id } = useParams();

  useEffect(() => {
    const db = getFirestore();

    const refCollection = !id
      ? collection(db, "equines")
      : id === "0kms"
      ? query(
          collection(db, "equines"),
          where("kms", "in", [0, "0", "si", "sí"])
        )
      : id === "destacados"
      ? query(
          collection(db, "equines"),
          where("destacado", "in", [true, "true", "VERDADERO", "si", "sí"])
        )
      : query(
          collection(db, "equines"),
          where("kms", "not-in", [0, "0", "si", "sí"])
        );

    getDocs(refCollection).then((snapshot) => {
      if (snapshot.size === 0)
        console.log("No se encontraron equinos para mostrar");
      else
        setItems(
          snapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() };
          })
        );
    });
  }, [id]);

  return (
    <>
      <Container className="mt-4">
        <h1>{props.greeting}</h1>
        <div>
          {items.length > 0 ? (
            <EquineList items={items} />
          ) : (
            <p>No se encontraron equinos para mostrar.</p>
          )}
        </div>
      </Container>
      <Container className="mt-4">
        <h1>¡¿Crias caballos!</h1>

        <h3>Podés registrarlos en nuestra Web. Es un servicio gratuito.</h3>
        <h5>
          - Claro que brindamos otros servicios que sí tienen costo, pero
          dependerá de tí contratarlos o no
        </h5>
        <div>
          <h3>¿Querés registrar algún caballo en nuestra web?:</h3>
          {user ? (
            <div>
              <NavLink to="/formeq">
                <Button>Agregar caballo</Button>
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
        <div>
          {user ? (
            <div>
            <br/>
              <NavLink to="/equinetable">
                <Button>Ver Tabla</Button>
              </NavLink>
            </div>
          ) : (
            <div>
              <p>Inicia sesión para ver tabla de equinos</p>
              <NavLink to="/login">
                <Button>Loguearse</Button>
              </NavLink>
            </div>
          )}
        </div>
      </Container>
    </>
  );
};
