import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router-dom";

function makeQueryClient() {
 return new QueryClient({
 defaultOptions: {
 queries: { retry: false },
 mutations: { retry: false },
 },
 });
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
 initialPath?: string;
 routePath?: string;
}

export function renderWithProviders(
 ui: React.ReactElement,
 { initialPath = "/", routePath = "/", ...options }: RenderWithProvidersOptions = {}
) {
 const queryClient = makeQueryClient();

 const Wrapper = ({ children }: { children: React.ReactNode }) => (
 <QueryClientProvider client={queryClient}>
 <MemoryRouter initialEntries={[initialPath]}>
 <Routes>
 <Route path={routePath} element={children} />
 </Routes>
 </MemoryRouter>
 </QueryClientProvider>
 );

 return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}
