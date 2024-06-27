import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import CancelButton from "../tinyComponents/CancelButton";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Alert from "../Alert";

const CreditProposal = () => {
  // Estado para almacenar los datos del formulario
  const [proposalData, setProposalData] = useState({
    vendedorNombre: "",
    vendedorApellido: "",
    concesionario: "",
    clienteNombre: "",
    clienteApellido: "",
    clienteCUIL: "",
    fechaPropuesta: new Date().toISOString().slice(0, 10), // Fecha de carga inicial
    estadoPropuesta: "INICIAL",
    fechaEstado: new Date().toISOString().slice(0, 10), // Fecha de última modificación
    comentarios: "",
    proforma: null, // Guardaremos el archivo aquí
  });
  const [showUploadProgress, setShowUploadProgress] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Estado para mostrar el progreso de la carga del archivo
  const [uploadProgress, setUploadProgress] = useState(0);

  // Función para manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProposalData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Función para manejar la carga de archivos
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setShowUploadProgress(true); // Mostrar el indicador de carga

    const storage = getStorage();
    const storageRef = ref(storage, `proforma/${file.name}`);

    try {
      const uploadTaskSnapshot = await uploadBytes(storageRef, file);

      // Ocultar el indicador de carga después de la carga exitosa
      setShowUploadProgress(false);

      // Obtener la URL de descarga del archivo
      const downloadURL = await getDownloadURL(uploadTaskSnapshot.ref);
      setProposalData((prevData) => ({
        ...prevData,
        proforma: downloadURL,
      }));

      // Mostrar el mensaje de confirmación
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        // Restablecer el formulario o redirigir
      }, 2000);
    } catch (error) {
      console.error("Error al cargar el archivo:", error);
      // Si ocurre un error, asegúrate de ocultar el indicador de carga
      setShowUploadProgress(false);
    }
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    const db = getFirestore();

    try {
      // Guardar datos del vendedor
      const sellerRef = await addDoc(collection(db, "seller"), {
        nombre: proposalData.vendedorNombre,
        apellido: proposalData.vendedorApellido,
      });
      console.log("Vendedor guardado con ID:", sellerRef.id);

      // Guardar datos del cliente
      const clientRef = await addDoc(collection(db, "client"), {
        nombre: proposalData.clienteNombre,
        apellido: proposalData.clienteApellido,
        cuil: proposalData.clienteCUIL,
      });
      console.log("Cliente guardado con ID:", clientRef.id);

      // Guardar datos del concesionario
      const dealerRef = await addDoc(collection(db, "dealer"), {
        nombre: proposalData.concesionario,
      });
      console.log("Concesionario guardado con ID:", dealerRef.id);

      // Guardar datos de la propuesta
      await addDoc(collection(db, "creditoperation"), {
        vendedorId: sellerRef.id,
        clienteId: clientRef.id,
        concesionarioId: dealerRef.id,
        fechaPropuesta: proposalData.fechaPropuesta,
        estadoPropuesta: proposalData.estadoPropuesta,
        fechaEstado: proposalData.fechaEstado,
        comentarios: proposalData.comentarios,
        proforma: proposalData.proforma,
      });
      console.log("Propuesta de crédito guardada con éxito");
      // Mostrar el mensaje de confirmación
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        // Restablecer el formulario o redirigir
      }, 2000);

      // Reiniciar los datos del formulario después de enviar
      setProposalData({
        vendedorNombre: "",
        vendedorApellido: "",
        concesionario: "",
        clienteNombre: "",
        clienteApellido: "",
        clienteCUIL: "",
        fechaPropuesta: new Date().toISOString().slice(0, 10),
        estadoPropuesta: "INICIAL",
        fechaEstado: new Date().toISOString().slice(0, 10),
        comentarios: "",
        proforma: "",
      });
    } catch (error) {
      console.error("Error al guardar la propuesta de crédito:", error);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <div className="card card-body shadow">
            <form onSubmit={handleSubmit}>
              <h3 className="title">Nueva Propuesta de Crédito</h3>
              {/* Campos del formulario */}
              {/* Vendedor */}
              <Form.Group controlId="vendedorNombre">
                <Form.Label>Nombre del Vendedor</Form.Label>
                <Form.Control
                  type="text"
                  name="vendedorNombre"
                  value={proposalData.vendedorNombre}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="vendedorApellido">
                <Form.Label>Apellido del Vendedor</Form.Label>
                <Form.Control
                  type="text"
                  name="vendedorApellido"
                  value={proposalData.vendedorApellido}
                  onChange={handleInputChange}
                />
              </Form.Group>
              {/* Concesionario */}
              <Form.Group controlId="concesionario">
                <Form.Label>Concesionario</Form.Label>
                <Form.Control
                  type="text"
                  name="concesionario"
                  value={proposalData.concesionario}
                  onChange={handleInputChange}
                />
              </Form.Group>
              {/* Cliente */}
              <Form.Group controlId="clienteNombre">
                <Form.Label>Nombre del Cliente</Form.Label>
                <Form.Control
                  type="text"
                  name="clienteNombre"
                  value={proposalData.clienteNombre}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="clienteApellido">
                <Form.Label>Apellido del Cliente</Form.Label>
                <Form.Control
                  type="text"
                  name="clienteApellido"
                  value={proposalData.clienteApellido}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="clienteCUIL">
                <Form.Label>CUIL del Cliente</Form.Label>
                <Form.Control
                  type="text"
                  name="clienteCUIL"
                  value={proposalData.clienteCUIL}
                  onChange={handleInputChange}
                />
              </Form.Group>
              {/* Estado de la Propuesta */}
              <Form.Group controlId="estadoPropuesta">
                <Form.Label>Estado de la Propuesta</Form.Label>
                <Form.Control
                  as="select"
                  name="estadoPropuesta"
                  value={proposalData.estadoPropuesta}
                  onChange={handleInputChange}
                >
                  <option value="">Seleccionar estado</option>
                  {/* Opciones para el estado de la propuesta */}
                </Form.Control>
              </Form.Group>
              {/* Comentarios */}
              <Form.Group controlId="comentarios">
                <Form.Label>Comentarios</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="comentarios"
                  value={proposalData.comentarios}
                  onChange={handleInputChange}
                />
              </Form.Group>
              {/* Proforma */}
              <Form.Group controlId="proforma">
                <Form.Label>Proforma</Form.Label>
                <Form.Control
                  type="file"
                  name="proforma"
                  onChange={handleFileUpload}
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <progress value={uploadProgress} max="100">
                    {uploadProgress}%
                  </progress>
                )}
                {uploadProgress === 100 && (
                  <p>¡La proforma se ha cargado correctamente!</p>
                )}
                {showUploadProgress && (
                  <div className="upload-progress">Subiendo archivo...</div>
                )}

                {showSuccessMessage && (
                  <Alert
                    variant="success"
                    message="¡La carga del archivo fue exitosa!"
                    type="success"
                  />
                )}
              </Form.Group>
              {/* Botón para enviar el formulario */}
              <Button variant="primary" type="submit">
                Guardar Propuesta
              </Button>
              <CancelButton />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditProposal;
