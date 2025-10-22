import { Film, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  user: { id: number; username: string } | null;
  onLogout: () => void;
}

const Navbar = ({ user, onLogout }: NavbarProps) => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-cinema-darker/95 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Film className="w-8 h-8 text-primary group-hover:text-gold transition-colors" />
            <span className="text-xl font-bold bg-gradient-gold bg-clip-text text-transparent">
              CineMatch
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4">
          <Link to="/browse">
            <Button variant="ghost">Browse</Button>
          </Link>
          {user && (
            <Link to="/recommendations">
              <Button variant="ghost">AI Recommendations</Button>
            </Link>
          )}

            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={onLogout}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="hero">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
