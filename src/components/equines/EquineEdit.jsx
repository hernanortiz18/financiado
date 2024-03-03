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

const EquineEdit = () => {
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

  const [equineData, setEquineData] = useState({
    // Inicializa los campos
    NOMBRE: "",
    CRIADOR: "",
    RAZA: "",
    PROPIETARIO: "",
    COLOR: "",
    CUERPO: "",
    CABEZA: "",
    MIEMBROS: "",
    PADRE: "",
    MADRE: "",
    RP: "",
    PSBA: "",
    IMAGEN: {
      DESTACADA: "",
      FRENTE: "",
      IZQUIERDA: "",
      DERECHA: "",
      TRASERA: "",
    },
    FECHANACIMIENTO: "",
    SEXO: "",
    INSPECCION: "",
    ENVENTA: false,
    precio: "",
  });

  useEffect(() => {
    const fetchEquineData = async () => {
      try {
        const equineDocRef = doc(db, "equines", id);
        const equineSnapshot = await getDoc(equineDocRef);

        if (equineSnapshot.exists()) {
          // Obtiene los datos del equino y actualiza el estado
          setEquineData(equineSnapshot.data());
        } else {
          console.error("El equino no existe");
          // Maneja la situación en la que el equino no existe
        }
      } catch (error) {
        console.error("Error al obtener datos del equino:", error);
      }
    };

    fetchEquineData();
  }, [db, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEquineData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageUpdate = async (equineData) => {
    try {
      const updatedImageData = { ...equineData };

      for (const key of Object.keys(updatedImageData.IMAGEN)) {
        const file = updatedImageData.IMAGEN[key];

        // Verificar si se cargó una nueva imagen
        if (file instanceof File) {
          const storageRef = ref(storage, `equinesimg/${file.name}`);
          await uploadBytes(storageRef, file);
          console.log("Terminó la descarga...");

          const url = await getDownloadURL(storageRef);
          console.log("URL de descarga:", url);

          // Actualizar la URL de la imagen en los datos del equino
          updatedImageData.IMAGEN[key] = url;
        }
      }

      return updatedImageData;
    } catch (error) {
      console.error("Error al actualizar las imágenes del equino:", error);
      throw error;
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const storageRef = ref(storage, `equinesimg/${file.name}`);
      await uploadBytes(storageRef, file);
      console.log("Terminó la descarga...");

      const url = await getDownloadURL(storageRef);
      console.log("URL de descarga:", url);

      setEquineData((prevData) => ({
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
        const updatedImageData = await handleImageUpdate(equineData);
        // Actualizar los datos del equino con las nuevas URLs de las imágenes
        await saveEquineData(updatedImageData, id);
      } catch (error) {
        console.error("Error al actualizar las imágenes del equino:", error);
      }
    } else {
      // Si no hay ID definido, significa que estás creando un nuevo automóvil
      // Guardar los datos del equino directamente
      saveEquineData(equineData);
    }
  };

  const handleSwitchChange = (e) => {
    const { name } = e.target;
    setEquineData((prevData) => ({
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
  const saveEquineData = async (data, id = null) => {
    try {
      const fechaModificacion = serverTimestamp();
      const updatedEquineData = {
        ...data,
        FECHAMODIFICACION: fechaModificacion,
        USUARIOMODIFICACION: userNameComplete,
      };

      if (id) {
        const equineDocRef = doc(db, "equines", id);
        await updateDoc(equineDocRef, updatedEquineData);
        console.log("Datos del equino actualizados con éxito");
      } else {
        // Guardar un nuevo equino
        const newEquineRef = collection(db, "equines");
        await addDoc(newEquineRef, updatedEquineData);
        console.log("Nuevo equino guardado con éxito");
      }

      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
        // Restablecer el formulario o redirigir
      }, 2000);
    } catch (error) {
      console.error("Error al guardar datos del equino:", error);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <div className="card card-body shadow">
            <form onSubmit={handleSubmit}>
              <h3 className="title">{id ? "Editar Equino" : "Nuevo Equino"}</h3>
              <Form.Group controlId="formEquine">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="NOMBRE"
                  value={equineData.NOMBRE}
                  onChange={handleInputChange}
                />
                <Form.Label>Raza o Biotipo</Form.Label>
                <Form.Control
                  type="text"
                  name="RAZA"
                  value={equineData.RAZA}
                  onChange={handleInputChange}
                />
                <Form.Label>Madre</Form.Label>
                <Form.Control
                  type="text"
                  name="MADRE"
                  value={equineData.MADRE}
                  onChange={handleInputChange}
                />
                <Form.Label>Padre</Form.Label>
                <Form.Control
                  type="text"
                  name="PADRE"
                  value={equineData.PADRE}
                  onChange={handleInputChange}
                />
                <Form.Label>Fecha de nacimiento</Form.Label>
                <Form.Control
                  type="text"
                  name="FECHANACIMIENTO"
                  value={equineData.FECHANACIMIENTO}
                  onChange={handleInputChange}
                />
                <Form.Label>Sexo</Form.Label>
                <Form.Control
                  type="text"
                  name="SEXO"
                  value={equineData.SEXO}
                  onChange={handleInputChange}
                />
                <Form.Label>Criador</Form.Label>
                <Form.Control
                  type="text"
                  name="CRIADOR"
                  value={equineData.CRIADOR}
                  onChange={handleInputChange}
                />
                <Form.Label>P SBA</Form.Label>
                <Form.Control
                  type="number"
                  name="PSBA"
                  value={equineData.PSBA}
                  onChange={handleInputChange}
                />

                <Form.Label>Inspección</Form.Label>
                <Form.Control
                  type="text"
                  name="INSPECCION"
                  value={equineData.INSPECCION}
                  onChange={handleInputChange}
                />
                <br/>
                <Form.Label>Opciones de venta</Form.Label>
                <Form.Check
                  type="switch"
                  id="custom-switch"
                  label={`¿En venta? - ${
                    equineData.ESTADOACTIVO ? "Verdadero" : "Falso"
                  }`}
                  name="ESTADOACTIVO"
                  checked={equineData.ESTADOACTIVO}
                  onChange={handleSwitchChange}
                />
                {/* <Form.Label>Destacado</Form.Label> */}
                <Form.Check
                  type="switch"
                  id="custom-switch-destacado"
                  label={`Destacado - ${
                    equineData.destacado ? "Verdadero" : "Falso"
                  }`}
                  name="destacado"
                  checked={equineData.destacado}
                  onChange={handleSwitchChange}
                />
                <Form.Label>Precio</Form.Label>
                <Form.Control
                  type="number"
                  name="precio"
                  value={equineData.precio}
                  onChange={handleInputChange}
                />
              </Form.Group>
              <br/>
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
              </div>
              <div className="mb-3">
                <label htmlFor="imagenInterior" className="form-label">
                  Imagen lateral derecha
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  id="imagenLateralDerecha"
                  onChange={(e) => handleImageUpload(e, "DERECHA")}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="imagenLateral" className="form-label">
                  Imagen lateral izquierda
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  id="imagenLateralIzquierda"
                  onChange={(e) => handleImageUpload(e, "IZQUIERDA")}
                />
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
          message="¡Datos del equino actualizados con éxito!"
          type="success"
          onClose={() => setShowSuccessAlert(false)}
        />
      )}
    </div>
  );
};

export default EquineEdit;
