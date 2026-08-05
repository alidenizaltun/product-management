import { useAuth } from "@/modules/auth/hooks/useAuth";

// Backend'deki Permissions.BypassRoles ile birebir aynı tutulmalı.
const BYPASS_ROLES = ["Admin", "SuperAdmin"];

/**
 * permissionKey verilmezse (genel bir kontrol yoksa) true döner.
 * BYPASS_ROLES içindeki rollere sahip kullanıcılar her zaman yetkilidir;
 * diğerleri için backend'den /api/auth/me ile gelen permissions listesi
 * kontrol edilir.
 */
export const usePermission = (permissionKey?: string): boolean => {
    const { user } = useAuth();

    if (!permissionKey) {
        return true;
    }

    if (user?.roles?.some((r) => BYPASS_ROLES.includes(r))) {
        return true;
    }

    return user?.permissions?.includes(permissionKey) ?? false;
};
