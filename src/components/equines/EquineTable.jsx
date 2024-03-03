import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  getFirestore,
  collection,
  getDocs,
  query as firestoreQuery,
} from "firebase/firestore";
import { Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";

const EquineTable = () => {
  const { userRole } = useAuth();
  // Verifica si el usuario tiene el rol necesario
  if (!["VENDEDOR", "SUPERVISOR", "ADMINISTRADOR"].includes(userRole)) {
    return (
      <div className="container">
        <h3>No tienes permisos para acceder a este módulo.</h3>
      </div>
    );
  }
  const db = getFirestore();
  const [equines, setEquines] = useState([]);
  const [localEquines, setLocalEquines] = useState([]);
  const [filterCriador, setFilterCriador] = useState("");
  const [filterRaza, setFilterRaza] = useState("");
  const [filterPropietario, setFilterPropietario] = useState("");
  const [sortBy, setSortBy] = useState(""); // Puede ser 'añoAsc', 'añoDesc', 'precioAsc', 'precioDesc'
  const [propietarioOptions, setPropietarioOptions] = useState([]); // Opciones de propietario
  const [showCriadorOptions, setShowCriadorOptions] = useState(false);
  const [showRazaOptions, setShowRazaOptions] = useState(false);
  const [showPropietarioOptions, setShowPropietarioOptions] = useState(false);

  useEffect(() => {
    const fetchEquines = async () => {
      try {
        const equinesRef = collection(db, "equines");
        const queryFirestore = firestoreQuery(equinesRef);

        const querySnapshot = await getDocs(queryFirestore);
        const equinesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const equinesDataUpperCase = equinesData.map((equine) => ({
          id: equine.id,
          criador: (equine.CRIADOR || "").toUpperCase(),
          raza: (equine.RAZA || "").toUpperCase(),
          propietario: (equine.PROPIETARIO || "").toUpperCase(),
        }));

        setLocalEquines(equinesDataUpperCase);
        setEquines(equinesDataUpperCase);
        // Obtener las opciones únicas de propietario
        const uniquePropietarioOptions = Array.from(
          new Set(equinesDataUpperCase.map((equine) => equine.PROPIETARIO))
        );

        // Filtrar opciones duplicadas y agregar la opción "Todos"
        const filteredPropietarioOptions = [
          "Todos",
          ...uniquePropietarioOptions,
        ];

        setPropietarioOptions(filteredPropietarioOptions);
      } catch (error) {
        console.error("Error buscando equinos:", error);
      }
    };

    fetchEquines();
  }, [db]);

  useEffect(() => {
    // Filtrar y ordenar localmente
    let filteredEquines = [...localEquines];

    if (filterCriador) {
      const uppercaseFilterCriador = filterCriador.toUpperCase().trim();
      filteredEquines = filteredEquines.filter((equine) =>
        equine.CRIADOR.includes(uppercaseFilterCriador)
      );
    }

    if (filterRaza) {
      const uppercaseFilterRaza = filterRaza.toUpperCase().trim();
      filteredEquines = filteredEquines.filter((equine) =>
        equine.RAZA.includes(uppercaseFilterRaza)
      );
    }

    if (filterPropietario && filterPropietario !== "Todos") {
      const uppercaseFilterPropietario = filterPropietario.toUpperCase().trim();
      filteredEquines = filteredEquines.filter((equine) =>
        equine.PROPIETARIO.includes(uppercaseFilterPropietario)
      );
    }

    if (sortBy) {
      const orderField = sortBy.includes("año") ? "año" : "precio";
      const orderDirection = sortBy.includes("Asc") ? 1 : -1;
      filteredEquines.sort((a, b) => {
        if (a[orderField] < b[orderField]) return -orderDirection;
        if (a[orderField] > b[orderField]) return orderDirection;
        return 0;
      });
    }

    setEquines(filteredEquines);
  }, [localEquines, filterCriador, filterRaza, filterPropietario, sortBy]);

  const handleFilterCriador = (value) => {
    setFilterCriador(value);
    setShowCriadorOptions(false);
    applyFiltersLocally();
  };

  const handleFilterRaza = (value) => {
    setFilterRaza(value);
    setShowRazaOptions(false);
    applyFiltersLocally();
  };

  const handleFilterPropietario = (value) => {
    setFilterPropietario(value.toUpperCase());
    setShowPropietarioOptions(false);
    applyFiltersLocally();
  };

  const handleUpdateFromServer = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "equines"));
      const updatedEquinesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLocalEquines(updatedEquinesData);
      setEquines(updatedEquinesData);
    } catch (error) {
      console.error("Error updating equines from server:", error);
    }
  };

  return (
    <div className="container">
      <h3 className="title">Lista de Equinos</h3>

      {/* Controles de Filtros y Orden */}
      <div className="mb-3">
        <label className="me-2">Filtrar por Criador:</label>
        <div className="filter-container">
          <input
            type="text"
            value={filterCriador}
            onChange={(e) => handleFilterCriador(e.target.value)}
            onClick={() => setShowCriadorOptions(true)}
          />
          {showCriadorOptions && (
            <div className="filter-options">
              {equines
                .map((equine) => equine.CRIADOR)
                .filter((value, index, self) => self.indexOf(value) === index)
                .map((option, index) => (
                  <div key={index} onClick={() => handleFilterCriador(option)}>
                    {option}
                  </div>
                ))}
            </div>
          )}
        </div>

        <label className="mx-2">Filtrar por Raza:</label>
        <div className="filter-container">
          <input
            type="text"
            value={filterRaza}
            onChange={(e) => handleFilterRaza(e.target.value)}
            onClick={() => setShowRazaOptions(true)}
          />
          {showRazaOptions && (
            <div className="filter-options">
              {equines
                .map((equine) => equine.RAZA)
                .filter((value, index, self) => self.indexOf(value) === index)
                .map((option, index) => (
                  <div key={index} onClick={() => handleFilterRaza(option)}>
                    {option}
                  </div>
                ))}
            </div>
          )}
        </div>

        <label className="mx-2">Filtrar por Propietario:</label>
        <div className="filter-container">
          <select
            value={filterPropietario}
            onChange={(e) => handleFilterPropietario(e.target.value)}
            onClick={() => setShowPropietarioOptions(true)}
          >
            {propietarioOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
          {showPropietarioOptions && (
            <div className="filter-options">
              {propietarioOptions.map((option, index) => (
                <div
                  key={index}
                  onClick={() => handleFilterPropietario(option)}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="mx-2">Ordenar por:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="">Ninguno</option>
          <option value="añoAsc">Año (Ascendente)</option>
          <option value="añoDesc">Año (Descendente)</option>
          <option value="precioAsc">Precio (Ascendente)</option>
          <option value="precioDesc">Precio (Descendente)</option>
        </select>

        <Button
          variant="secondary"
          className="mx-2"
          onClick={handleUpdateFromServer}
        >
          Actualizar desde el servidor
        </Button>
      </div>

      {/* Tabla de Equinos */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => setSortBy("CRIADOR")}>Criador</th>
            <th onClick={() => setSortBy("RAZA")}>Raza</th>
            <th>Nombre</th>
            <th onClick={() => setSortBy("MADRE")}>Madre</th>
            <th onClick={() => setSortBy("PADRE")}>Padre</th>
            <th onClick={() => setSortBy("FECHANACIMIENTO")}>
              Nacimiento{" "}
              {sortBy === "añoAsc" ? "↑" : sortBy === "añoDesc" ? "↓" : ""}
            </th>
            <th>Sexo</th>
            <th onClick={() => setSortBy("PROPIETARIO")}>
              Propietario{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-funnel"
                viewBox="0 0 16 16"
              >
                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2z" />
              </svg>
            </th>
            {/* <th>
              Edad{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-caret-down"
                viewBox="0 0 16 16"
              >
                <path d="M3.204 5h9.592L8 10.481zm-.753.659 4.796 5.48a1 1 0 0 0 1.506 0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 0 0-.753 1.659" />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-caret-up"
                viewBox="0 0 16 16"
              >
                <path d="M3.204 11h9.592L8 5.519zm-.753-.659 4.796-5.48a1 1 0 0 1 1.506 0l4.796 5.48c.566.647.106 1.659-.753 1.659H3.204a1 1 0 0 1-.753-1.659" />
              </svg>
            </th> */}
            {/* <th onClick={() => setSortBy("precio")}>
              Precio
              {sortBy === "precioAsc"
                ? "↑"
                : sortBy === "precioDesc"
                ? "↓"
                : ""}
            </th> */}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {equines.map((equine) => (
            <tr key={equine.id}>
              <td>{equine.CRIADOR}</td>
              <td>{equine.RAZA}</td>
              <td>{equine.NOMBRE}</td>
              <td>{equine.MADRE}</td>
              <td>{equine.PADRE}</td>
              <td>{equine.FECHANACIMIENTO}</td>
              <td>{equine.SEXO}</td>
              <td>{equine.PROPIETARIO}</td>
              {/* <td>{equine.kms}</td> */}
              {/* <td>{equine.precio}</td> */}
              <td>
                <Link to={`/editarequino/${equine.id}`}>
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
  );
};

export default EquineTable;
