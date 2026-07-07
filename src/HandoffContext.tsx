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
import {
  readPersistedTourState,
  writePersistedTourState,
} from "./handoffPersistence";
import { matchesHandoffRoute } from "./routeUtils";
import { resolveSpotlightElement } from "./spotlightUtils";
import type { HandoffManifest, HandoffNavigation, HandoffPreviewRegistry, HandoffTab } from "./types";

interface HandoffContextValue {
  manifest: HandoffManifest;
  handoffOn: boolean;
  tourStarted: boolean;
  tourActive: boolean;
  isNavigating: boolean;
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
  registerTargetElement: (id: string, element: HTMLElement | null) => void;
  getTargetElement: (id: string) => HTMLElement | null;
  getSpotlightElement: (id: string) => HTMLElement | null;
  previews: HandoffPreviewRegistry;
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
  navigation?: HandoffNavigation;
  /** Keep tour running across route changes (required for multi-page tours) */
  persistTourState?: boolean;
  /** Live component previews keyed by step targetId */
  previews?: HandoffPreviewRegistry;
}

const TARGET_WAIT_MS = 12000;
const TARGET_POLL_MS = 150;

export function HandoffProvider({
  manifest,
  children,
  navigation,
  persistTourState = false,
  previews = {},
}: HandoffProviderProps) {
  const persisted = persistTourState ? readPersistedTourState() : null;
  const restore =
    persisted?.manifestId === manifest.id && persisted.handoffOn
      ? persisted
      : null;

  const [handoffOn, setHandoffOnState] = useState(restore?.handoffOn ?? false);
  const [tourStarted, setTourStarted] = useState(restore?.tourStarted ?? false);
  const [stepIndex, setStepIndex] = useState(restore?.stepIndex ?? 0);
  const [activeTab, setActiveTab] = useState<HandoffTab>("overview");
  const [isNavigating, setIsNavigating] = useState(false);
  const targetsRef = useRef<Map<string, RefObject<HTMLElement | null>>>(
    new Map(),
  );
  const elementTargetsRef = useRef<Map<string, HTMLElement>>(new Map());
  const navigationRef = useRef(navigation);
  navigationRef.current = navigation;

  const persist = useCallback(
    (next: {
      handoffOn: boolean;
      tourStarted: boolean;
      stepIndex: number;
    }) => {
      if (!persistTourState) {
        return;
      }
      writePersistedTourState(
        next.handoffOn
          ? {
              manifestId: manifest.id,
              handoffOn: next.handoffOn,
              tourStarted: next.tourStarted,
              stepIndex: next.stepIndex,
            }
          : null,
      );
    },
    [manifest.id, persistTourState],
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

  const registerTargetElement = useCallback(
    (id: string, element: HTMLElement | null) => {
      if (element) {
        elementTargetsRef.current.set(id, element);
      } else {
        elementTargetsRef.current.delete(id);
      }
    },
    [],
  );

  const getTargetElement = useCallback((id: string) => {
    const element = elementTargetsRef.current.get(id);
    if (element?.isConnected) {
      return element;
    }
    if (element) {
      elementTargetsRef.current.delete(id);
    }
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

  const setHandoffOn = useCallback(
    (on: boolean) => {
      if (!on) {
        setHandoffOnState(false);
        setTourStarted(false);
        setStepIndex(0);
        setIsNavigating(false);
        persist({ handoffOn: false, tourStarted: false, stepIndex: 0 });
        return;
      }
      setHandoffOnState(true);
      setTourStarted(false);
      setStepIndex(0);
      setActiveTab("overview");
      persist({ handoffOn: true, tourStarted: false, stepIndex: 0 });
    },
    [persist],
  );

  const beginTour = useCallback(() => {
    setTourStarted(true);
    setStepIndex(0);
    setActiveTab("overview");
    persist({ handoffOn: true, tourStarted: true, stepIndex: 0 });
  }, [persist]);

  const endHandoff = useCallback(() => {
    setHandoffOnState(false);
    setTourStarted(false);
    setStepIndex(0);
    setIsNavigating(false);
    persist({ handoffOn: false, tourStarted: false, stepIndex: 0 });
  }, [persist]);

  const nextStep = useCallback(() => {
    setStepIndex((i) => {
      if (i >= manifest.steps.length - 1) {
        setHandoffOnState(false);
        setTourStarted(false);
        setIsNavigating(false);
        persist({ handoffOn: false, tourStarted: false, stepIndex: i });
        return i;
      }
      const next = i + 1;
      setActiveTab("overview");
      persist({ handoffOn: true, tourStarted: true, stepIndex: next });
      return next;
    });
  }, [manifest.steps.length, persist]);

  const prevStep = useCallback(() => {
    setStepIndex((i) => {
      const next = Math.max(0, i - 1);
      setActiveTab("overview");
      persist({ handoffOn: true, tourStarted: true, stepIndex: next });
      return next;
    });
  }, [persist]);

  const currentStep = tourStarted ? manifest.steps[stepIndex] : undefined;

  // Route navigation + wait for target mount after page change
  useEffect(() => {
    if (!tourStarted || !currentStep) {
      setIsNavigating(false);
      return undefined;
    }

    const nav = navigationRef.current;
    const { route, routeMatch, targetId } = currentStep;

    if (!route || !nav) {
      setIsNavigating(false);
      return undefined;
    }

    let cancelled = false;
    let pollId: number | undefined;

    const waitForTarget = () => {
      const started = Date.now();
      pollId = window.setInterval(() => {
        if (cancelled) {
          return;
        }
        if (getTargetElement(targetId)) {
          setIsNavigating(false);
          window.clearInterval(pollId);
          return;
        }
        if (Date.now() - started > TARGET_WAIT_MS) {
          setIsNavigating(false);
          window.clearInterval(pollId);
        }
      }, TARGET_POLL_MS);
    };

    const run = () => {
      const currentPath = nav.getPath();
      if (
        matchesHandoffRoute(currentPath, route, routeMatch ?? "exact")
      ) {
        if (getTargetElement(targetId)) {
          setIsNavigating(false);
        } else {
          setIsNavigating(true);
          waitForTarget();
        }
        return;
      }

      setIsNavigating(true);
      void Promise.resolve(nav.navigate(route)).then(() => {
        if (cancelled) {
          return;
        }
        waitForTarget();
      });
    };

    run();

    return () => {
      cancelled = true;
      if (pollId !== undefined) {
        window.clearInterval(pollId);
      }
    };
  }, [tourStarted, stepIndex, currentStep, getTargetElement]);

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
      tourActive: handoffOn && tourStarted && !isNavigating,
      isNavigating,
      stepIndex,
      currentStep,
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
      registerTargetElement,
      getTargetElement,
      getSpotlightElement,
      previews,
    }),
    [
      manifest,
      handoffOn,
      tourStarted,
      isNavigating,
      stepIndex,
      currentStep,
      activeTab,
      setHandoffOn,
      beginTour,
      endHandoff,
      nextStep,
      prevStep,
      registerTarget,
      unregisterTarget,
      registerTargetElement,
      getTargetElement,
      getSpotlightElement,
      previews,
    ],
  );

  return (
    <HandoffContext.Provider value={value}>{children}</HandoffContext.Provider>
  );
}
