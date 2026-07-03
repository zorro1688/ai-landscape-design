"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, Users, Globe, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container px-4 md:px-6 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold">About Us</h1>
              <p className="text-sm text-muted-foreground">
                Learn more about our mission and story
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 md:px-6 py-16">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-primary/10 text-primary mb-4">
              <span className="mr-2">🌿</span>
              Helping You See Your Yard's Potential
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Turning Photos Into
              <br />
              <span className="text-primary">AI Landscape Design Ideas</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We believe everyone deserves to see what their outdoor space could look like
              before spending a single dollar on construction — starting with nothing more
              than a photo.
            </p>
          </motion.div>

          {/* Mission Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To make professional-quality landscape visualization accessible to everyone,
                  not just those who can afford to hire a designer before they've even decided
                  what they want.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Our Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Homeowners exploring their first renovation, and landscaping professionals
                  who use our AI landscape design tool to show clients ideas in real time
                  during consultations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Every design starts from your own yard photo, so what you see is grounded
                  in your real property, not a generic stock image of someone else's garden.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Story Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="prose prose-lg max-w-none"
          >
            <div className="bg-muted/30 rounded-2xl p-8 md:p-12">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                Our Story
              </h3>
              <div className="space-y-6 text-muted-foreground">
                <p>
                  This AI landscape design tool was born from a simple, common frustration:
                  it's genuinely hard to picture what your own yard could look like once it's
                  redesigned. Sketches and mood boards only go so far, and hiring a designer
                  just to "see some options" can cost more than the project itself.
                </p>
                <p>
                  At the same time, image-generation AI had reached a point where it could
                  finally do something more useful than make generic art — it could take a
                  real photo of your actual property and redesign it convincingly, while
                  keeping the structures, trees, and layout that make it yours.
                </p>
                <p>
                  Whether you're a homeowner deciding between a few backyard concepts, or a
                  landscaping professional who needs to show a client three styles in one
                  meeting, our goal is the same: let you see it before you build it.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-4">Our Values</h3>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                These principles guide everything we do
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Photo-Based Accuracy</h4>
                  <p className="text-muted-foreground">
                    Every AI landscape design starts from your real photo, so the structures,
                    trees, and layout you generate stay true to your actual property.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Style Diversity</h4>
                  <p className="text-muted-foreground">
                    From Modern minimalism to lush English gardens, we support a wide range
                    of landscape styles so you can compare directions before committing to one.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Practical Guidance</h4>
                  <p className="text-muted-foreground">
                    Beyond just a pretty image, we aim to suggest plants and materials suited
                    to your region and climate, so your favorite design is also realistic to
                    build and maintain.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Accessibility</h4>
                  <p className="text-muted-foreground">
                    No design background, no expensive consultation — anyone can upload a
                    photo and generate a professional-looking concept in seconds.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-center bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-8 md:p-12"
          >
            <h3 className="text-2xl font-bold mb-4">Ready to See Your Yard Transformed?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Upload a photo and generate your first AI landscape design for free —
              no design experience required.
            </p>
            <Button asChild size="lg" className="font-medium">
              <Link href="/">
                Get Started Now
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
