"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SchedulerContextType {
  isRunning: boolean;
  setIsRunning: (isRunning: boolean) => void;
  interval: number;
  setInterval: (interval: number) => void;
}

const SchedulerContext = createContext<SchedulerContextType | undefined>(undefined);

export const SchedulerProvider = ({ children }: { children: ReactNode }) => {
  // Default to true in dev, false in prod (though this context is mainly for dev simulation)
  const [isRunning, setIsRunningState] = useState(true);
  const [interval, setIntervalState] = useState(30000); // Default 30s
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load state from localStorage on mount
    const storedRunning = localStorage.getItem("dev_scheduler_running");
    if (storedRunning !== null) {
      setIsRunningState(storedRunning === "true");
    }
    
    const storedInterval = localStorage.getItem("dev_scheduler_interval");
    if (storedInterval !== null) {
      setIntervalState(Number(storedInterval));
    }
    
    setIsInitialized(true);
  }, []);

  const setIsRunning = (value: boolean) => {
    setIsRunningState(value);
    localStorage.setItem("dev_scheduler_running", String(value));
  };

  const setInterval = (value: number) => {
    setIntervalState(value);
    localStorage.setItem("dev_scheduler_interval", String(value));
  };

  if (!isInitialized) {
    return null; // or a loading spinner if needed, but preventing flash is better
  }

  return (
    <SchedulerContext.Provider value={{ isRunning, setIsRunning, interval, setInterval }}>
      {children}
    </SchedulerContext.Provider>
  );
};

export const useScheduler = () => {
  const context = useContext(SchedulerContext);
  if (context === undefined) {
    throw new Error("useScheduler must be used within a SchedulerProvider");
  }
  return context;
};
