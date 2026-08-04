import { useAuth } from "@/modules/auth/hooks/useAuth";

/**
 * Backend henüz kullanıcı bazlı bir permission/claim seti döndürmüyor
 * (User.roles hiçbir yerde tüketilmiyor). Bu hook o yüzden şimdilik her
 * zaman true döner; tüketen bileşenler değişmeden, backend permission
 * modeli eklendiğinde sadece burası güncellenerek gerçek kontrole geçilir.
 */
export const usePermission = (_permissionKey?: string): boolean => {
    const { user } = useAuth();
    void user;
    void _permissionKey;
    return true;
};
