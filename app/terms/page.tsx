"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Scale, AlertTriangle, CheckCircle, XCircle, Users } from "lucide-react";

export default function TermsPage() {
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
              <h1 className="text-xl font-bold">Terms of Service</h1>
              <p className="text-sm text-muted-foreground">
                Terms and conditions for using our service
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
              <Scale className="mr-2 h-4 w-4" />
              Legal Terms
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Terms of Service
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              These terms govern your use of our AI landscape design service.
              By using our service, you agree to these terms and conditions.
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Last updated:</strong> June 26, 2026
            </p>
          </motion.div>

          {/* Key Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid gap-6 md:grid-cols-3"
          >
            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">What You Can Do</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Use our service to generate AI landscape designs from your own photos, save
                  them to your design history, and download them for personal use.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mb-4">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle className="text-lg">What You Cannot Do</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Upload photos you don't have the right to use, misuse our service, or use it
                  for illegal or harmful purposes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Our Commitment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Provide reliable service, protect your privacy, and be upfront that our designs
                  are visual concepts, not construction plans.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Service Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-8"
          >
            <div className="bg-muted/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                Our Service
              </h3>

              <div className="space-y-4 text-muted-foreground">
                <p>
                  Our AI landscape design generator creates photorealistic redesign concepts
                  based on a photo of your outdoor space and your chosen style. Our service includes:
                </p>

                <ul className="space-y-2">
                  <li>• <strong>Free Trial:</strong> One free AI landscape design generation for new, non-registered users</li>
                  <li>• <strong>Credit-Based Generation:</strong> Purchase credits to generate additional designs in any style, with no subscription or expiration</li>
                  <li>• <strong>Design History:</strong> Save and revisit your generated designs from your account</li>
                  <li>• <strong>Multiple Styles:</strong> A range of landscape styles to compare before you commit to one</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* User Responsibilities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="space-y-8"
          >
            <div className="bg-muted/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Your Responsibilities</h3>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-3 text-green-700">Acceptable Use</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Only upload photos of property you own or have permission to use</li>
                    <li>• Provide accurate information when creating an account</li>
                    <li>• Use generated designs for personal or professional planning purposes</li>
                    <li>• Keep your account credentials secure</li>
                    <li>• Report any technical issues or misuse</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-red-700">Prohibited Activities</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Uploading photos of people, or property you don't have rights to</li>
                    <li>• Attempting to reverse-engineer our algorithms</li>
                    <li>• Sharing account credentials with others</li>
                    <li>• Using automated tools to bulk-generate designs outside normal use</li>
                    <li>• Violating any applicable laws or regulations</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Intellectual Property */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="space-y-8"
          >
            <div className="bg-muted/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Intellectual Property and Generated Designs</h3>

              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="font-semibold mb-3 text-foreground">Your Rights to Generated Designs</h4>
                  <p>
                    You have the right to use any AI landscape design generated through our
                    service for personal or professional planning purposes, including sharing it
                    with a contractor or landscaper.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-foreground">Our Intellectual Property</h4>
                  <p>
                    The platform itself, including our website design, brand elements, and
                    proprietary technology, remains our intellectual property. You may not copy,
                    modify, or redistribute our platform or technology.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 text-foreground">Your Photos</h4>
                  <p>
                    You retain ownership of the photos you upload. By uploading a photo, you
                    grant us a limited license to process it solely for the purpose of generating
                    your AI landscape design.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Service Availability */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="space-y-8"
          >
            <div className="bg-muted/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                Service Availability and Disclaimers
              </h3>

              <div className="space-y-4 text-muted-foreground">
                <div>
                  <h4 className="font-semibold mb-2 text-foreground">Service Availability</h4>
                  <p>
                    While we strive to maintain 24/7 service availability, we cannot guarantee
                    uninterrupted access. We may temporarily suspend service for maintenance,
                    updates, or due to circumstances beyond our control.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-foreground">AI-Generated Content Is Conceptual Only</h4>
                  <p>
                    Designs generated by our service are visual concepts intended for
                    inspiration and planning. They are <strong>not</strong> engineering drawings,
                    construction plans, or surveys, and do not account for structural
                    requirements, drainage, grading, local building codes, permits, or property
                    line accuracy. Always consult a licensed landscaper, architect, or
                    contractor before beginning any construction, excavation, retaining wall,
                    pool, or other structural work based on a generated design.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-foreground">No Warranties</h4>
                  <p>
                    Our service is provided "as is" without warranties of any kind. We do not
                    guarantee that a generated design is buildable, code-compliant, or suitable
                    for any specific property or purpose.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Payment Terms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="space-y-8"
          >
            <div className="bg-muted/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Payment and Credit Terms</h3>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-3">Credit Packs</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• One-time purchases, no recurring subscription</li>
                    <li>• Credits do not expire</li>
                    <li>• 1 credit per standard design, more for premium-model designs</li>
                    <li>• Credits are tied to your account and are non-transferable</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Refunds</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Refunds are evaluated case-by-case for unused credits</li>
                    <li>• No refunds for credits already spent on a completed generation</li>
                    <li>• Contact support if a generation fails to complete</li>
                    <li>• Payments are processed securely by our payment provider, Creem</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Changes to Terms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
            className="space-y-8"
          >
            <div className="bg-muted/30 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">Changes to These Terms</h3>

              <div className="space-y-4 text-muted-foreground">
                <p>
                  We may update these Terms of Service from time to time to reflect changes in
                  our service, legal requirements, or business practices. When we make changes:
                </p>

                <ul className="space-y-2">
                  <li>• We will update the "Last updated" date at the top of this page</li>
                  <li>• For significant changes, we will notify users via email or service notifications</li>
                  <li>• Continued use of our service after changes constitutes acceptance of new terms</li>
                  <li>• You can always find the current version of our terms on this page</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.6 }}
            className="text-center bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-8"
          >
            <h3 className="text-2xl font-bold mb-4">Questions About These Terms?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              If you have any questions about these Terms of Service or need clarification about
              your rights and responsibilities, please contact us. We're here to help ensure you
              understand and can comply with these terms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline">
                <a href="mailto:support@yourdomain.com">
                  Contact Support
                </a>
              </Button>
              <Button asChild>
                <Link href="/">
                  Start Using Service
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
