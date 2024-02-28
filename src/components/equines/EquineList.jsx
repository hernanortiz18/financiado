import { EquinoCard } from "./EquinoCard";

export const EquineList = ({ items }) => {
  return (
    <div className="d-flex flex-wrap justify-content-center">
      {items.map((item, index) => (
        <EquinoCard key={item.id} item={item} index={index} className="mx-auto" />
      ))}
    </div>
  );
};