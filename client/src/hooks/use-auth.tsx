import { createContext, ReactNode, useContext, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { VerificationAlert } from "@/components/VerificationAlert";
import WelcomeBonusPopup from "@/components/WelcomeBonusPopup";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

type LoginData = {
  username: string;
  password: string;
  rememberMe?: boolean;
};

type RegisterData = {
  username: string;
  password: string;
  preferredGender?: "male" | "female" | "both";
  email?: string;
  fullName?: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [showWelcomeBonus, setShowWelcomeBonus] = useState(false);
  const [welcomeBonusAmount, setWelcomeBonusAmount] = useState(25);
  
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      try {
        const res = await apiRequest("POST", "/api/login", credentials);
        return await res.json();
      } catch (error) {
        // Extract more detailed error message if available
        let errorMessage = "Login failed";
        try {
          if (error instanceof Error) {
            // Try to parse error message which might contain JSON
            const match = error.message.match(/\d+:\s+(.+)/);
            if (match && match[1]) {
              try {
                const errorJson = JSON.parse(match[1]);
                if (errorJson.error) {
                  errorMessage = errorJson.error;
                }
              } catch (e) {
                errorMessage = match[1];
              }
            } else {
              errorMessage = error.message;
            }
          }
        } catch (e) {
          console.error("Error parsing error message:", e);
        }
        throw new Error(errorMessage);
      }
    },
    onSuccess: (user: User, variables) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Save user credentials if rememberMe is true
      if (variables.rememberMe) {
        // Store credentials in localStorage (encrypt in production)
        localStorage.setItem('savedUsername', variables.username);
        localStorage.setItem('lastLoginTime', new Date().toISOString());
        
        // Don't store the actual password for security, just an indicator
        localStorage.setItem('hasStoredCredentials', 'true');
      } else {
        // Clear any previously stored credentials
        localStorage.removeItem('savedUsername');
        localStorage.removeItem('hasStoredCredentials');
      }
      
      // Check if the user's email is verified
      if (user.email && !user.isVerified) {
        // Show verification alert
        setUserEmail(user.email);
        setShowVerificationAlert(true);
      }
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      try {
        const res = await apiRequest("POST", "/api/register", credentials);
        return await res.json();
      } catch (error) {
        // Extract more detailed error message if available
        let errorMessage = "Registration failed";
        try {
          if (error instanceof Error) {
            // Try to parse error message which might contain JSON
            const match = error.message.match(/\d+:\s+(.+)/);
            if (match && match[1]) {
              try {
                const errorJson = JSON.parse(match[1]);
                if (errorJson.error) {
                  errorMessage = errorJson.error;
                }
              } catch (e) {
                errorMessage = match[1];
              }
            } else {
              errorMessage = error.message;
            }
          }
        } catch (e) {
          console.error("Error parsing error message:", e);
        }
        throw new Error(errorMessage);
      }
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      
      // Show welcome bonus popup for new registrations
      setWelcomeBonusAmount(25);
      setShowWelcomeBonus(true);
      
      toast({
        title: "Registration successful",
        description: `Welcome to RedVelvet, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Username may already be taken",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Sign out from the server session
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  


  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation
      }}
    >
      <VerificationAlert 
        open={showVerificationAlert} 
        onOpenChange={setShowVerificationAlert} 
        email={userEmail} 
      />
      <WelcomeBonusPopup
        isOpen={showWelcomeBonus}
        onClose={() => setShowWelcomeBonus(false)}
        diamondAmount={welcomeBonusAmount}
        userName={user?.username}
      />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}