"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getLandscapeDesignBrief, getStyleById } from "@/lib/landscape-styles";
import BeforeAfterDisplay from "@/components/product/results/before-after-display";

interface GeneratedDesign {
  id: string;
  user_id: string;
  original_image_url: string;
  result_image_url: string;
  style_id: string;
  custom_description: string | null;
  plan_type: "1" | "3";
  credits_used: number;
  created_at: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export default function DesignHistoryPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();

  const [designs, setDesigns] = useState<GeneratedDesign[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDesign, setSelectedDesign] = useState<GeneratedDesign | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchHistory = useCallback(
    async (targetPage: number) => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/landscape/history?page=${targetPage}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load your design history.");
        }

        setDesigns(data.designs || []);
        setPagination(data.pagination || null);
      } catch (error) {
        console.error("Failed to load design history:", error);
        toast({
          title: "Failed to load history",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Sign in to view your saved AI landscape designs.",
      });
      router.replace("/sign-in");
      return;
    }

    fetchHistory(page);
  }, [user, userLoading, page, fetchHistory, router, toast]);

  async function handleDelete(designId: string) {
    setDeletingId(designId);
    try {
      const res = await fetch(`/api/landscape/history?id=${designId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete design.");
      }

      setDesigns((prev) => prev.filter((d) => d.id !== designId));
      if (selectedDesign?.id === designId) setSelectedDesign(null);

      toast({ title: "Design deleted" });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  }

  if (userLoading || (isLoading && designs.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">My Designs</h1>
            <p className="text-muted-foreground">
              {pagination
                ? `${pagination.totalCount} AI landscape design${pagination.totalCount === 1 ? "" : "s"} generated so far.`
                : "Your saved AI landscape designs."}
            </p>
          </div>
          <Button onClick={() => router.push("/")} variant="outline">
            Back to Generator
          </Button>
        </div>

        {designs.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <p className="text-muted-foreground text-lg">
              You haven't generated any designs yet.
            </p>
            <Button onClick={() => router.push("/")}>Generate Your First Design</Button>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {designs.map((design, index) => {
                const style = getStyleById(design.style_id);
                return (
                  <motion.div
                    key={design.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group rounded-xl overflow-hidden border border-border bg-background shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedDesign(design)}
                  >
                    <div className="relative aspect-[4/3]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={design.result_image_url}
                        alt={`AI landscape design - ${style?.label ?? "custom"} style`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 right-2 text-xs font-medium bg-black/60 text-white px-2 py-1 rounded">
                        {style?.label ?? "Custom"}
                      </span>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(design.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {design.credits_used} credit{design.credits_used === 1 ? "" : "s"} used
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(design.id);
                        }}
                        disabled={deletingId === design.id}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1"
                      >
                        {deletingId === design.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-4">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Expanded Before/After view */}
      <Dialog open={!!selectedDesign} onOpenChange={(open) => !open && setSelectedDesign(null)}>
        <DialogContent className="max-w-6xl">
          {selectedDesign && (
            <BeforeAfterDisplay
              result={{
                resultImageUrl: selectedDesign.result_image_url,
                originalImageUrl: selectedDesign.original_image_url,
                styleId: selectedDesign.style_id,
                designs: [
                  {
                    resultImageUrl: selectedDesign.result_image_url,
                    originalImageUrl: selectedDesign.original_image_url,
                    styleId: selectedDesign.style_id,
                    variantIndex: 0,
                    designId: selectedDesign.id,
                    designBrief: getLandscapeDesignBrief(selectedDesign.style_id),
                  },
                ],
              }}
              onTryAgain={() => {
                setSelectedDesign(null);
                router.push("/");
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}





