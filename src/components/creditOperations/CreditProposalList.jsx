import React, { useState, useEffect } from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";

const CreditProposalList = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, "creditoperation"));
      const proposalsData = [];
      for (const docRef of querySnapshot.docs) {
        const proposalData = docRef.data();
        const sellerRef = doc(db, "seller", proposalData.vendedorId);
        const clientRef = doc(db, "client", proposalData.clienteId);
        const dealerRef = doc(db, "dealer", proposalData.concesionarioId);

        const [sellerDoc, clientDoc, dealerDoc] = await Promise.all([
          getDoc(sellerRef),
          getDoc(clientRef),
          getDoc(dealerRef),
        ]);

        const sellerData = sellerDoc.data();
        const clientData = clientDoc.data();
        const dealerData = dealerDoc.data();

        proposalsData.push({
          id: docRef.id,
          ...proposalData,
          vendedorNombre: sellerData.nombre,
          vendedorApellido: sellerData.apellido,
          clienteNombre: clientData.nombre,
          clienteApellido: clientData.apellido,
          clienteCUIL: clientData.cuil,
          concesionario: dealerData.nombre,
        });
      }
      setProposals(proposalsData);
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleViewProforma = (proformaURL) => {
    window.open(proformaURL, "_blank");
  };

  const handleEditProposal = (id) => {
    // Implementar la lógica para editar la propuesta
    console.log("Editar propuesta con ID:", id);
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-10 offset-md-1">
          <div className="card card-body shadow">
            <h3 className="title">Lista de Propuestas de Crédito</h3>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre del Vendedor</th>
                  <th>Apellido del Vendedor</th>
                  <th>Concesionario</th>
                  <th>Nombre del Cliente</th>
                  <th>Apellido del Cliente</th>
                  <th>CUIL del Cliente</th>
                  <th>Fecha de Propuesta</th>
                  <th>Estado de Propuesta</th>
                  <th>Fecha de Estado</th>
                  <th>Comentarios</th>
                  <th>Proforma</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal, index) => (
                  <tr key={proposal.id}>
                    <td>{index + 1}</td>
                    <td>{proposal.vendedorNombre}</td>
                    <td>{proposal.vendedorApellido}</td>
                    <td>{proposal.concesionario}</td>
                    <td>{proposal.clienteNombre}</td>
                    <td>{proposal.clienteApellido}</td>
                    <td>{proposal.clienteCUIL}</td>
                    <td>{proposal.fechaPropuesta}</td>
                    <td>{proposal.estadoPropuesta}</td>
                    <td>{proposal.fechaEstado}</td>
                    <td>{proposal.comentarios}</td>
                    <td>
                      <Button
                        variant="primary"
                        onClick={() => handleViewProforma(proposal.proforma)}
                      >
                        Ver Proforma
                      </Button>
                    </td>
                    <td>
                      <Link to={`/editarpropuesta/${proposal.id}`}>
                        <Button variant="primary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-wrench-adjustable"
                            viewBox="0 0 16 16"
                          >
                            <path d="M16 4.5a4.5 4.5 0 0 1-1.703 3.526L13 5l2.959-1.11q.04.3.041.61" />
                            <path d="M11.5 9c.653 0 1.273-.139 1.833-.39L12 5.5 11 3l3.826-1.53A4.5 4.5 0 0 0 7.29 6.092l-6.116 5.096a2.583 2.583 0 1 0 3.638 3.638L9.908 8.71A4.5 4.5 0 0 0 11.5 9m-1.292-4.361-.596.893.809-.27a.25.25 0 0 1 .287.377l-.596.893.809-.27.158.475-1.5.5a.25.25 0 0 1-.287-.376l.596-.893-.809.27a.25.25 0 0 1-.287-.377l.596-.893-.809.27-.158-.475 1.5-.5a.25.25 0 0 1 .287.376M3 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2" />
                          </svg>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditProposalList;
