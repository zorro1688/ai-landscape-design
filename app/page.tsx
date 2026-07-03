"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/use-user";

import LandscapeUploadForm, {
  type GenerateResult,
} from "@/components/product/upload/landscape-upload-form";
import BeforeAfterDisplay from "@/components/product/results/before-after-display";
import { LANDSCAPE_DEMO_RESULT } from "@/lib/landscape-demo-results";
import HowItWorksSteps from "@/components/product/how-it-works/how-it-works-steps";
import LandscapePricing from "@/components/product/pricing/landscape-pricing";
import LandscapeFaq from "@/components/product/faq/landscape-faq";

const FEATURE_CARDS = [
  {
    icon: "Photo",
    title: "Your Real Yard, Reimagined",
    description:
      "Every design starts with your own photo, so structures, trees, and layout stay true to your space.",
  },
  {
    icon: "Styles",
    title: "Dozens of Styles to Explore",
    description:
      "From Modern minimalism to lush English gardens, compare multiple looks before you commit to one.",
  },
  {
    icon: "Plants",
    title: "Climate-Smart Suggestions",
    description:
      "Get plant and material ideas suited to your region, so your new landscape design actually thrives.",
  },
];

export default function Home() {
  const { user, loading } = useUser();

  const [hasTriedFree, setHasTriedFree] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const scrollToGenerator = () => {
    const el = document.querySelector("[data-landscape-generator]");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - merged with the upload/generate flow */}
      <section
        className="relative pt-20 pb-40 lg:pt-28 lg:pb-56 bg-gradient-to-b from-muted/20 to-background"
        data-landscape-generator
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container px-4 md:px-6 relative">
          <div className="flex flex-col items-center space-y-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-primary/10 text-primary mb-2">
                AI-Powered Landscape Design
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Design Your Dream Yard
                <br />
                <span className="text-primary">in Seconds</span>
              </h1>

              <p className="mt-4 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
                Upload a photo of your yard and watch our AI landscape design tool turn it into a
                photorealistic redesign instantly. No design skills, no waiting, no commitment.
              </p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-6 pt-2 text-sm text-muted-foreground flex-wrap"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  {loading ? "Loading..." : "Free first design"}
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full" />
                  Instant results
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full" />
                  No design skills needed
                </div>
              </motion.div>
            </motion.div>

            {/* Fixed two-column generator: form stays visible, preview/result updates on the right */}
            <div className="pt-8 w-full max-w-7xl mx-auto grid gap-6 lg:h-[760px] lg:grid-cols-[minmax(380px,0.9fr)_minmax(540px,1.1fr)] lg:items-stretch text-left">
              <LandscapeUploadForm
                onGenerated={setResult}
                hasTriedFree={hasTriedFree}
                onFreeTrialUsed={() => setHasTriedFree(true)}
              />
              <BeforeAfterDisplay
                result={result ?? LANDSCAPE_DEMO_RESULT}
                onTryAgain={() => setResult(null)}
                compact
                isDemo={!result}
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - replaces the old Popular Names slot */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-6xl">
            <HowItWorksSteps onScrollToGenerator={scrollToGenerator} />
          </div>
        </div>
      </section>

      {/* Features Section - exactly 3 cards */}
      <section id="features" className="py-20 bg-muted/20">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-6xl space-y-12 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Why Choose Our AI Landscape Design Tool
              </h2>
              <p className="mx-auto max-w-3xl text-muted-foreground text-lg">
                Built to turn your actual yard into a believable, ready-to-build design, not just
                a generic render.
              </p>
            </motion.div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURE_CARDS.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="rounded-2xl bg-background p-8 shadow-sm border border-border"
                >
                  <div className="space-y-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <div id="pricing">
        <LandscapePricing onScrollToForm={scrollToGenerator} />
      </div>

      {/* FAQ Section */}
      <LandscapeFaq />

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-b from-muted/10 to-background">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Your Dream Yard Is One Photo Away
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
                Stop imagining what your outdoor space could look like. Upload a photo, pick a
                style, and see your next AI landscape design in seconds.
                <br />
                Join homeowners and landscaping professionals already designing with AI.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <button
                  onClick={scrollToGenerator}
                  className="inline-flex items-center justify-center h-14 px-8 text-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors shadow-lg"
                >
                  {loading
                    ? "Loading..."
                    : !user
                      ? hasTriedFree
                        ? "Sign In for More Designs"
                        : "Get Your Free Design"
                      : "Generate My Design"}
                </button>
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center h-14 px-8 text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  View Pricing
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}







