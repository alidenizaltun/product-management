import { beforeAll, afterEach, afterAll } from "vitest";
import "@testing-library/jest-dom";
import { server } from "./mocks/server";
import { resetAuthStore } from "./utils/resetStores";
import { resetErrorStatusRegistry } from "@/infrastructure/api/errorStatusRegistry";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => {
    server.resetHandlers();
    resetAuthStore();
    resetErrorStatusRegistry();
});
afterAll(() => server.close());
