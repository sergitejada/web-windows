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
        className="window shadow-lg rounded"
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
          className="bg-black cursor-move rounded-t flex items-center justify-between"
          onMouseDown={onMouseDown}
        >
          <span className="p-1 text-white">Header</span>
          <div className="flex gap-4 cursor-auto h-full items-center">
            <svg
              className="w-8 h-full text-white hover:bg-white/20 p-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 12h14"
              />
            </svg>
            <svg
              className="w-8 h-full text-white p-2 hover:bg-white/20"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M8 5a1 1 0 0 1 1-1h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-1a1 1 0 1 1 0-2h1V6H9a1 1 0 0 1-1-1Z"
                clip-rule="evenodd"
              />
              <path
                fill-rule="evenodd"
                d="M4 7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H4Zm0 11v-5.5h11V18H4Z"
                clip-rule="evenodd"
              />
            </svg>
            <svg
              className="w-8 h-full text-white p-2 hover:bg-white/20"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18 17.94 6M18 18 6.06 6"
              />
            </svg>
          </div>
        </div>
        <div className="contenido">
          <p>Este es el contenido de la ventana.</p>
        </div>
        {resizeHandles}
      </div>
    </>
  );
}
