import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../../contexts/AuthContext";
import Alert from "../Alert";
import ReCaptcha from "../ReCaptcha";

const VehicleEdit = () => {
  const { id } = useParams();
  const storage = getStorage();
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const { user, userRole, userName, userLastName } = useAuth();
  const [userNameComplete, setUserNameComplete] = useState("");

  useEffect(() => {
    if (user) {
      setUserNameComplete(
        userName
          ? userLastName
            ? `${userName} ${userLastName}`
            : userName
          : userLastName || ""
      );
    }
  }, [user]);

  // Verifica si el usuario tiene el rol necesario
  if (!["VENDEDOR", "SUPERVISOR", "ADMINISTRADOR"].includes(userRole)) {
    return (
      <div className="container">
        <h3>No tienes permisos para acceder a esta página.</h3>
      </div>
    );
  }
  const db = getFirestore();

  const [vehicleData, setVehicleData] = useState({
    // Inicializa los campos
    CONCESIONARIO: "SUPERAUTO",
    DOMINIO: "",
    ESTADOACTIVO: false,
    IMAGEN: {
      DESTACADA: "",
      FRENTE: "",
      INTERIOR: "",
      LATERAL: "",
      TRASERA: "",
    },
    STOCK: "",
    YEAR: "",
    combustible: "",
    destacado: false,
    kms: "",
    marca: "",
    modelo: "",
    precio: "",
    version: "",
  });

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        const vehicleDocRef = doc(db, "automotores", id);
        const vehicleSnapshot = await getDoc(vehicleDocRef);

        if (vehicleSnapshot.exists()) {
          // Obtiene los datos del vehículo y actualiza el estado
          setVehicleData(vehicleSnapshot.data());
        } else {
          console.error("El vehículo no existe");
          // Maneja la situación en la que el vehículo no existe
        }
      } catch (error) {
        console.error("Error al obtener datos del vehículo:", error);
      }
    };

    fetchVehicleData();
  }, [db, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageUpdate = async (vehicleData) => {
    try {
      const updatedImageData = { ...vehicleData };
      
      for (const key of Object.keys(updatedImageData.IMAGEN)) {
        const file = updatedImageData.IMAGEN[key];
        
        // Verificar si se cargó una nueva imagen
        if (file instanceof File) {
          const storageRef = ref(storage, `vehiclesimg/${file.name}`);
          await uploadBytes(storageRef, file);
          console.log("Terminó la descarga...");
  
          const url = await getDownloadURL(storageRef);
          console.log("URL de descarga:", url);
  
          // Actualizar la URL de la imagen en los datos del vehículo
          updatedImageData.IMAGEN[key] = url;
        }
      }
  
      return updatedImageData;
    } catch (error) {
      console.error("Error al actualizar las imágenes del vehículo:", error);
      throw error;
    }
  };
  

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const storageRef = ref(storage, `vehiclesimg/${file.name}`);
      await uploadBytes(storageRef, file);
      console.log("Terminó la descarga...");

      const url = await getDownloadURL(storageRef);
      console.log("URL de descarga:", url);

      setVehicleData((prevData) => ({
        ...prevData,
        IMAGEN: {
          ...prevData.IMAGEN,
          [type]: url,
        },
      }));
    } catch (error) {
      console.error("Error al subir archivo:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (id) {
      // Si hay un ID definido, significa que estás editando un automóvil existente
      try {
        // Manejar las imágenes primero
        const updatedImageData = await handleImageUpdate(vehicleData);
        // Actualizar los datos del vehículo con las nuevas URLs de las imágenes
        await saveVehicleData(updatedImageData, id);
      } catch (error) {
        console.error("Error al actualizar las imágenes del vehículo:", error);
      }
    } else {
      // Si no hay ID definido, significa que estás creando un nuevo automóvil
      // Guardar los datos del vehículo directamente
      saveVehicleData(vehicleData);
    }
  };
  
  

  const handleSwitchChange = (e) => {
    const { name } = e.target;
    setVehicleData((prevData) => ({
      ...prevData,
      [name]: !prevData[name],
    }));
    // Para alternar entre "Verdadero" y "Falso"
    setSwitchLabels((prevLabels) => ({
      ...prevLabels,
      [name]: !prevLabels[name] ? "Verdadero" : "Falso",
    }));
  };

  const [switchLabels, setSwitchLabels] = useState({
    activo: "Falso",
    destacado: "Falso",
  });
  const saveVehicleData = async (data, id = null) => {
    try {
      const fechaModificacion = serverTimestamp();
      const updatedVehicleData = {
        ...data,
        FECHAMODIFICACION: fechaModificacion,
        USUARIOMODIFICACION: userNameComplete,
      };

      if (id) {
        const vehicleDocRef = doc(db, "automotores", id);
        await updateDoc(vehicleDocRef, updatedVehicleData);
        console.log("Datos del vehículo actualizados con éxito");
      } else {
        // Crear un nuevo automóvil
        const newVehicleRef = collection(db, "automotores");
        await addDoc(newVehicleRef, updatedVehicleData);
        console.log("Nuevo vehículo creado con éxito");
      }

      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
        // Restablecer el formulario o redirigir
      }, 2000);
    } catch (error) {
      console.error("Error al guardar datos del vehículo:", error);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <div className="card card-body shadow">
            <form onSubmit={handleSubmit}>
              <h3 className="title">
                {id ? "Editar Vehículo" : "Nuevo Vehículo"}
              </h3>
              <Form.Group controlId="formMarca">
                <Form.Label>Marca</Form.Label>
                <Form.Control
                  type="text"
                  name="marca"
                  value={vehicleData.marca}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="formModelo">
                <Form.Label>Modelo</Form.Label>
                <Form.Control
                  type="text"
                  name="modelo"
                  value={vehicleData.modelo}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group controlId="formVersion">
                <Form.Label>Versión</Form.Label>
                <Form.Control
                  type="text"
                  name="version"
                  value={vehicleData.version}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group controlId="formYear">
                <Form.Label>Año</Form.Label>
                <Form.Control
                  type="number"
                  name="YEAR"
                  value={vehicleData.YEAR}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group controlId="formDominio">
                <Form.Label>Patente/Dominio</Form.Label>
                <Form.Control
                  type="text"
                  name="DOMINIO"
                  value={vehicleData.DOMINIO}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group controlId="formCombustible">
                <Form.Label>Tipo de Combustible</Form.Label>
                <Form.Control
                  type="text"
                  name="combustible"
                  value={vehicleData.combustible}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group controlId="formKms">
                <Form.Label>Kilómetros</Form.Label>
                <Form.Control
                  type="number"
                  name="kms"
                  value={vehicleData.kms}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group controlId="formPrecio">
                <Form.Label>Precio</Form.Label>
                <Form.Control
                  type="number"
                  name="precio"
                  value={vehicleData.precio}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group controlId="formEstadoActivo">
                <Form.Label>¿Activo?</Form.Label>
                <Form.Check
                  type="switch"
                  id="custom-switch"
                  label={`¿Activo? - ${
                    vehicleData.ESTADOACTIVO ? "Verdadero" : "Falso"
                  }`}
                  name="ESTADOACTIVO"
                  checked={vehicleData.ESTADOACTIVO}
                  onChange={handleSwitchChange}
                />
              </Form.Group>
              <Form.Group controlId="formDestacado">
                <Form.Label>Destacado</Form.Label>
                <Form.Check
                  type="switch"
                  id="custom-switch-destacado"
                  label={`Destacado - ${
                    vehicleData.destacado ? "Verdadero" : "Falso"
                  }`}
                  name="destacado"
                  checked={vehicleData.destacado}
                  onChange={handleSwitchChange}
                />
              </Form.Group>
              <div className="mb-3">
                <label htmlFor="imagenDestacada" className="form-label">
                  Imagen Destacada
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  id="imagenDestacada"
                  onChange={(e) => handleImageUpload(e, "DESTACADA")}
                />
                </div>
                {/* <button type="button" onClick={subirArchivo}>
                Subir Imagen
              </button> */}
              <div className="mb-3">
                <label htmlFor="imagenFrente" className="form-label">
                  Imagen Frente
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  id="imagenFrente"
                  onChange={(e) => handleImageUpload(e, "FRENTE")}
                />
                {/* <button type="button" onClick={subirArchivo}>
                Subir Imagen
              </button> */}
              </div>
              <div className="mb-3">
                <label htmlFor="imagenInterior" className="form-label">
                  Imagen Interior
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  id="imagenInterior"
                  onChange={(e) => handleImageUpload(e, "INTERIOR")}
                />
                {/* <button type="button" onClick={subirArchivo}>
                Subir Imagen
              </button> */}
              </div>
              <div className="mb-3">
                <label htmlFor="imagenLateral" className="form-label">
                  Imagen Lateral
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  id="imagenLateral"
                  onChange={(e) => handleImageUpload(e, "LATERAL")}
                />
                {/* <button type="button" onClick={subirArchivo}>
                Subir Imagen
              </button> */}
              </div>
              <div className="mb-3">
                <label htmlFor="imagenTrasera" className="form-label">
                  Imagen Trasera
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  id="imagenTrasera"
                  onChange={(e) => handleImageUpload(e, "TRASERA")}
                />
                {/* <button type="button" onClick={subirArchivo}>
                Subir Imagen
              </button> */}
              </div>
              <ReCaptcha />
              <button type="submit" className="btn btn-primary">
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>
      </div>
      {showSuccessAlert && (
        <Alert
          message="¡Datos del vehículo actualizados con éxito!"
          type="success"
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
    </div>
  );
};

export default VehicleEdit;
