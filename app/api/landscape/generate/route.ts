import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateLandscapeDesign, downloadImageBuffer } from "@/lib/replicate";
import {
  buildLandscapePrompt,
  getStyleById,
  type LandscapeRedesignIntensity,
} from "@/lib/landscape-styles";
import {
  buildLandscapeDesignResult,
  getLandscapeGenerationPlan,
  getLandscapeVariantInstruction,
  getLandscapeVariantSeed,
} from "@/lib/landscape-generation";
import { uploadBufferToR2, buildObjectKey } from "@/utils/r2/client";

interface GenerateLandscapeRequest {
  imageUrl: string; // R2 public URL of the already-uploaded source photo
  styleId: string;
  customDescription?: string;
  planType: "1" | "3"; // per-image cost: 1 credit = standard, 3 credits = premium
  intensity?: LandscapeRedesignIntensity;
}

const VALID_INTENSITIES: LandscapeRedesignIntensity[] = ["conservative", "balanced", "creative"];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body: GenerateLandscapeRequest = await request.json();
    const {
      imageUrl,
      styleId,
      customDescription,
      planType,
      intensity = "balanced",
    } = body;

    if (!imageUrl || !styleId || !planType) {
      return NextResponse.json(
        { error: "Missing required fields: imageUrl, styleId, and planType" },
        { status: 400 }
      );
    }

    if (!getStyleById(styleId) && styleId !== "custom") {
      return NextResponse.json({ error: "Unknown styleId" }, { status: 400 });
    }

    if (!VALID_INTENSITIES.includes(intensity)) {
      return NextResponse.json({ error: "Unknown redesign intensity" }, { status: 400 });
    }

    const generationPlan = getLandscapeGenerationPlan({
      isAuthenticated: Boolean(user),
      planType,
    });

    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp = forwarded ? forwarded.split(",")[0].trim() : realIp || "127.0.0.1";

    // ---- Rate limiting for anonymous users ----
    // Reuses the same IP-based rate limit RPC as the name generator.
    // NOTE: this currently shares the same daily counter as other free
    // tools on the site. If you want a separate daily quota specifically
    // for landscape design, duplicate `check_ip_rate_limit` into a new
    // RPC (e.g. `check_landscape_ip_rate_limit`) with its own table.
    if (!user) {
      const { data: canGenerate, error: rateLimitError } = await supabase.rpc(
        "check_ip_rate_limit",
        { p_client_ip: clientIp }
      );

      if (rateLimitError) {
        console.error("Rate limit check error:", rateLimitError);
        return NextResponse.json(
          { error: "Unable to verify rate limit. Please try again." },
          { status: 500 }
        );
      }

      if (!canGenerate) {
        return NextResponse.json(
          {
            error: "Free generation limit reached. Sign in for unlimited designs.",
            rateLimited: true,
            suggestion: "Create an account to keep generating designs",
          },
          { status: 429 }
        );
      }
    }

    // ---- Credit check for authenticated users ----
    // Credits are deducted only after all requested variants are generated.
    let customer: { id: string; credits: number } | null = null;

    if (user) {
      const { data: customerData, error: fetchError } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (fetchError || !customerData) {
        console.error("Error fetching customer:", fetchError);
        return NextResponse.json(
          { error: "Unable to verify your account. Please try again." },
          { status: 500 }
        );
      }

      customer = customerData;

      if (!customer || customer.credits < generationPlan.creditCost) {
        return NextResponse.json(
          { error: "Insufficient credits. Please purchase more credits." },
          { status: 403 }
        );
      }
    }

    // ---- Build the prompt and generate all requested variants ----
    const prompt = buildLandscapePrompt(styleId, customDescription, intensity);
    const generatedResults: Array<{
      resultImageUrl: string;
      originalImageUrl: string;
      styleId: string;
      variantIndex: number;
    }> = [];

    try {
      for (let variantIndex = 0; variantIndex < generationPlan.variantCount; variantIndex += 1) {
        const seed = getLandscapeVariantSeed(user?.id ?? clientIp, styleId, variantIndex, customDescription ?? "", intensity);
        const variantPrompt = `${prompt} ${getLandscapeVariantInstruction(variantIndex)}`;
        const generatedImageUrl = await generateLandscapeDesign(
          { imageUrl, prompt: variantPrompt, seed },
          generationPlan.tier
        );

        // ---- Persist the result to our own R2 bucket ----
        // Replicate's output URL is temporary, so we re-host the image ourselves.
        let resultImageUrl = generatedImageUrl;
        try {
          const { buffer, contentType } = await downloadImageBuffer(generatedImageUrl);
          const extension = contentType.includes("png") ? "png" : "jpg";
          const key = buildObjectKey("results", user?.id ?? null, extension);
          resultImageUrl = await uploadBufferToR2(key, buffer, contentType);
        } catch (storageError) {
          // Non-fatal: fall back to Replicate's temporary URL so the user
          // still sees a result, but log loudly since it will expire.
          console.error(
            "Failed to persist generated image to R2, falling back to temporary URL:",
            storageError
          );
        }

        generatedResults.push({
          resultImageUrl,
          originalImageUrl: imageUrl,
          styleId,
          variantIndex,
        });
      }
    } catch (genError) {
      console.error("Landscape generation failed:", genError);
      return NextResponse.json(
        {
          error: "Failed to generate your design. Please try again.",
          details: genError instanceof Error ? genError.message : "Unknown error",
        },
        { status: 502 }
      );
    }

    // ---- Save design records before charging credits (authenticated users only) ----
    // This avoids charging a user for a run that cannot appear in their history.
    let designIds: Array<string | null> = [];
    if (user) {
      const rows = generatedResults.map((result) => ({
        user_id: user.id,
        original_image_url: result.originalImageUrl,
        result_image_url: result.resultImageUrl,
        style_id: styleId,
        custom_description: customDescription ?? null,
        plan_type: planType,
        credits_used: parseInt(planType, 10),
      }));

      const { data: designs, error: insertError } = await supabase
        .from("generated_designs")
        .insert(rows)
        .select("id");

      if (insertError) {
        console.error("Failed to save generated design records:", insertError);
        return NextResponse.json(
          { error: "Failed to save your design history. Please try again." },
          { status: 500 }
        );
      }

      designIds = (designs ?? []).map((design: { id: string }) => design.id);
    }

    // ---- Deduct credits only after all variants are generated and saved ----
    if (user && customer) {
      const newCredits = customer.credits - generationPlan.creditCost;
      const { error: updateError } = await supabase
        .from("customers")
        .update({ credits: newCredits, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Credit deduction error:", updateError);
      } else {
        await supabase.from("credits_history").insert({
          customer_id: customer.id,
          amount: generationPlan.creditCost,
          type: "subtract",
          description: "landscape_design_generation",
          metadata: {
            operation: "landscape_design_generation",
            style_id: styleId,
            credits_before: customer.credits,
            credits_after: newCredits,
            plan_type: planType,
            variant_count: generationPlan.variantCount,
            intensity,
          },
        });
      }
    }

    const designs = generatedResults.map((result, index) =>
      buildLandscapeDesignResult({
        ...result,
        designId: designIds[index] ?? null,
        customDescription,
      })
    );
    const primaryDesign = designs[0];

    return NextResponse.json({
      resultImageUrl: primaryDesign.resultImageUrl,
      originalImageUrl: primaryDesign.originalImageUrl,
      styleId,
      designs,
      variantCount: generationPlan.variantCount,
      creditsUsed: user ? generationPlan.creditCost : 0,
      designId: primaryDesign.designId ?? null,
      intensity,
      message:
        generationPlan.variantCount > 1
          ? "Your AI landscape design options are ready!"
          : "Your AI landscape design is ready!",
    });
  } catch (error) {
    console.error("Landscape generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate your design. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}








