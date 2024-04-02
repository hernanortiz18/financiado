import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import statusList from "./statusList.json";

const EditCreditProposal = () => {
  const { id } = useParams();
  const [proposal, setProposal] = useState({});
  const [estadoPropuesta, setEstadoPropuesta] = useState("");
  const [comentarios, setComentarios] = useState("");

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const db = getFirestore();
        const proposalRef = doc(db, "creditoperation", id);
        const proposalSnapshot = await getDoc(proposalRef);

        if (proposalSnapshot.exists()) {
          const proposalData = proposalSnapshot.data();
          setEstadoPropuesta(proposalData.estadoPropuesta);
          setComentarios(proposalData.comentarios);

          const clientRef = doc(db, "client", proposalData.clienteId);
          const clientSnapshot = await getDoc(clientRef);
          const clientData = clientSnapshot.data();

          const dealerRef = doc(db, "dealer", proposalData.concesionarioId);
          const dealerSnapshot = await getDoc(dealerRef);
          const dealerData = dealerSnapshot.data();

          const sellerRef = doc(db, "seller", proposalData.vendedorId);
          const sellerSnapshot = await getDoc(sellerRef);
          const sellerData = sellerSnapshot.data();

          const fullProposalData = {
            ...proposalData,
            cliente: clientData,
            concesionario: dealerData,
            vendedor: sellerData,
          };

          setProposal(fullProposalData);
        } else {
          console.log("No se encontró la propuesta con el ID:", id);
        }
      } catch (error) {
        console.error("Error al obtener la propuesta:", error);
      }
    };

    fetchProposal();
  }, [id]);

  const handleEstadoPropuestaChange = (e) => {
    setEstadoPropuesta(e.target.value);
  };

  const handleComentariosChange = (e) => {
    setComentarios(e.target.value);
  };

  const handleSaveChanges = async () => {
    const db = getFirestore();
    const proposalRef = doc(db, "creditoperation", id);
    try {
      await updateDoc(proposalRef, {
        estadoPropuesta: estadoPropuesta,
        fechaEstado: serverTimestamp(),
        comentarios: comentarios,
      });
      console.log("Propuesta actualizada con éxito.");
    } catch (error) {
      console.error("Error al actualizar la propuesta:", error);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <div className="card card-body shadow">
            <div>
              <h4>Datos de la Propuesta:</h4>
              <p>
                <strong>Cliente:</strong> {proposal?.cliente?.nombre}
              </p>
              <p>
                <strong>Concesionario:</strong>{" "}
                {proposal?.concesionario?.nombre}
              </p>
              <p>
                <strong>Vendedor:</strong> {proposal?.vendedor?.nombre}
              </p>
              <p>
                <strong>Comentarios:</strong> {comentarios}
              </p>
              {/* Agrega más campos de propuesta aquí */}
            </div>
            <h3 className="title">Editar Propuesta de Crédito</h3>
            <Form>
              <Form.Group controlId="estadoPropuesta">
                <Form.Label>Estado de la Propuesta</Form.Label>
                <Form.Control
                  as="select"
                  value={estadoPropuesta}
                  onChange={handleEstadoPropuestaChange}
                >
                  <option value="">Seleccionar estado</option>
                  {statusList.statusList.map((status, index) => (
                    <option key={index} value={status}>
                      {status}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="comentarios">
                <Form.Label>Comentarios</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={comentarios}
                  onChange={handleComentariosChange}
                />
              </Form.Group>
              <Button variant="primary" onClick={handleSaveChanges}>
                Guardar Cambios
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCreditProposal;
