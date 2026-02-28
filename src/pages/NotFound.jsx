import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Helpful for debugging where users are getting lost
    console.error(
      "404 Error: User attempted to access non-existent route:", 
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center p-8 bg-card rounded-2xl shadow-sm border">
        <h1 className="mb-4 text-6xl font-black text-primary">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">
          Oops! That page seems to have faded from memory.
        </p>
        
        {/* Using Link instead of <a> for faster SPA navigation */}
        <Link 
          to="/" 
          className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;