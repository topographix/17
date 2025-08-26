import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VerificationAlertProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
}

export function VerificationAlert({ open, onOpenChange, email }: VerificationAlertProps) {
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const res = await apiRequest('POST', '/api/resend-verification', { email });
      
      if (res.ok) {
        toast({
          title: "Verification email sent",
          description: `We've sent a new verification email to ${email}.`,
        });
      } else {
        const error = await res.json();
        throw new Error(error.message || "Failed to resend verification email");
      }
    } catch (error) {
      toast({
        title: "Failed to resend verification",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center">
            <Mail className="mr-2 h-5 w-5 text-primary" />
            Email Verification Required
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your account has been created, but your email address ({email}) is not verified yet. 
            Please check your inbox for the verification link we sent you.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel>Continue without verifying</AlertDialogCancel>
          <Button 
            onClick={handleResendVerification} 
            disabled={isResending}
            className="gap-2"
          >
            {isResending && <Loader2 className="h-4 w-4 animate-spin" />}
            Resend verification email
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}