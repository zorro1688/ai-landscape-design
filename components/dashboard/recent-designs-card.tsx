import Link from "next/link";
import { getStyleById } from "@/lib/landscape-styles";

interface RecentDesign {
  id: string;
  result_image_url: string;
  style_id: string;
  created_at: string;
}

interface RecentDesignsCardProps {
  designs: RecentDesign[];
  totalCount: number;
}

export function RecentDesignsCard({ designs, totalCount }: RecentDesignsCardProps) {
  return (
    <div className="rounded-xl border bg-card p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recent Designs</h3>
        <Link href="/results" className="text-sm text-primary hover:underline">
          View all ({totalCount}) →
        </Link>
      </div>

      {designs.length === 0 ? (
        <div className="text-center py-8 space-y-3">
          <p className="text-sm text-muted-foreground">
            You haven't generated any AI landscape designs yet.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-9 px-4 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
          >
            Generate Your First Design
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {designs.map((design) => {
            const style = getStyleById(design.style_id);
            return (
              <Link
                key={design.id}
                href="/results"
                className="group relative aspect-[4/3] rounded-lg overflow-hidden border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={design.result_image_url}
                  alt={`AI landscape design - ${style?.label ?? "custom"} style`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <span className="absolute bottom-1 left-1 text-[10px] font-medium bg-black/60 text-white px-1.5 py-0.5 rounded">
                  {style?.label ?? "Custom"}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
