import { useState, useEffect, useCallback, SetStateAction } from "react";
import "./window.css";

export default function Window() {
  const [width, setWidth] = useState(320);
  const [height, setHeight] = useState(320);
  const [posicion, setPosicion] = useState({ top: 300, left: 300 });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [preview, setPreview] = useState(null); // null, 'left', or 'right'

  const onMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    setOffset({
      x: e.clientX - posicion.left,
      y: e.clientY - posicion.top,
    });
  };

  const onResizeStart = (direction) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(direction);
    setOffset({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (dragging) {
        e.preventDefault();
        const newLeft = e.clientX - offset.x;
        const newTop = e.clientY - offset.y;

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
      } else if (resizing) {
        e.preventDefault();
        const deltaX = e.clientX - offset.x;
        const deltaY = e.clientY - offset.y;

        console.log(resizing.includes("se"));
        if (resizing.includes("e"))
          setWidth((width) => Math.max(width + deltaX, 100));
        if (resizing.includes("w")) {
          setWidth((width) => Math.max(width - deltaX, 100));
          setPosicion((pos) => ({ ...pos, left: pos.left + deltaX }));
        }
        if (resizing.includes("s"))
          setHeight((height) => Math.max(height + deltaY, 100));
        if (resizing.includes("n")) {
          setHeight((height) => Math.max(height - deltaY, 100));
          setPosicion((pos) => ({ ...pos, top: pos.top + deltaY }));
        }

        setOffset({
          x: e.clientX,
          y: e.clientY,
        });
      }
    },
    [dragging, resizing, offset]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
    setResizing(null);

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
    const handleGlobalMouseMove = (e) => {
      if (dragging || resizing) {
        e.preventDefault();
        handleMouseMove(e);
      }
    };

    const handleGlobalMouseUp = (e) => {
      if (dragging || resizing) {
        e.preventDefault();
        handleMouseUp();
      }
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, dragging, resizing]);

  const resizeHandles = ["n", "e", "s", "w", "ne", "nw", "se", "sw"].map(
    (dir) => (
      <div
        key={dir}
        className={`resize-handle ${dir}`}
        onMouseDown={onResizeStart(dir)}
        style={{
          position: "absolute",
          [dir.includes("n") ? "top" : "bottom"]: "-5px",
          [dir.includes("w") ? "left" : "right"]: "-5px",
          width: dir.length === 1 ? "100%" : "10px",
          height: dir.length === 1 ? "10px" : "100%",
          cursor: dir.length === 1 ? `${dir}-resize` : `${dir}-resize`,
        }}
      />
    )
  );

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
            userSelect: "none",
          }}
        />
      )}
      <div
        className="bg-red-300 window shadow-xl rounded"
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
        {resizeHandles}
      </div>
    </>
  );
}
