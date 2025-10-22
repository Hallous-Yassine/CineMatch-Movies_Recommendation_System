import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, TrendingUp, Star, LogOut, Film } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  const navItems = [
    { path: "/home", label: "Home", icon: Home },
    { path: "/recommendations", label: "Recommendations", icon: TrendingUp },
    { path: "/ratings", label: "Ratings & Tags", icon: Star },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/home" className="flex items-center gap-2 font-bold text-xl group">
              <Film className="w-8 h-8 text-primary group-hover:text-gold transition-colors" />
              <span className="gradient-text">CineMatch</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    asChild
                    variant={isActive ? "secondary" : "ghost"}
                    className="gap-2"
                  >
                    <Link to={item.path}>
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>

          <Button onClick={handleLogout} variant="ghost" className="gap-2">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="grid grid-cols-3 gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className="flex-col h-auto py-2 gap-1"
              >
                <Link to={item.path}>
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label.split(" ")[0]}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
    </div>
  );
};

export default Layout;
