import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Check, Crown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";
import PayPalButton from "@/components/PayPalButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

const tiers = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Basic features with limited interactions',
    features: [
      'Access to basic AI companions',
      '100 messages total (diamond system)',
      'Basic personality traits only',
      'No custom scenarios or appearance settings',
      'Limited chat settings and memory retention',
      'No image generation or advanced customization'
    ],
    includedCompanions: ['Sophia', 'Emma', 'Alex'],
    color: 'bg-gray-100',
    borderColor: 'border-gray-300',
    buttonClass: 'bg-gradient-to-r from-primary to-secondary text-white',
    buttonText: 'Current Plan'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 14.99,
    period: 'month',
    badge: 'Popular',
    description: 'The complete RedVelvet experience',
    features: [
      'Access to all Premium AI companions',
      'Unlimited messages with no restrictions',
      'Full personality trait customization',
      'Custom scenarios & relationship settings',
      'Appearance & voice customization',
      'Enhanced memory & emotional responses',
      'Image generation & customized companions'
    ],
    includedCompanions: ['All companions including premium exclusive ones'],
    color: 'bg-pink-50',
    borderColor: 'border-pink-300',
    buttonClass: 'bg-gradient-to-r from-pink-500 to-rose-400 text-white',
    buttonText: 'Upgrade Now',
    icon: <Crown className="text-pink-600 h-6 w-6 absolute -top-3 -right-3" />
  }
];

export default function Subscription() {
  const [selectedTier, setSelectedTier] = useState('free');
  const { toast } = useToast();
  const { ref, controls } = useAnimateOnScroll();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const upgradeToPremiumMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest("POST", "/api/upgrade-to-premium", {
        paymentId: paymentData.id,
        plan: selectedTier,
        amount: tiers.find(t => t.id === selectedTier)?.price
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Payment Successful!",
        description: "Your premium subscription has been activated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment Error",
        description: "There was an issue processing your payment. Please contact support.",
        variant: "destructive",
      });
    },
  });

  const handleSubscribe = (tierId: string) => {
    if (tierId === 'free') {
      toast({
        title: "Free Plan",
        description: "You're already on the free plan.",
      });
      return;
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    upgradeToPremiumMutation.mutate(paymentData);
  };

  const handlePaymentError = (error: any) => {
    toast({
      title: "Payment Failed",
      description: "Your payment could not be processed. Please try again.",
      variant: "destructive",
    });
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-primary">Choose Your Connection</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select the perfect membership tier for your relationship needs. Upgrade anytime as your connection grows.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`${tier.color} border ${tier.borderColor} rounded-xl p-6 shadow-sm relative ${selectedTier === tier.id ? 'ring-2 ring-primary' : ''}`}
            >
              {tier.icon && tier.icon}
              
              {tier.badge && (
                <Badge className="absolute top-3 right-3 bg-pink-500 text-white">
                  {tier.badge}
                </Badge>
              )}
              
              <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
              
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold">${tier.price}</span>
                {tier.period && (
                  <span className="text-muted-foreground ml-1">/{tier.period}</span>
                )}
              </div>
              
              <p className="text-muted-foreground mb-4 text-sm">{tier.description}</p>
              
              <ul className="space-y-2 mb-6">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-2">Included Companions:</h4>
                <p className="text-xs text-muted-foreground">{tier.includedCompanions.join(', ')}</p>
              </div>
              
              {tier.id === 'free' ? (
                <Button 
                  onClick={() => handleSubscribe(tier.id)}
                  className={`w-full ${tier.buttonClass} flex items-center justify-center gap-2`}
                >
                  {tier.buttonText}
                </Button>
              ) : (
                <div className="w-full">
                  <Button 
                    onClick={() => toast({
                      title: "PayPal Integration",
                      description: "PayPal payment processing is being configured. Please contact support to upgrade your account.",
                    })}
                    className={`w-full ${tier.buttonClass} flex items-center justify-center gap-2`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Upgrade to Premium
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <h3 className="text-2xl font-bold mb-8 text-center">Feature <span className="text-primary">Comparison</span></h3>
          
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-muted mb-8">
            <div className="grid grid-cols-3 text-sm">
              <div className="p-4 font-medium border-b">Feature</div>
              <div className="p-4 font-medium text-center border-b border-l">Free</div>
              <div className="p-4 font-medium text-center border-b border-l bg-primary/5 text-primary">Premium</div>
              
              {/* Personality Traits */}
              <div className="p-4 border-b">Personality Traits</div>
              <div className="p-4 text-center border-b border-l">Basic traits only</div>
              <div className="p-4 text-center border-b border-l bg-primary/5">Full customization</div>
              
              {/* Scenario Customization */}
              <div className="p-4 border-b">Custom Scenarios</div>
              <div className="p-4 text-center border-b border-l"><X className="h-4 w-4 inline text-muted-foreground" /></div>
              <div className="p-4 text-center border-b border-l bg-primary/5"><Check className="h-4 w-4 inline text-primary" /></div>
              
              {/* Appearance Settings */}
              <div className="p-4 border-b">Appearance Settings</div>
              <div className="p-4 text-center border-b border-l"><X className="h-4 w-4 inline text-muted-foreground" /></div>
              <div className="p-4 text-center border-b border-l bg-primary/5"><Check className="h-4 w-4 inline text-primary" /></div>
              
              {/* Voice & Chat Settings */}
              <div className="p-4 border-b">Voice & Chat Settings</div>
              <div className="p-4 text-center border-b border-l">Basic only</div>
              <div className="p-4 text-center border-b border-l bg-primary/5">Full customization</div>
              
              {/* Memory Retention */}
              <div className="p-4 border-b">Memory Retention</div>
              <div className="p-4 text-center border-b border-l">Minimal</div>
              <div className="p-4 text-center border-b border-l bg-primary/5">Enhanced long-term</div>
              
              {/* Emotional Responses */}
              <div className="p-4 border-b">Emotional Expression</div>
              <div className="p-4 text-center border-b border-l">Limited</div>
              <div className="p-4 text-center border-b border-l bg-primary/5">Fully adjustable</div>
              
              {/* Message Limit */}
              <div className="p-4 border-b">Message Limit</div>
              <div className="p-4 text-center border-b border-l">100 messages</div>
              <div className="p-4 text-center border-b border-l bg-primary/5">Unlimited</div>
              
              {/* Image Generation */}
              <div className="p-4 border-b">Image Generation</div>
              <div className="p-4 text-center border-b border-l"><X className="h-4 w-4 inline text-muted-foreground" /></div>
              <div className="p-4 text-center border-b border-l bg-primary/5"><Check className="h-4 w-4 inline text-primary" /></div>
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto text-center text-sm text-muted-foreground">
            <p>Subscriptions automatically renew. Cancel anytime. All pricing in USD.</p>
            <p className="mt-2">
              Need a custom plan? <a href="#" className="text-primary underline">Contact us</a> for enterprise options.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}