import { useState } from "react";
import { motion } from "framer-motion";
import { Gem, CreditCard, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import PayPalButton from "@/components/PayPalButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface DiamondPackage {
  id: string;
  name: string;
  diamonds: number;
  price: number;
  popular?: boolean;
  bonus?: string;
}

const diamondPackages: DiamondPackage[] = [
  {
    id: "small",
    name: "Starter Pack",
    diamonds: 1000,
    price: 5.99,
    bonus: "Perfect for trying premium features"
  },
  {
    id: "large",
    name: "Value Pack",
    diamonds: 5000,
    price: 14.99,
    popular: true,
    bonus: "Best value for regular users"
  }
];

interface DiamondPurchaseProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
}

export default function DiamondPurchase({ isOpen, onClose, sessionId }: DiamondPurchaseProps) {
  const [selectedPackage, setSelectedPackage] = useState<DiamondPackage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const purchaseMutation = useMutation({
    mutationFn: async ({ paymentData, packageId }: { paymentData: any, packageId: string }) => {
      const endpoint = user ? "/api/purchase-diamonds" : "/api/guest/purchase-diamonds";
      const requestData = {
        paymentId: paymentData.id,
        packageType: packageId,
        amount: selectedPackage?.price.toString(),
        ...(sessionId && { sessionId })
      };
      
      const response = await apiRequest("POST", endpoint, requestData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Purchase Successful!",
        description: `You received ${data.purchased} diamonds. Total: ${data.diamonds}`,
        variant: "default",
      });
      
      // Invalidate relevant queries to refresh diamond counts
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["/api/guest/diamonds"] });
      }
      
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  const handlePaymentSuccess = (paymentData: any) => {
    if (!selectedPackage) return;
    
    setIsProcessing(true);
    purchaseMutation.mutate({
      paymentData,
      packageId: selectedPackage.id
    });
  };

  const handlePaymentError = (error: any) => {
    console.error("PayPal payment error:", error);
    toast({
      title: "Payment Error",
      description: "Payment was cancelled or failed. Please try again.",
      variant: "destructive",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full">
              <Gem className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Purchase Diamonds</h2>
              <p className="text-gray-600">Continue your conversations with AI companions</p>
            </div>
          </div>
        </div>

        {/* Package Selection */}
        <div className="p-6">
          <div className="grid gap-4 mb-6">
            {diamondPackages.map((pkg) => (
              <motion.div
                key={pkg.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedPackage?.id === pkg.id
                    ? "border-pink-500 bg-pink-50"
                    : "border-gray-200 hover:border-pink-300"
                } ${pkg.popular ? "ring-2 ring-pink-500" : ""}`}
                onClick={() => setSelectedPackage(pkg)}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-4 bg-pink-500 text-white">
                    Most Popular
                  </Badge>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                    <p className="text-gray-600 mb-2">{pkg.bonus}</p>
                    
                    <div className="flex items-center gap-2">
                      <Gem className="w-5 h-5 text-pink-500" />
                      <span className="text-2xl font-bold text-gray-900">
                        {pkg.diamonds.toLocaleString()}
                      </span>
                      <span className="text-gray-500">diamonds</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">
                      ${pkg.price}
                    </div>
                    <div className="text-sm text-gray-500">
                      ${(pkg.price / pkg.diamonds * 1000).toFixed(2)}/1k diamonds
                    </div>
                  </div>
                  
                  {selectedPackage?.id === pkg.id && (
                    <div className="absolute top-4 right-4">
                      <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Payment Section */}
          {selectedPackage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t pt-6"
            >
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Selected Package:</span>
                  <span className="font-bold">{selectedPackage.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Diamonds:</span>
                  <span className="font-bold">{selectedPackage.diamonds.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-xl">${selectedPackage.price}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  <span>Secure payment processed by PayPal</span>
                </div>

                {isProcessing ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                    <p className="mt-2 text-gray-600">Processing payment...</p>
                  </div>
                ) : (
                  <PayPalButton
                    amount={selectedPackage.price.toString()}
                    currency="USD"
                    intent="CAPTURE"
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}