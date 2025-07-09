import { useEffect } from "react";

export function useDisableScroll() {
  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.removeProperty("overflow");
    };
  }, []);
}
