"use client";

import { Provider } from "react-redux";

import { store } from "@/src/redux/store";
import { Toaster } from "sonner";

export function ReduxProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster />
    </Provider>
  );
}
