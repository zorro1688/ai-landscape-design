"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Eye, Database, Lock, UserCheck, Globe } from "lucide-react";

export default function PrivacyPage() {
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
              <h1 className="text-xl font-bold">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground">
                How we protect and handle your data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container px-4 md:px-6 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm bg-primary/10 text-primary mb-4">
              <Shield className="mr-2 h-4 w-4" />
              Your Privacy Matters
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Privacy Policy
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We are committed to protecting your privacy and being transparent about how we
              collect, use, and protect your personal information — including the photos you
              upload — when you use our AI landscape design service.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Last updated:</strong> June 26, 2026
            </p>
          </motion.div>

          {/* Privacy Principles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid gap-6 md:grid-cols-3"
          >
            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Transparency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  We clearly explain what data we collect — including which third parties
                  process your photos — so you always know where your information goes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Your uploaded photos and generated designs are protected with
                  industry-standard security measures and encryption in transit.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Control</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  You can view, download, and delete any photo or generated design from your
                  account at any time from your design history.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Information We Collect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-8"
          >
            <div className="bg-muted/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Database className="h-6 w-6 text-primary" />
                Information We Collect
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Information You Provide</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>Yard Photos:</strong> Images of your property that you upload to generate a design</li>
                    <li>• <strong>Style Preferences:</strong> The landscape style and any written description you provide</li>
                    <li>• <strong>Account Information:</strong> Email address when you create an account</li>
                    <li>• <strong>Generated Designs:</strong> The AI-generated images saved to your design history</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Information We Collect Automatically</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>Usage Data:</strong> How you interact with our service</li>
                    <li>• <strong>Device Information:</strong> Browser type, operating system, IP address</li>
                    <li>• <strong>Cookies:</strong> To improve your experience and remember your preferences</li>
                  </ul>
                </div>

                <div>
                  <p className="text-muted-foreground text-sm">
                    Please avoid uploading photos that include people, license plates, or other
                    personally identifying details beyond your property itself — our service is
                    designed to redesign outdoor spaces, not to process images of individuals.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* How We Use Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-8"
          >
            <div className="bg-muted/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">How We Use Your Information</h3>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-3">Service Provision</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Generate your AI landscape design from your uploaded photo</li>
                    <li>• Save your generated designs and design history</li>
                    <li>• Provide customer support</li>
                    <li>• Process payments for credits</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Service Improvement</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Analyze service usage to improve functionality</li>
                    <li>• Develop new styles and capabilities</li>
                    <li>• Ensure service security and prevent fraud</li>
                    <li>• Send service-related communications</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Data Sharing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="space-y-8"
          >
            <div className="bg-muted/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Globe className="h-6 w-6 text-primary" />
                Information Sharing
              </h3>

              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong>We do not sell your personal information.</strong> Generating an AI
                  landscape design does require sending your photo to a small number of trusted
                  service providers in order to work:
                </p>

                <ul className="space-y-2">
                  <li>• <strong>AI Image Generation:</strong> Your uploaded photo and chosen style are sent to our AI image-generation provider (Replicate) to produce your design</li>
                  <li>• <strong>Cloud Storage:</strong> Uploaded photos and generated designs are stored using Cloudflare R2</li>
                  <li>• <strong>Payments:</strong> Purchases are processed by our payment provider, Creem, who handles your payment details directly</li>
                  <li>• <strong>Authentication & Database:</strong> Account and design records are hosted by Supabase</li>
                  <li>• <strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Your Rights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="space-y-8"
          >
            <div className="bg-muted/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Your Rights and Choices</h3>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-3">Access and Control</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Access your uploaded photos and generated designs</li>
                    <li>• Delete individual designs from your design history</li>
                    <li>• Delete your account and all associated data</li>
                    <li>• Download any generated design</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Communication Preferences</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Opt out of marketing communications</li>
                    <li>• Manage cookie preferences</li>
                    <li>• Control data processing</li>
                    <li>• Request data portability</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Data Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="space-y-8"
          >
            <div className="bg-muted/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Data Security and Retention</h3>

              <div className="space-y-4 text-muted-foreground">
                <p>
                  We implement appropriate technical and organizational measures to protect your
                  personal information, photos, and generated designs against unauthorized
                  access, alteration, disclosure, or destruction.
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-semibold mb-2 text-foreground">Security Measures</h4>
                    <ul className="space-y-1">
                      <li>• Encryption in transit and at rest</li>
                      <li>• Access controls and monitoring</li>
                      <li>• Secure cloud storage and database hosting</li>
                      <li>• Limited, need-to-know access to user data</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-foreground">Data Retention</h4>
                    <ul className="space-y-1">
                      <li>• Account data: Until account deletion</li>
                      <li>• Uploaded photos & generated designs: Until you delete them</li>
                      <li>• Usage logs: Up to 2 years</li>
                      <li>• Marketing data: Until opt-out</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            className="text-center bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold mb-4">Questions About Privacy?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              If you have any questions about this Privacy Policy or our data practices,
              please don't hesitate to contact us. We're here to help and ensure your privacy is protected.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline">
                <a href="mailto:support@yourdomain.com">
                  Contact Us
                </a>
              </Button>
              <Button asChild>
                <Link href="/">
                  Back to Home
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
