import { useState, useEffect, useCallback } from "react";
import "./window.css";

export default function Window() {
  const [width, setWidth] = useState(320);
  const [height, setHeight] = useState(320);
  const [posicion, setPosicion] = useState({ top: 300, left: 300 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [preview, setPreview] = useState(null); // null, 'left', or 'right'

  const onMouseDown = (e: { clientX: number; clientY: number }) => {
    setDragging(true);
    setOffset({
      x: e.clientX - posicion.left,
      y: e.clientY - posicion.top,
    });
  };

  const handleMouseMove = useCallback(
    (e: { clientX: number; clientY: number }) => {
      if (dragging) {
        const newLeft = e.clientX - offset.x;
        const newTop = e.clientY - offset.y;

        // Calcular la posición del borde derecho de la ventana
        // const rightEdge = newLeft + width;

        // Obtener el ancho de la ventana del navegador
        const windowWidth = window.innerWidth;

        // Comprobar si el cursor está cerca de los bordes del navegador
        if (e.clientX < 10) {
          setPreview("left");
        } else if (windowWidth - e.clientX < 10) {
          setPreview("right");
        } else {
          setPreview(null);
        }

        setPosicion({
          top: newTop,
          left: newLeft,
        });
      }
    },
    [dragging, offset]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);

    if (preview === "left") {
      setPosicion({ top: 0, left: 0 });
      setWidth(window.innerWidth / 2);
      setHeight(window.innerHeight);
    } else if (preview === "right") {
      setPosicion({ top: 0, left: window.innerWidth / 2 });
      setWidth(window.innerWidth / 2);
      setHeight(window.innerHeight);
    }

    setPreview(null);
  }, [preview]);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <>
      {preview && (
        <div
          className="preview"
          style={{
            position: "fixed",
            top: 0,
            left: preview === "left" ? 0 : "50%",
            width: "50%",
            height: "100%",
            background: "rgba(0, 0, 255, 0.2)",
            zIndex: 9999,
          }}
        />
      )}
      <div
        className="bg-red-300 window shadow-xl rounded "
        style={{
          top: `${posicion.top}px`,
          left: `${posicion.left}px`,
          position: "absolute",
          opacity: dragging ? 0.7 : 1,
          transition: "opacity 0.2s",
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <div
          className="bg-blue-300 cursor-move rounded-t"
          onMouseDown={onMouseDown}
        >
          Header
        </div>
        <div className="contenido">
          <p>Este es el contenido de la ventana.</p>
        </div>
      </div>
    </>
  );
}
