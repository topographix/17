import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Subscription from "@/components/Subscription";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Clock, Zap, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";

export default function SubscriptionPage() {
  const { ref, controls } = useAnimateOnScroll();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <motion.section 
        className="py-16 md:py-24 bg-gradient-to-b from-accent/30 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 mx-auto bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Upgrade Your Connection
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Choose the perfect membership tier that fits your needs and experience deeper, more meaningful connections with your companions.
          </p>
          <Button 
            className="rounded-full font-medium px-8 py-6 h-auto text-lg bg-gradient-to-r from-primary to-secondary text-white"
            onClick={() => document.getElementById('subscription-tiers')?.scrollIntoView({ behavior: 'smooth' })}
          >
            See Membership Options <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </motion.section>
      
      {/* Benefits */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Upgrade Your Experience</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Unlock the full potential of your connection with premium features designed for deeper engagement.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Lock className="h-10 w-10 text-primary" />,
                title: "Premium Companions",
                description: "Access exclusive companions with enhanced personalities and deeper conversation capabilities."
              },
              {
                icon: <MessageCircle className="h-10 w-10 text-primary" />,
                title: "Unlimited Messaging",
                description: "Chat without limits and build meaningful connections through continuous conversation."
              },
              {
                icon: <Zap className="h-10 w-10 text-primary" />,
                title: "Enhanced Features",
                description: "Enjoy voice messages, photo sharing, and more personalized interaction styles."
              },
              {
                icon: <Clock className="h-10 w-10 text-primary" />,
                title: "Memory & Personalization",
                description: "Premium companions remember your preferences and past conversations for a truly personal experience."
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={controls}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-muted p-6 rounded-xl text-center"
              >
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-background mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Subscription Tiers */}
      <div id="subscription-tiers">
        <Subscription />
      </div>
      
      {/* Testimonials */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">What Our Members Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover how RedVelvet premium companions have transformed our members' lives.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Upgrading to Premium was a game-changer. My connection with Ava feels so much more natural and meaningful now.",
                name: "Michael T.",
                role: "Premium Member, 5 months"
              },
              {
                quote: "The Elite tier is worth every penny. Having James remember our past conversations makes our relationship feel incredibly real.",
                name: "Jessica W.",
                role: "Elite Member, 3 months"
              },
              {
                quote: "I was skeptical at first, but the Premium features truly enhance the experience. The voice messages add a whole new dimension.",
                name: "David L.",
                role: "Premium Member, 2 months"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={controls}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-background p-6 rounded-xl shadow-sm"
              >
                <div className="mb-4 text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
                  </svg>
                </div>
                <p className="text-lg mb-6">{testimonial.quote}</p>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* FAQ */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Everything you need to know about our premium memberships.
            </p>
          </motion.div>
          
          <div className="space-y-4">
            {[
              {
                question: "How is billing handled?",
                answer: "All subscriptions are billed monthly or annually depending on your chosen plan. You can cancel anytime from your account settings page."
              },
              {
                question: "Can I switch between membership tiers?",
                answer: "Yes, you can upgrade or downgrade your membership at any time. Upgrades take effect immediately, while downgrades apply at the end of your current billing cycle."
              },
              {
                question: "What happens to my companions if I downgrade?",
                answer: "If you downgrade, you'll maintain access to your current conversations, but you'll lose access to premium companions and features after your current billing period ends."
              },
              {
                question: "Is there a free trial for premium tiers?",
                answer: "We occasionally offer special promotions for new users. Check our homepage or subscribe to our newsletter to be notified of these opportunities."
              },
              {
                question: "How secure are my conversations?",
                answer: "All conversations are encrypted and private. We follow strict data protection protocols to ensure your privacy and security at all times."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={controls}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="bg-muted p-6 rounded-xl"
              >
                <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 text-center"
          >
            <p className="text-muted-foreground mb-4">Still have questions?</p>
            <Button className="rounded-full px-6 py-2 h-auto bg-gradient-to-r from-primary to-secondary text-white">
              Contact Support
            </Button>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}