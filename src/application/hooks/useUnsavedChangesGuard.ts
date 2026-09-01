import { useCallback, useEffect, useRef } from "react";
import { useBlocker } from "react-router-dom";

export type NavigationBlocker = ReturnType<typeof useBlocker>;

export interface UnsavedChangesGuard {
  blocker: NavigationBlocker;
  /**
   * Başarılı bir kayıt sonrası yapılan programatik yönlendirmeyi (navigate)
   * blocker'a takılmadan bir kerelik geçirir. onSubmit içinde navigate()'ten
   * hemen önce çağrılmalıdır.
   */
  allowNextNavigation: () => void;
}

/**
 * Kaydedilmemiş değişiklik varken sayfadan ayrılmayı engeller: uygulama içi
 * yönlendirmeler (Link, navigate, sidebar) router seviyesinde bloklanır ve
 * modal onayı bekler; sekme kapatma/yenileme `beforeunload` ile korunur.
 *
 * Router'ın veri yönlendiricisi (createBrowserRouter) kullanması gerekir.
 */
export const useUnsavedChangesGuard = (isDirty: boolean): UnsavedChangesGuard => {
  const bypassRef = useRef(false);

  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) => {
        if (bypassRef.current) {
          bypassRef.current = false;
          return false;
        }
        return (
          isDirty &&
          (currentLocation.pathname !== nextLocation.pathname || currentLocation.search !== nextLocation.search)
        );
      },
      [isDirty]
    )
  );

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const allowNextNavigation = useCallback(() => {
    bypassRef.current = true;
  }, []);

  return { blocker, allowNextNavigation };
};

export default useUnsavedChangesGuard;
