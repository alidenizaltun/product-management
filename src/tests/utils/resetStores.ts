import { useAuthStore } from "@/application/stores/authStore";

const initialAuthState = useAuthStore.getState();

export function resetAuthStore() {
    useAuthStore.setState(initialAuthState, true);
}
