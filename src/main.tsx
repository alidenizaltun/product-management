import React from "react";
import ReactDOM from 'react-dom/client';
import App from "./App";
import QueryProvider from "@/modules/shared/providers/QueryProvider";

import "./assets/scss/dashlite.scss";
import "./assets/scss/style-email.scss";
import "@tanstack/react-query";

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
      <QueryProvider>
        <App />
      </QueryProvider>
  </>
)
