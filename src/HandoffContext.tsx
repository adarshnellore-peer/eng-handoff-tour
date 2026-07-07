import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type { HandoffManifest, HandoffTab } from "./types";
import { resolveSpotlightElement } from "./spotlightUtils";

interface HandoffContextValue {
  manifest: HandoffManifest;
  handoffOn: boolean;
  tourStarted: boolean;
  tourActive: boolean;
  stepIndex: number;
  currentStep: HandoffManifest["steps"][number] | undefined;
  totalSteps: number;
  activeTab: HandoffTab;
  setActiveTab: (tab: HandoffTab) => void;
  setHandoffOn: (on: boolean) => void;
  beginTour: () => void;
  endHandoff: () => void;
  nextStep: () => void;
  prevStep: () => void;
  registerTarget: (id: string, ref: RefObject<HTMLElement | null>) => void;
  unregisterTarget: (id: string) => void;
  getTargetElement: (id: string) => HTMLElement | null;
  getSpotlightElement: (id: string) => HTMLElement | null;
}

const HandoffContext = createContext<HandoffContextValue | null>(null);

export function useHandoff(): HandoffContextValue {
  const ctx = useContext(HandoffContext);
  if (!ctx) {
    throw new Error("useHandoff must be used within HandoffProvider");
  }
  return ctx;
}

export function useHandoffOptional(): HandoffContextValue | null {
  return useContext(HandoffContext);
}

interface HandoffProviderProps {
  manifest: HandoffManifest;
  children: ReactNode;
}

export function HandoffProvider({ manifest, children }: HandoffProviderProps) {
  const [handoffOn, setHandoffOnState] = useState(false);
  const [tourStarted, setTourStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<HandoffTab>("overview");
  const targetsRef = useRef<Map<string, RefObject<HTMLElement | null>>>(
    new Map(),
  );

  const registerTarget = useCallback(
    (id: string, ref: RefObject<HTMLElement | null>) => {
      targetsRef.current.set(id, ref);
    },
    [],
  );

  const unregisterTarget = useCallback((id: string) => {
    targetsRef.current.delete(id);
  }, []);

  const getTargetElement = useCallback((id: string) => {
    const ref = targetsRef.current.get(id);
    return ref?.current ?? null;
  }, []);

  const getSpotlightElement = useCallback(
    (id: string) => {
      const wrapper = getTargetElement(id);
      if (!wrapper) {
        return null;
      }
      return resolveSpotlightElement(wrapper);
    },
    [getTargetElement],
  );

  const setHandoffOn = useCallback((on: boolean) => {
    if (!on) {
      setHandoffOnState(false);
      setTourStarted(false);
      setStepIndex(0);
      return;
    }
    setHandoffOnState(true);
    setTourStarted(false);
    setStepIndex(0);
    setActiveTab("overview");
  }, []);

  const beginTour = useCallback(() => {
    setTourStarted(true);
    setStepIndex(0);
    setActiveTab("overview");
  }, []);

  const endHandoff = useCallback(() => {
    setHandoffOnState(false);
    setTourStarted(false);
    setStepIndex(0);
  }, []);

  const nextStep = useCallback(() => {
    setStepIndex((i) => {
      if (i >= manifest.steps.length - 1) {
        setHandoffOnState(false);
        setTourStarted(false);
        return i;
      }
      setActiveTab("overview");
      return i + 1;
    });
  }, [manifest.steps.length]);

  const prevStep = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
    setActiveTab("overview");
  }, []);

  useEffect(() => {
    if (!handoffOn) {
      return undefined;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        endHandoff();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handoffOn, endHandoff]);

  const value = useMemo(
    (): HandoffContextValue => ({
      manifest,
      handoffOn,
      tourStarted,
      tourActive: handoffOn && tourStarted,
      stepIndex,
      currentStep: tourStarted ? manifest.steps[stepIndex] : undefined,
      totalSteps: manifest.steps.length,
      activeTab,
      setActiveTab,
      setHandoffOn,
      beginTour,
      endHandoff,
      nextStep,
      prevStep,
      registerTarget,
      unregisterTarget,
      getTargetElement,
      getSpotlightElement,
    }),
    [
      manifest,
      handoffOn,
      tourStarted,
      stepIndex,
      activeTab,
      setHandoffOn,
      beginTour,
      endHandoff,
      nextStep,
      prevStep,
      registerTarget,
      unregisterTarget,
      getTargetElement,
      getSpotlightElement,
    ],
  );

  return (
    <HandoffContext.Provider value={value}>{children}</HandoffContext.Provider>
  );
}
