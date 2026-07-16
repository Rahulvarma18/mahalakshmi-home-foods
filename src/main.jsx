import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";


import { Toaster } from "sonner";

import AppProviders from "./context/AppProviders";

import App from "./App";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(

  <React.StrictMode>

    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>

      <BrowserRouter>

        <AppProviders>

          <Toaster richColors />

          <App />

        </AppProviders>

      </BrowserRouter>

    </GoogleOAuthProvider>

  </React.StrictMode>

);