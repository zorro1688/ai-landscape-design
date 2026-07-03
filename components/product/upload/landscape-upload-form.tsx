"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { useCredits } from "@/hooks/use-credits";
import {
  LANDSCAPE_STYLES,
  type LandscapeDesignBrief,
  type LandscapeRedesignIntensity,
} from "@/lib/landscape-styles";
import { getLandscapeGenerationPlan } from "@/lib/landscape-generation";
import { cn } from "@/lib/utils";

export interface DesignVariantResult {
  resultImageUrl: string;
  originalImageUrl: string;
  styleId: string;
  variantIndex: number;
  designBrief: LandscapeDesignBrief;
  designId?: string | null;
}

export interface GenerateResult {
  resultImageUrl: string;
  originalImageUrl: string;
  styleId: string;
  designs?: DesignVariantResult[];
  intensity?: LandscapeRedesignIntensity;
}

interface LandscapeUploadFormProps {
  onGenerated: (result: GenerateResult) => void;
  hasTriedFree: boolean;
  onFreeTrialUsed: () => void;
}

type Stage = "idle" | "uploading" | "generating";

const INTENSITY_OPTIONS: Array<{
  id: LandscapeRedesignIntensity;
  label: string;
  description: string;
}> = [
  {
    id: "conservative",
    label: "Conservative",
    description: "Keep the layout and major planting mostly unchanged with subtle garden upgrades.",
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Keep buildings and site boundaries while visibly updating paths, plants, and landscape elements.",
  },
  {
    id: "creative",
    label: "Creative",
    description: "Add or replace landscape elements such as plants, benches, lights, stones, and water features without adding buildings.",
  },
];

export default function LandscapeUploadForm({
  onGenerated,
  hasTriedFree,
  onFreeTrialUsed,
}: LandscapeUploadFormProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const { credits, refetchCredits } = useCredits();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [styleId, setStyleId] = useState<string>(LANDSCAPE_STYLES[0].id);
  const [customDescription, setCustomDescription] = useState("");
  const [planType, setPlanType] = useState<"1" | "3">("1");
  const [intensity, setIntensity] = useState<LandscapeRedesignIntensity>("balanced");
  const [stage, setStage] = useState<Stage>("idle");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const generationPlan = getLandscapeGenerationPlan({
    isAuthenticated: Boolean(user),
    planType,
  });
  const creditCost = generationPlan.creditCost;
  const currentCredits = credits?.remaining_credits ?? 0;
  const hasEnoughCredits = user ? currentCredits >= creditCost : true;
  const isBusy = stage !== "idle";

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Unsupported file",
          description: "Please upload a JPG, PNG, or WEBP photo.",
        });
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a photo under 15MB.",
        });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    },
    [toast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  async function uploadToR2(file: File): Promise<string> {
    const presignRes = await fetch("/api/landscape/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: file.type, fileSizeBytes: file.size }),
    });

    if (!presignRes.ok) {
      const data = await presignRes.json().catch(() => ({}));
      throw new Error(data.error || "Failed to prepare upload.");
    }

    const { uploadUrl, publicUrl } = await presignRes.json();

    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!putRes.ok) {
      throw new Error("Failed to upload your photo. Please try again.");
    }

    return publicUrl;
  }

  async function handleGenerate() {
    if (!selectedFile) {
      toast({ title: "Add a photo first", description: "Upload a photo of your yard to get started." });
      return;
    }

    if (!user && hasTriedFree) {
      toast({
        title: "Free design used",
        description: "Sign in to keep generating AI landscape design concepts.",
      });
      return;
    }

    if (user && !hasEnoughCredits) {
      toast({
        title: "Insufficient credits",
        description: `You need ${creditCost} credits to generate ${generationPlan.variantCount} design options.`,
      });
      return;
    }

    try {
      setStage("uploading");
      const imageUrl = await uploadToR2(selectedFile);

      setStage("generating");
      const genRes = await fetch("/api/landscape/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          styleId,
          customDescription: customDescription || undefined,
          planType,
          intensity,
        }),
      });

      const data = await genRes.json();

      if (!genRes.ok) {
        if (genRes.status === 429 && data.rateLimited) {
          toast({
            title: "Daily limit reached",
            description: data.error || "Sign in for unlimited AI landscape designs.",
          });
          return;
        }
        throw new Error(data.error || "Failed to generate your design.");
      }

      if (!user) {
        onFreeTrialUsed();
      } else {
        refetchCredits();
      }

      toast({
        title: data.variantCount > 1 ? "Your design options are ready!" : "Your design is ready!",
        description: data.message || "Take a look at your new AI landscape design.",
      });

      onGenerated({
        resultImageUrl: data.resultImageUrl,
        originalImageUrl: data.originalImageUrl,
        styleId,
        designs: data.designs,
        intensity,
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    } finally {
      setStage("idle");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <div className="h-full overflow-y-auto rounded-2xl border border-border bg-background shadow-lg p-6 sm:p-8 space-y-6">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors min-h-[220px] overflow-hidden",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />

          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Your yard"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <>
              <span className="text-3xl">Photo</span>
              <p className="text-base font-medium text-foreground">
                Drop a photo of your yard here, or click to upload
              </p>
              <p className="text-sm text-muted-foreground">JPG, PNG, or WEBP - up to 15MB</p>
            </>
          )}

          {previewUrl && (
            <div className="absolute bottom-2 right-2 text-xs bg-background/90 px-2 py-1 rounded-md border border-border">
              Click to change photo
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Choose a style</p>
          <div className="flex flex-wrap gap-2">
            {LANDSCAPE_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setStyleId(style.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm border transition-colors",
                  styleId === style.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-foreground border-border hover:border-primary/50"
                )}
              >
                {style.label}{style.category === "creative" ? " (Creative)" : ""}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Redesign intensity</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {INTENSITY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setIntensity(option.id)}
                className={cn(
                  "rounded-lg border p-3 text-left transition-colors",
                  intensity === option.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/30 hover:border-primary/40"
                )}
              >
                <span className="block text-sm font-medium text-foreground">{option.label}</span>
                <span className="mt-1 block text-xs leading-5 text-muted-foreground">{option.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Anything specific? <span className="text-muted-foreground font-normal">(optional)</span>
          </p>
          <Textarea
            placeholder='e.g. "add a stone path and a small fire pit"'
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            className="min-h-[70px]"
          />
        </div>

        {user && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Generation quality - {generationPlan.variantCount} options per run
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPlanType("1")}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm border transition-colors",
                  planType === "1" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                )}
              >
                Standard <span className="text-muted-foreground">(4 credits)</span>
              </button>
              <button
                type="button"
                onClick={() => setPlanType("3")}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm border transition-colors",
                  planType === "3" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
                )}
              >
                Premium <span className="text-muted-foreground">(12 credits)</span>
              </button>
            </div>
          </div>
        )}

        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isBusy || !selectedFile || (!!user && !hasEnoughCredits)}
          className="w-full h-14 text-lg"
        >
          <AnimatePresence mode="wait">
            {stage === "uploading" && (
              <motion.span key="uploading" className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Uploading your photo...
              </motion.span>
            )}
            {stage === "generating" && (
              <motion.span key="generating" className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {user ? "Generating 4 design options..." : "Generating your free design..."}
              </motion.span>
            )}
            {stage === "idle" && (
              <motion.span key="idle">
                {user
                  ? hasEnoughCredits
                    ? `Generate ${generationPlan.variantCount} Designs (${creditCost} Credits)`
                    : "Insufficient Credits"
                  : hasTriedFree
                    ? "Sign In for More Designs"
                    : "Generate My Free Design"}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>

        {!user && (
          <p className="text-center text-sm text-muted-foreground">
            No sign-up required for your first AI landscape design. Sign in to generate 4 options per run.
          </p>
        )}
      </div>
    </motion.div>
  );
}



