import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PremiumUpgradeButtonProps {
  className?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "premium" | "secondary";
  fullWidth?: boolean;
}

export default function PremiumUpgradeButton({ 
  className = "", 
  size = "default", 
  variant = "premium", 
  fullWidth = false 
}: PremiumUpgradeButtonProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleUpgradeClick = () => {
    toast({
      title: "Premium Subscription",
      description: "Taking you to the subscription page..."
    });
    navigate("/membership");
  };

  // Define button classes based on variant
  const getButtonClass = () => {
    switch (variant) {
      case "premium":
        return "bg-gradient-to-r from-pink-500 to-rose-400 text-white border-0 hover:from-pink-600 hover:to-rose-500";
      case "outline":
        return "border-2 border-primary text-primary hover:bg-primary hover:text-white";
      case "secondary":
        return "bg-primary/10 text-primary hover:bg-primary/20";
      default:
        return "";
    }
  };

  return (
    <Button
      variant={variant === "premium" ? "outline" : variant}
      size={size}
      className={`${getButtonClass()} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={handleUpgradeClick}
    >
      <Crown className="h-5 w-5 mr-2 text-yellow-300 drop-shadow-md" />
      Upgrade to Premium
    </Button>
  );
}
