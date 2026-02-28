import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import React, { useState } from "react";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <AuthProvider>
      <div className={darkMode ? "dark" : ""}>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
          <Router>
            <AppRoutes darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          </Router>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;