import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const PAGE_SIZE = 12;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: designs, error, count } = await supabase
      .from("generated_designs")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Failed to fetch design history:", error);
      return NextResponse.json({ error: "Failed to fetch design history" }, { status: 500 });
    }

    const totalCount = count ?? 0;

    return NextResponse.json({
      designs: designs ?? [],
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        totalCount,
        totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
      },
      stats: {
        totalDesigns: totalCount,
      },
    });
  } catch (error) {
    console.error("Design history error:", error);
    return NextResponse.json({ error: "Failed to fetch design history" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const designId = searchParams.get("id");

    if (!designId) {
      return NextResponse.json({ error: "Missing design id" }, { status: 400 });
    }

    // RLS also enforces this, but we check user_id explicitly for a clean 404
    // instead of a generic RLS failure.
    const { error } = await supabase
      .from("generated_designs")
      .delete()
      .eq("id", designId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to delete design:", error);
      return NextResponse.json({ error: "Failed to delete design" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Design deletion error:", error);
    return NextResponse.json({ error: "Failed to delete design" }, { status: 500 });
  }
}
