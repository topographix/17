import { motion } from "framer-motion";
import { useAnimateOnScroll } from "@/hooks/useAnimateOnScroll";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { FaTwitter, FaInstagram, FaFacebook, FaDiscord } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-foreground text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          {/* Brand Column */}
          <div>
            <a href="#" className="flex items-center mb-6">
              <span className="text-2xl font-bold text-white font-serif">
                Red<span className="text-primary">Velvet</span>
              </span>
            </a>
            <p className="text-gray-400 mb-6">
              Creating meaningful AI connections that understand your desires and enrich your life.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <FaDiscord className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-medium text-white mb-6">Company</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">About Us</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">Careers</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">Blog</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">Press</a>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-lg font-medium text-white mb-6">Resources</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">Help Center</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">Contact Us</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">Terms of Service</a>
              </li>
            </ul>
          </div>

          {/* Subscribe Form */}
          <div>
            <h3 className="text-lg font-medium text-white mb-6">Subscribe</h3>
            <p className="text-gray-400 mb-4">
              Get the latest updates and offers.
            </p>
            <form className="flex">
              <Input
                type="email"
                placeholder="Your email"
                className="rounded-l-full border-0 bg-white/10 focus-visible:ring-primary text-white"
              />
              <Button className="rounded-r-full bg-primary">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-500">
            &copy; {new Date().getFullYear()} RedVelvet AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
