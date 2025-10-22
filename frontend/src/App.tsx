import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import MovieDetails from "./pages/MovieDetails";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Recommendations from "./pages/Recommendations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState<{ id: number; username: string } | null>(() => {
    const saved = localStorage.getItem("cineMatch_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("cineMatch_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("cineMatch_user");
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen">
            <Navbar user={user} onLogout={handleLogout} />
            <Routes>
              <Route path="/" element={<Home userId={user?.id || null} />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/movie/:id" element={<MovieDetails userId={user?.id || null} />} />
              <Route path="/recommendations" element={<Recommendations userId={user?.id || null} />} />
              <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth onLogin={setUser} />} />
              <Route path="/profile" element={user ? <Profile userId={user.id} /> : <Navigate to="/auth" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
