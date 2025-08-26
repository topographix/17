import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, AlertTriangle, Shield, Users, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TermsConsentPopupProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function TermsConsentPopup({ isOpen, onAccept, onDecline }: TermsConsentPopupProps) {
  const [isAgreed, setIsAgreed] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false);

  const handleAccept = () => {
    if (isAgreed) {
      onAccept();
    }
  };

  const keyTerms = [
    {
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      title: "Age Requirement",
      description: "You must be 18+ years old to use this service"
    },
    {
      icon: <Eye className="h-5 w-5 text-red-500" />,
      title: "Adult Content",
      description: "Contains sexually explicit conversations and mature themes"
    },
    {
      icon: <Shield className="h-5 w-5 text-blue-500" />,
      title: "Data Collection",
      description: "We collect chat history, device info, and usage patterns for service improvement"
    },
    {
      icon: <Users className="h-5 w-5 text-green-500" />,
      title: "Privacy Protection",
      description: "Your data won't be sold to third parties without consent"
    }
  ];

  const fullTermsContent = `
Terms and Conditions

By accessing and using this Adult AI Chatbot, you agree to the following terms and conditions. These terms are intended to comply with applicable laws in India, the United States, and globally.

1. Age Restriction
You must be at least 18 years of age (or the age of majority in your jurisdiction) to use this chatbot. By accessing the service, you confirm that you meet this age requirement.

2. Content Warning
This chatbot contains adult content, including sexually explicit conversations. If you are offended by such material or it is illegal to access such content in your jurisdiction, please do not use this service.

3. Use of Information
We may collect and use information you provide while interacting with the chatbot, including chat history, device information, and usage patterns. This data may be used for improving the service, analytics, personalization, and marketing purposes, in compliance with applicable data protection laws.

4. Data Privacy
We are committed to protecting your privacy. Your data will not be sold to third parties without consent. However, we may share information with trusted service providers under confidentiality agreements or when required by law.

5. User Conduct
You agree not to misuse the chatbot or use it to engage in unlawful, abusive, or harmful activities. We reserve the right to suspend or terminate access if such behavior is detected.

6. Disclaimer
This chatbot is for entertainment purposes only. It does not provide professional advice, medical consultation, or legal counsel. Use of the chatbot is at your own risk.

7. Limitation of Liability
To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the chatbot.

8. Modifications
We reserve the right to modify these terms at any time. Continued use of the chatbot after such modifications constitutes acceptance of the new terms.

9. Governing Law
These terms shall be governed by and construed in accordance with the laws of Pune, Maharashtra, India, without regard to its conflict of law provisions.

10. Contact Us
If you have any questions about these terms, please contact us at: topographix@gmail.com
  `;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-primary" />
            Terms and Conditions
          </DialogTitle>
          <DialogDescription>
            Please review and accept our terms to continue with registration
          </DialogDescription>
        </DialogHeader>

        {!showFullTerms ? (
          <>
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <span className="font-semibold text-amber-800">Important Notice</span>
                </div>
                <p className="text-sm text-amber-700">
                  This platform contains adult content. By proceeding, you confirm you are 18+ and consent to adult-themed AI conversations.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Key Terms Overview</h3>
                <div className="grid gap-3">
                  {keyTerms.map((term, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg bg-card">
                      {term.icon}
                      <div>
                        <h4 className="font-medium">{term.title}</h4>
                        <p className="text-sm text-muted-foreground">{term.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowFullTerms(true)}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Complete Terms & Conditions
                </Button>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                <Checkbox
                  id="terms-agreement"
                  checked={isAgreed}
                  onCheckedChange={(checked) => setIsAgreed(!!checked)}
                />
                <label 
                  htmlFor="terms-agreement" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I confirm that I am 18+ years old and agree to the Terms and Conditions above
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={onDecline}
                className="flex-1"
              >
                I Decline
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!isAgreed}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80"
              >
                I Accept & Continue
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  Complete Document
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullTerms(false)}
                >
                  ← Back to Summary
                </Button>
              </div>

              <ScrollArea className="h-[400px] w-full border rounded-lg p-4">
                <div className="space-y-4 text-sm whitespace-pre-line">
                  {fullTermsContent}
                </div>
              </ScrollArea>

              <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                <Checkbox
                  id="full-terms-agreement"
                  checked={isAgreed}
                  onCheckedChange={(checked) => setIsAgreed(!!checked)}
                />
                <label 
                  htmlFor="full-terms-agreement" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I have read and agree to the complete Terms and Conditions
                </label>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={onDecline}
                className="flex-1"
              >
                I Decline
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!isAgreed}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80"
              >
                I Accept & Continue
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}