import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { HandoffNavigation } from "./types";

/** React Router v6 adapter — pass to HandoffShell / HandoffRootLayout. */
export function useHandoffReactRouterNavigation(): HandoffNavigation {
  const navigate = useNavigate();
  const location = useLocation();

  return useMemo(
    (): HandoffNavigation => ({
      getPath: () => `${location.pathname}${location.search}`,
      navigate: (path) => {
        navigate(path);
      },
    }),
    [navigate, location.pathname, location.search],
  );
}
