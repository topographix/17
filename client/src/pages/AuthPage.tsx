import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { TermsConsentPopup } from "@/components/TermsConsentPopup";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(true),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  email: z.string().email("Please enter a valid email"),
  fullName: z.string().optional().or(z.literal("")),
  preferredGender: z.enum(["male", "female", "both"]).default("both"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { 
    user, 
    loginMutation, 
    registerMutation
  } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [savedUsername, setSavedUsername] = useState<string>("");
  const [showTermsConsent, setShowTermsConsent] = useState(false);
  const [pendingRegistrationData, setPendingRegistrationData] = useState<RegisterFormValues | null>(null);

  // Check for saved credentials on component mount
  useEffect(() => {
    const username = localStorage.getItem('savedUsername');
    if (username) {
      setSavedUsername(username);
    }
  }, []);

  // Setup all hooks first, then handle redirects in useEffect
  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: true,
    },
  });

  // We need to reset the form when savedUsername changes
  useEffect(() => {
    if (savedUsername) {
      loginForm.reset({
        username: savedUsername,
        password: "",
        rememberMe: true
      });
    }
  }, [savedUsername, loginForm]);

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      fullName: "",
      preferredGender: "both",
    },
  });

  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    // Store the registration data and show terms consent popup
    setPendingRegistrationData(values);
    setShowTermsConsent(true);
  };

  const handleTermsAccept = () => {
    if (pendingRegistrationData) {
      // Remove confirmPassword as it's not needed by the API
      const { confirmPassword, ...registerData } = pendingRegistrationData;
      registerMutation.mutate(registerData);
      setShowTermsConsent(false);
      setPendingRegistrationData(null);
    }
  };

  const handleTermsDecline = () => {
    setShowTermsConsent(false);
    setPendingRegistrationData(null);
  };



  return (
    <div className="flex min-h-screen auth-page">
      {/* Left column - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">RedVelvet</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Your personal AI companion awaits
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")} className="w-full">
            <div className="flex justify-center mb-8 auth-toggle">
              <Button
                onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
                variant="outline"
                className="px-8 py-2 rounded-lg"
              >
                {activeTab === "login" ? "Need an account? Sign Up" : "Have an account? Log In"}
              </Button>
            </div>

            <TabsContent value="login">
              <Card className="!rounded-lg auth-card">
                <CardHeader>
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Remember me for 30 days
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Login
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">                  
                  <div className="text-sm text-center text-gray-500">
                    Don't have an account?{" "}
                    <button
                      onClick={() => setActiveTab("register")}
                      className="text-primary hover:underline"
                    >
                      Register
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="!rounded-lg auth-card">
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Enter your information to create your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form
                      onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="preferredGender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Companion Gender</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select preferred gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Register
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="text-sm text-center text-gray-500">
                    Already have an account?{" "}
                    <button
                      onClick={() => setActiveTab("login")}
                      className="text-primary hover:underline"
                    >
                      Login
                    </button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right column - Hero/Brand */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="flex flex-col justify-center items-center p-8 max-w-lg mx-auto">
          <h1 className="text-5xl font-bold mb-6">RedVelvet</h1>
          <p className="text-xl mb-8 text-center">
            Experience meaningful connections with AI companions designed to understand your emotions and preferences.
          </p>
          <div className="grid grid-cols-2 gap-6 w-full">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Emotional Intelligence</h3>
              <p className="text-white/80">
                Our companions can detect and respond to your emotions in real-time.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Personalization</h3>
              <p className="text-white/80">
                Customize your experience with detailed companion preferences.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Premium Features</h3>
              <p className="text-white/80">
                Enhanced customization and deeper emotional connections.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Privacy First</h3>
              <p className="text-white/80">
                Your conversations and preferences are always private and secure.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Consent Popup */}
      <TermsConsentPopup
        isOpen={showTermsConsent}
        onAccept={handleTermsAccept}
        onDecline={handleTermsDecline}
      />
    </div>
  );
}