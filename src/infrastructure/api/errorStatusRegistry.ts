const errorStatusByMessage = new Map<string, number>();
const maxRegistrySize = 100;
let lastRegisteredStatus: { statusCode: number; registeredAt: number } | null = null;

const normalizeMessage = (message: unknown): string | null => {
    if (typeof message !== "string") return null;

    const normalized = message.trim();
    return normalized.length > 0 ? normalized : null;
};

export const registerErrorStatus = (message: unknown, statusCode?: number): void => {
    const normalizedMessage = normalizeMessage(message);

    if (!normalizedMessage || !statusCode) return;

    if (errorStatusByMessage.size >= maxRegistrySize) {
        const firstKey = errorStatusByMessage.keys().next().value;
        if (firstKey) {
            errorStatusByMessage.delete(firstKey);
        }
    }

    errorStatusByMessage.set(normalizedMessage, statusCode);
    lastRegisteredStatus = {
        statusCode,
        registeredAt: Date.now(),
    };
};

export const getRegisteredErrorStatus = (message: unknown): number | undefined => {
    const normalizedMessage = normalizeMessage(message);
    return normalizedMessage ? errorStatusByMessage.get(normalizedMessage) : undefined;
};

export const getRecentErrorStatus = (maxAgeMs = 2000): number | undefined => {
    if (!lastRegisteredStatus) return undefined;

    const isRecent = Date.now() - lastRegisteredStatus.registeredAt <= maxAgeMs;
    return isRecent ? lastRegisteredStatus.statusCode : undefined;
};

export const resetErrorStatusRegistry = (): void => {
    errorStatusByMessage.clear();
    lastRegisteredStatus = null;
};

export const getErrorStatusCode = (error: unknown): number | undefined => {
    const candidate = error as {
        response?: { status?: number };
        status?: number;
        statusCode?: number;
    };

    return candidate?.response?.status ?? candidate?.statusCode ?? candidate?.status;
};
