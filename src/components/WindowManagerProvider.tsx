import { createContext, useCallback, useContext, useState } from "react";
import { Window } from "./Window";

interface WindowData {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

interface WindowManagerProps {
  initialWindows?: WindowData[];
}

interface WindowManagerProviderProps {
  children: React.ReactNode;
  initialWindows?: WindowData[];
}

interface WindowContextType {
  addWindow: (windowData: Omit<WindowData, "id">) => void;
  removeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export const useWindowManager = () => {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error(
      "useWindowManager must be used within a WindowManagerProvider"
    );
  }
  return context;
};

export const WindowManagerProvider: React.FC<WindowManagerProviderProps> = ({
  children,
  initialWindows = [],
}) => {
  const [windows, setWindows] = useState<WindowData[]>(initialWindows);
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([]);

  const addWindow = useCallback((windowData: Omit<WindowData, "id">) => {
    const newWindow = { ...windowData, id: Date.now().toString() };
    setWindows((prevWindows) => [...prevWindows, newWindow]);
  }, []);

  const removeWindow = useCallback((id: string) => {
    setWindows((prevWindows) =>
      prevWindows.filter((window) => window.id !== id)
    );
    setMinimizedWindows((prevMinimized) =>
      prevMinimized.filter((winId) => winId !== id)
    );
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setMinimizedWindows((prevMinimized) =>
      prevMinimized.includes(id)
        ? prevMinimized.filter((winId) => winId !== id)
        : [...prevMinimized, id]
    );
  }, []);

  const contextValue = {
    addWindow,
    removeWindow,
    minimizeWindow,
  };

  return (
    <WindowContext.Provider value={contextValue}>
      {children}
      <div className="window-manager">
        {windows.map((window) => (
          <Window
            key={window.id}
            id={window.id}
            title={window.title}
            icon={window.icon}
            content={window.content}
            onMinimize={minimizeWindow}
            onClose={removeWindow}
            minimizedIndex={minimizedWindows.indexOf(window.id)}
            isMinimized={minimizedWindows.includes(window.id)}
          />
        ))}
      </div>
    </WindowContext.Provider>
  );
};

export { WindowManager };
