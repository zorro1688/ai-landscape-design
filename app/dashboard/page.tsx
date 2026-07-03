import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubscriptionStatusCard } from "@/components/dashboard/subscription-status-card";
import { CreditsBalanceCard } from "@/components/dashboard/credits-balance-card";
import { QuickActionsCard } from "@/components/dashboard/quick-actions-card";
import { RecentDesignsCard } from "@/components/dashboard/recent-designs-card";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Get customer data including credits and subscription
  const { data: customerData } = await supabase
    .from("customers")
    .select(
      `
      *,
      subscriptions (
        status,
        current_period_end,
        creem_product_id
      ),
      credits_history (
        amount,
        type,
        created_at
      )
    `
    )
    .eq("user_id", user.id)
    .single();

  const subscription = customerData?.subscriptions?.[0];
  const credits = customerData?.credits || 0;
  const recentCreditsHistory = customerData?.credits_history?.slice(0, 2) || [];

  // Fetch the user's most recent designs for the dashboard preview
  const { data: recentDesigns, count: totalDesignsCount } = await supabase
    .from("generated_designs")
    .select("id, result_image_url, style_id, created_at", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(4);

  return (
    <div className="flex-1 w-full flex flex-col gap-6 sm:gap-8 px-4 sm:px-8 container">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border rounded-lg p-6 sm:p-8 mt-6 sm:mt-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 break-words">
          Welcome back,{" "}
          <span className="block sm:inline mt-1 sm:mt-0">{user.email}</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your AI landscape designs, view your generation history, and track your usage.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <SubscriptionStatusCard subscription={subscription} />
        <CreditsBalanceCard
          credits={credits}
          recentHistory={recentCreditsHistory}
        />
        <QuickActionsCard />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentDesignsCard designs={recentDesigns || []} totalCount={totalDesignsCount || 0} />
      </div>

      {/* Account Details Section */}
      <div className="rounded-xl border bg-card p-4 sm:p-6 mb-6">
        <h2 className="font-bold text-lg sm:text-xl mb-4">Account Details</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium break-all">{user.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">User ID</p>
              <p className="font-medium break-all">{user.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
