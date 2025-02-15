import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProviderWrapper } from "./context/ThemeContext";
import App from "./App";
import "./index.css";

// Create a React Query Client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProviderWrapper>
        <Router>
          <AuthProvider>
            <App />
          </AuthProvider>
        </Router>
      </ThemeProviderWrapper>
    </QueryClientProvider>
  </React.StrictMode>
);
