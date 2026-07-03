"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { createCheckoutSession } from "@/app/actions";
import { CREDITS_TIERS } from "@/config/subscriptions";

interface LandscapePricingProps {
  onScrollToForm?: () => void;
}

export default function LandscapePricing({ onScrollToForm }: LandscapePricingProps) {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleFreeTrial = () => {
    if (onScrollToForm) {
      onScrollToForm();
    } else {
      const generatorSection = document.querySelector("[data-landscape-generator]");
      if (generatorSection) {
        generatorSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handlePurchase = async (tierId: string, productId: string, creditAmount: number, discountCode?: string) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to purchase credits.",
        variant: "destructive",
      });
      router.push("/sign-in");
      return;
    }

    if (!user.email) {
      toast({
        title: "Missing Email",
        description: "Your account needs a valid email to check out. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(tierId);

    try {
      // Calls the existing Server Action from app/actions.ts, which creates
      // a real Creem checkout session (not the broken /api/creem/create-checkout
      // fetch the original template's pricing component pointed at).
      const checkoutUrl = await createCheckoutSession(
        productId,
        user.email,
        user.id,
        "credits",
        creditAmount,
        discountCode
      );

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <section id="landscape-pricing" className="w-full py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-6xl space-y-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Simple, Credit-Based Pricing
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
              Generate your first AI landscape design for free. Buy credits as you go — no
              subscriptions, no expiration.
            </p>
          </motion.div>

          {/* Pricing Cards: Free Trial + the 3 tiers from config/subscriptions.ts */}
          <div className="grid gap-6 lg:grid-cols-4 max-w-7xl mx-auto">
            {/* Free Trial card (not part of CREDITS_TIERS, handled separately) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 rounded-full bg-muted">
                      <Gift className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">Free Trial</CardTitle>
                  <div className="space-y-2">
                    <span className="text-4xl font-bold text-foreground">$0</span>
                    <p className="text-muted-foreground text-sm">
                      Try your first AI landscape design, no card required
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {[
                      "1 free AI landscape design",
                      "Choose from all available styles",
                      "No registration required",
                    ].map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="mt-0.5 p-1 rounded-full bg-muted">
                          <Check className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <span className="text-muted-foreground text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleFreeTrial}
                    variant="outline"
                    className="w-full h-12 text-base font-medium border-primary/20 text-primary hover:bg-primary/5"
                  >
                    Try Free
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Paid credit packs, sourced from config/subscriptions.ts */}
            {CREDITS_TIERS.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
                className="relative"
              >
                {tier.featured && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Best Value
                    </Badge>
                  </div>
                )}

                <Card
                  className={`h-full transition-all duration-300 hover:shadow-lg ${
                    tier.featured
                      ? "border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10"
                      : "border border-border hover:border-primary/20"
                  }`}
                >
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl font-bold text-foreground">{tier.name}</CardTitle>
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-foreground">{tier.priceMonthly}</span>
                      </div>
                      <p className="text-muted-foreground text-sm">{tier.description}</p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {(tier.features ?? []).map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <div className={`mt-0.5 p-1 rounded-full ${tier.featured ? "bg-primary/10" : "bg-muted"}`}>
                            <Check className={`h-3 w-3 ${tier.featured ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <span className="text-muted-foreground text-sm leading-relaxed">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handlePurchase(tier.id, tier.productId, tier.creditAmount ?? 0, tier.discountCode)}
                      disabled={isProcessing === tier.id}
                      className={`w-full h-12 text-base font-medium transition-all duration-200 ${
                        tier.featured
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                          : "border-primary/20 text-primary hover:bg-primary/5"
                      }`}
                      variant={tier.featured ? "default" : "outline"}
                    >
                      {isProcessing === tier.id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        "Purchase Credits"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* FAQ / Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center space-y-4 pt-8"
          >
            <h3 className="text-xl font-semibold text-foreground">Questions about pricing?</h3>
            <p className="text-muted-foreground">
              Credits never expire and work for both Standard (1 credit) and Premium-model
              (3 credits) landscape designs.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-500" />
                Secure payments
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-500" />
                Instant credit delivery
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-500" />
                High-res downloads
              </span>
              <span className="flex items-center gap-1">
                <Check className="h-3 w-3 text-green-500" />
                Money-back guarantee
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
