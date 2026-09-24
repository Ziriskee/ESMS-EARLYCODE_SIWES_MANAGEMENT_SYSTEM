import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./app/layout";
import "./styles/theme.css";
import "./app/globals.css";
import ThemeProvider from "./contexts/ThemeContext";
import { CampusFilterProvider } from "@/contexts/CampusFilterProvider";
import { AuthProvider } from "@/contexts/AuthProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CampusFilterProvider>
            <App />
          </CampusFilterProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
