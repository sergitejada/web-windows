import { useState, useEffect, useCallback } from "react";
import "./window.css";

export default function Window() {
  const [posicion, setPosicion] = useState({ top: 300, left: 300 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onMouseDown = (e: { clientX: number; clientY: number }) => {
    setDragging(true);
    setOffset({
      x: e.clientX - posicion.left,
      y: e.clientY - posicion.top,
    });
  };

  const handleMouseMove = useCallback(
    (e: { clientY: number; clientX: number }) => {
      if (dragging) {
        setPosicion({
          top: e.clientY - offset.y,
          left: e.clientX - offset.x,
        });
      }
    },
    [dragging, offset]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div
      className="bg-red-300 window size-80"
      style={{
        top: `${posicion.top}px`,
        left: `${posicion.left}px`,
        position: "absolute",
        opacity: dragging ? 0.7 : 1, // Ajustar la opacidad mientras se arrastra
        transition: "opacity 0.2s", // Transición suave
      }}
    >
      <div className="bg-blue-300 cursor-move" onMouseDown={onMouseDown}>
        Header
      </div>
      <div className="contenido">
        <p>Este es el contenido de la ventana.</p>
      </div>
    </div>
  );
}
