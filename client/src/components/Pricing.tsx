import { motion } from "framer-motion";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useLocation } from "wouter";

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "Basic companionship with limited features.",
    features: [
      { included: true, text: "Access to 3 basic companions" },
      { included: true, text: "100 messages total (diamond system)" },
      { included: true, text: "Basic personality traits adjustment" },
      { included: true, text: "Standard conversation style" },
      { included: false, text: "Custom scenarios & advanced traits" },
      { included: false, text: "Appearance customization" },
      { included: false, text: "Enhanced memory retention" },
      { included: false, text: "Premium companions access" }
    ],
    buttonText: "Get Started",
    popular: false
  },
  {
    name: "Premium",
    price: "$14.99",
    period: "/month",
    description: "The complete RedVelvet experience.",
    features: [
      { included: true, text: "Access to all AI companions" },
      { included: true, text: "Unlimited messaging" },
      { included: true, text: "Full personality customization" },
      { included: true, text: "Custom scenarios & roleplay" },
      { included: true, text: "Appearance & voice customization" },
      { included: true, text: "Advanced memory & conversation history" },
      { included: true, text: "Detailed interest & topic preferences" },
      { included: true, text: "Priority support & updates" }
    ],
    buttonText: "Get Premium",
    popular: true
  }
];

export default function Pricing() {
  const { ref: headerRef, controls: headerControls } = useAnimateOnScroll();

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={headerControls}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground">
            Simple <span className="text-primary">Pricing</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees, cancel anytime.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} />
          ))}
        </div>

        {/* Premium Experience Feature Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={headerControls}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <h3 className="text-2xl font-bold mb-8 text-center">Premium Experience <span className="text-primary">Feature Breakdown</span></h3>
          
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-muted">
            <div className="grid grid-cols-3 text-sm">
              <div className="p-4 font-medium border-b">Feature</div>
              <div className="p-4 font-medium text-center border-b border-l">Free</div>
              <div className="p-4 font-medium text-center border-b border-l bg-primary/5 text-primary">Premium</div>
              
              {/* Personality Traits */}
              <div className="p-4 border-b">Personality Customization</div>
              <div className="p-4 text-center border-b border-l">Basic traits only</div>
              <div className="p-4 text-center border-b border-l bg-primary/5">All traits + advanced settings</div>
              
              {/* Scenario Customization */}
              <div className="p-4 border-b">Custom Scenarios</div>
              <div className="p-4 text-center border-b border-l"><X className="h-4 w-4 inline text-muted-foreground" /></div>
              <div className="p-4 text-center border-b border-l bg-primary/5"><Check className="h-4 w-4 inline text-primary" /></div>
              
              {/* Appearance Customization */}
              <div className="p-4 border-b">Appearance Customization</div>
              <div className="p-4 text-center border-b border-l"><X className="h-4 w-4 inline text-muted-foreground" /></div>
              <div className="p-4 text-center border-b border-l bg-primary/5"><Check className="h-4 w-4 inline text-primary" /></div>
              
              {/* Memory Retention */}
              <div className="p-4 border-b">Memory Retention</div>
              <div className="p-4 text-center border-b border-l">Basic (minimal)</div>
              <div className="p-4 text-center border-b border-l bg-primary/5">Enhanced (long-term)</div>
              
              {/* Voice & Chat Settings */}
              <div className="p-4 border-b">Voice & Chat Settings</div>
              <div className="p-4 text-center border-b border-l">Basic only</div>
              <div className="p-4 text-center border-b border-l bg-primary/5">Advanced customization</div>
              
              {/* Message Limit */}
              <div className="p-4 border-b">Message Limit</div>
              <div className="p-4 text-center border-b border-l">100 messages (diamond system)</div>
              <div className="p-4 text-center border-b border-l bg-primary/5">Unlimited messaging</div>
              
              {/* Image Generation */}
              <div className="p-4 border-b">Custom Image Generation</div>
              <div className="p-4 text-center border-b border-l"><X className="h-4 w-4 inline text-muted-foreground" /></div>
              <div className="p-4 text-center border-b border-l bg-primary/5"><Check className="h-4 w-4 inline text-primary" /></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PricingCard({ plan, index }: { plan: typeof pricingPlans[0], index: number }) {
  const { ref, controls } = useAnimateOnScroll();
  const [, setLocation] = useLocation();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`bg-white rounded-xl p-8 shadow-sm ${
        plan.popular ? "border-2 border-primary relative transform md:-translate-y-2" : ""
      }`}
    >
      {plan.popular && (
        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-4 py-1 rounded-bl-lg rounded-tr-lg">
          MOST POPULAR
        </div>
      )}

      <h3 className="text-xl font-bold font-serif text-foreground">{plan.name}</h3>
      <div className="mt-4 flex items-baseline">
        <span className={`text-4xl font-bold ${plan.popular ? "text-primary" : "text-foreground"}`}>
          {plan.price}
        </span>
        {plan.period && <span className="ml-1 text-muted-foreground">{plan.period}</span>}
      </div>
      <p className="mt-4 text-muted-foreground">
        {plan.description}
      </p>
      <ul className="mt-6 space-y-4">
        {plan.features.map((feature, i) => (
          <li key={i} className={`flex items-start ${feature.included ? "" : "opacity-50"}`}>
            <div className={`flex-shrink-0 w-5 h-5 rounded-full ${
              feature.included ? "bg-primary/10" : "bg-muted"
            } flex items-center justify-center mt-1`}>
              {feature.included ? (
                <Check className="h-3 w-3 text-primary" />
              ) : (
                <X className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
            <p className={`ml-3 ${feature.included ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
              {feature.text}
            </p>
          </li>
        ))}
      </ul>
      <Button
        className={`mt-8 w-full rounded-full ${
          plan.popular
            ? "bg-gradient-to-r from-primary to-secondary text-white"
            : "border-2 border-primary text-primary hover:bg-primary hover:text-white"
        }`}
        variant={plan.popular ? "default" : "outline"}
        onClick={() => setLocation("/signup")}
      >
        {plan.buttonText}
      </Button>
    </motion.div>
  );
}
