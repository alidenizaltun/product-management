import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createMemoryRouter } from "react-router-dom";

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
 // Testte de gerçek uygulamadaki gibi veri yönlendiricisi (data router)
 // kullanılır; aksi halde useBlocker gibi router hook'ları çalışmaz.
 const router = createMemoryRouter([{ path: routePath, element: ui }], {
 initialEntries: [initialPath],
 });

 const Wrapper = () => (
 <QueryClientProvider client={queryClient}>
 <RouterProvider router={router} />
 </QueryClientProvider>
 );

 return { queryClient, ...render(<Wrapper />, options) };
}
