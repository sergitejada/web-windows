import { useState, useEffect, useCallback } from "react";
import "./window.css";

interface Position {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

interface WindowProps {
  initialWidth?: number;
  initialheight?: number;
  initialPosition?: Position;
  initialMinimizedPosition?: Position;
  icon?: React.ReactNode;
  title: string;
}

const DEFAULT_WINDOW_STATE = {
  width: 320,
  height: 320,
  position: { top: 300, left: 300, bottom: 0, right: 0 },
  minimizedPosition: { left: 0, bottom: 10, right: 0, top: 0 },
};

export default function Window({
  initialWidth = DEFAULT_WINDOW_STATE.width,
  initialheight = DEFAULT_WINDOW_STATE.height,
  initialPosition = DEFAULT_WINDOW_STATE.position,
  initialMinimizedPosition = DEFAULT_WINDOW_STATE.minimizedPosition,
  icon,
  title,
}: WindowProps) {
  const [width, setWidth] = useState<number>(initialWidth);
  const [height, setHeight] = useState<number>(initialheight);
  const [posicion, setPosicion] = useState<Position>(initialPosition);
  const [minimizedPosition, setMinimizedPosition] = useState<Position>(
    initialMinimizedPosition
  );

  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [preview, setPreview] = useState(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [previousState, setPreviousState] = useState(null);

  const onMouseDown = (e) => {
    if (isMaximized || isMinimized) return;
    e.preventDefault();
    setDragging(true);
    setOffset({
      x: e.clientX - posicion.left,
      y: e.clientY - posicion.top,
    });
  };

  const onResizeStart = (direction) => (e) => {
    if (isMaximized || isMinimized) return;
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
      if (dragging && !isMaximized && !isMinimized) {
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
      } else if (resizing && !isMaximized && !isMinimized) {
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
    [dragging, resizing, offset, isMaximized, isMinimized]
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

  const handleMaximize = () => {
    if (isMaximized) {
      // Restaurar al estado anterior
      setIsMaximized(false);
      if (previousState) {
        setWidth(previousState.width);
        setHeight(previousState.height);
        setPosicion(previousState.posicion);
      }
    } else {
      // Guardar el estado actual y maximizar
      setPreviousState({ width, height, posicion });
      setIsMaximized(true);
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
      setPosicion({ top: 0, left: 0 });
    }
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    if (isMinimized) {
      // Restaurar al estado anterior
      setIsMinimized(false);
      if (previousState) {
        setWidth(previousState.width);
        setHeight(previousState.height);
        setPosicion(previousState.posicion);
      }
    } else {
      // Guardar el estado actual y minimizar
      setPreviousState({ width, height, posicion });
      setIsMinimized(true);
      setHeight(30); // Altura de la barra de título
      setPosicion({
        left: minimizedPosition.left,
        top: window.innerHeight - minimizedPosition.bottom - 30,
      });
    }
    setIsMaximized(false);
  };

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

  useEffect(() => {
    if (isMinimized) {
      setPosicion({
        left: minimizedPosition.left,
        top: window.innerHeight - minimizedPosition.bottom - 30,
        right: 0,
        bottom: 0,
      });
    }
  }, [isMinimized, minimizedPosition]);

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
      {preview && !isMinimized && (
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
        className={`window shadow-lg ${isMinimized ? "minimized" : ""}`}
        style={{
          top: `${posicion.top}px`,
          left: `${posicion.left}px`,
          position: "absolute",
          opacity: dragging ? 0.7 : 1,
          transition: "opacity 0.2s",
          width: isMinimized ? (icon ? "50px" : "200px") : `${width}px`,
          height: isMinimized ? "40px" : `${height}px`,
          overflow: "visible",
          cursor: isMinimized ? "default" : "auto",
        }}
        onClick={isMinimized ? handleMinimize : undefined}
      >
        <div
          className="bg-black cursor-move flex items-center justify-between"
          onMouseDown={onMouseDown}
          style={{
            cursor: isMinimized ? "pointer" : "move",
            userSelect: "none", // Esto evita la selección de texto
            WebkitUserSelect: "none", // Para navegadores basados en WebKit
            MozUserSelect: "none", // Para Firefox
            msUserSelect: "none", // Para IE/Edge
            height: "40px", // Header más grande
            padding: "0 10px",
            width: "100%",
          }}
        >
          <div className="flex items-center h-full">
            {icon && (
              <div
                className="text-white flex items-center justify-center"
                style={{
                  width: isMinimized ? "30px" : "24px",
                  height: isMinimized ? "30px" : "24px",
                  marginRight: isMinimized ? "0" : "10px",
                }}
              >
                {icon}
              </div>
            )}
            {(!isMinimized || !icon) && (
              <span className="text-white">{title}</span>
            )}
          </div>
          {!isMinimized && (
            <div className="flex gap-4 cursor-auto h-full items-center">
              <svg
                className="w-8 h-full text-white hover:bg-white/20 p-2"
                onClick={handleMinimize}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 12h14"
                />
              </svg>
              <svg
                className="w-8 h-full text-white p-2 hover:bg-white/20"
                onClick={handleMaximize}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M8 5a1 1 0 0 1 1-1h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-1a1 1 0 1 1 0-2h1V6H9a1 1 0 0 1-1-1Z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M4 7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H4Zm0 11v-5.5h11V18H4Z"
                  clipRule="evenodd"
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
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18 17.94 6M18 18 6.06 6"
                />
              </svg>
            </div>
          )}
        </div>
        {!isMinimized && (
          <div className="contenido">
            <p>Este es el contenido de la ventana.</p>
          </div>
        )}
        {!isMaximized && !isMinimized && resizeHandles}
      </div>
    </>
  );
}
