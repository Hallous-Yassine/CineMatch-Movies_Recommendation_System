import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createUser, authenticateUser } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film } from "lucide-react";
import { toast } from "sonner";

interface AuthProps {
  onLogin: (user: { id: number; username: string }) => void;
}

const Auth = ({ onLogin }: AuthProps) => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [signupData, setSignupData] = useState({
    username: "",
    password: "",
    firstname: "",
    lastname: "",
  });

  const loginMutation = useMutation({
    mutationFn: () => authenticateUser(loginData.username, loginData.password),
    onSuccess: (data) => {
      if (data.success && data.data) {
        onLogin(data.data);
        toast.success("Welcome back!");
        navigate("/");
      } else {
        toast.error(data.error || "Invalid credentials");
      }
    },
    onError: () => {
      toast.error("Login failed. Please try again.");
    },
  });

  const signupMutation = useMutation({
    mutationFn: () =>
      createUser(
        signupData.username,
        signupData.password,
        signupData.firstname,
        signupData.lastname
      ),
    onSuccess: (data) => {
      if (data.success && data.data) {
        onLogin(data.data);
        toast.success("Account created successfully!");
        navigate("/");
      } else {
        toast.error(data.error || "Signup failed");
      }
    },
    onError: () => {
      toast.error("Signup failed. Please try again.");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    loginMutation.mutate();
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.username || !signupData.password) {
      toast.error("Username and password are required");
      return;
    }
    signupMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 space-y-6 bg-gradient-card">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <Film className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Welcome to CineMatch</h1>
          <p className="text-muted-foreground">Sign in to get personalized recommendations</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">Username</Label>
                <Input
                  id="login-username"
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  placeholder="Enter your username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Enter your password"
                />
              </div>
              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-username">Username *</Label>
                <Input
                  id="signup-username"
                  type="text"
                  value={signupData.username}
                  onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                  placeholder="Choose a username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password *</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  placeholder="Create a password"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-firstname">First Name</Label>
                  <Input
                    id="signup-firstname"
                    type="text"
                    value={signupData.firstname}
                    onChange={(e) => setSignupData({ ...signupData, firstname: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-lastname">Last Name</Label>
                  <Input
                    id="signup-lastname"
                    type="text"
                    value={signupData.lastname}
                    onChange={(e) => setSignupData({ ...signupData, lastname: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Auth;
