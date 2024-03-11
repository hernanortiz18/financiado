import React from "react";
import { useNavigate } from "react-router-dom";

const CancelButton = () => {
  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(-1); // Navega hacia atrás en la historia
  };

  return (
    <button
      type="button"
      className="btn btn-secondary me-2"
      onClick={handleCancel}
    >
      Cancelar
    </button>
  );
};

export default CancelButton;
