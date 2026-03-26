import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  Clock,
  Lock,
  LogOut,
  Package,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import type { Order } from "../backend.d";
import { useActor } from "../hooks/useActor";

// Admin PIN — change this to your desired PIN
const ADMIN_PIN = "admin2024";
const STORAGE_KEY = "bonkersbites_admin_auth";

function formatTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp / 1_000_000n));
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp / 1_000_000n));
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatItems(items: Order["items"]): string {
  return items.map((it) => `${it.itemName} x${it.quantity}`).join(", ");
}

function buildSummary(orders: Order[]): { name: string; qty: number }[] {
  const map = new Map<string, number>();
  for (const order of orders) {
    for (const item of order.items) {
      const prev = map.get(item.itemName) ?? 0;
      map.set(item.itemName, prev + Number(item.quantity));
    }
  }
  return Array.from(map.entries())
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty);
}

function AdminLoginGate({ onLogin }: { onLogin: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (pin === ADMIN_PIN) {
        sessionStorage.setItem(STORAGE_KEY, "true");
        onLogin();
      } else {
        setError("Incorrect PIN. Please try again.");
        setPin("");
      }
      setLoading(false);
    }, 400);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm text-center shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
          <UtensilsCrossed className="w-6 h-6 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-1">Admin Access</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Enter your admin PIN to access the dashboard.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError("");
              }}
              placeholder="Enter PIN"
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
              data-ocid="admin.pin.input"
            />
          </div>
          {error && (
            <p
              className="text-xs text-destructive text-left"
              data-ocid="admin.pin.error_state"
            >
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !pin}
            data-ocid="admin.pin.submit_button"
          >
            {loading ? "Verifying..." : "Access Dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const { actor, isFetching: actorLoading } = useActor();
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(STORAGE_KEY) === "true",
  );

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getOrders();
      return [...result].sort((a, b) => {
        if (b.timestamp > a.timestamp) return 1;
        if (b.timestamp < a.timestamp) return -1;
        return 0;
      });
    },
    enabled: !!actor && !actorLoading && isAuthenticated,
    refetchInterval: 30_000,
  });

  function handleLogout() {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsAuthenticated(false);
  }

  if (!isAuthenticated) {
    return <AdminLoginGate onLogin={() => setIsAuthenticated(true)} />;
  }

  const currentYear = new Date().getFullYear();
  const loading = isLoading || actorLoading;
  const summary = orders && orders.length > 0 ? buildSummary(orders) : [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">
              Bonkers Bites
            </span>
            <Badge
              variant="secondary"
              className="ml-1 text-xs font-semibold tracking-wide uppercase"
            >
              Admin
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ClipboardList className="w-4 h-4" />
              <span className="text-sm hidden sm:block">Orders Dashboard</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
              data-ocid="admin.header.signout.button"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Stats bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground">All Orders</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Sorted by latest time
            </p>
          </div>
          {!loading && orders && (
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl">
              <Package className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>
          )}
        </div>

        {/* Item Summary Section */}
        {!loading && summary.length > 0 && (
          <div
            className="mb-6 bg-card border border-border rounded-xl p-4"
            data-ocid="summary.section"
          >
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
              Item Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {summary.map(({ name, qty }) => (
                <div
                  key={name}
                  className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-lg px-3 py-2"
                  data-ocid={`summary.item.${name}`}
                >
                  <span className="text-sm text-foreground font-medium truncate mr-2">
                    {name}
                  </span>
                  <span className="text-sm font-bold text-primary shrink-0">
                    {qty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="mb-6 bg-card border border-border rounded-xl p-4">
            <Skeleton className="h-4 w-28 mb-3" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-9 rounded-lg" />
              ))}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="space-y-3" data-ocid="orders.loading_state">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && orders && orders.length === 0 && (
          <div
            className="flex flex-col items-center justify-center py-20 text-center"
            data-ocid="orders.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-base font-semibold text-foreground mb-1">
              No orders yet
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              Orders placed by your team will appear here, sorted by latest
              time.
            </p>
          </div>
        )}

        {/* Orders list */}
        {!loading && orders && orders.length > 0 && (
          <div className="space-y-2" data-ocid="orders.list">
            {orders.map((order, index) => (
              <div
                key={`${order.name}-${order.timestamp}`}
                className="bg-card border border-border rounded-xl px-4 py-3 flex items-start sm:items-center gap-3 hover:border-primary/30 hover:bg-primary/5 transition-colors"
                data-ocid={`orders.item.${index + 1}`}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {order.name.trim()[0]?.toUpperCase() ?? "?"}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="font-semibold text-foreground text-sm">
                      {order.name}
                    </span>
                    <span className="text-muted-foreground text-sm">→</span>
                    <span className="text-sm text-foreground/80 truncate">
                      {formatItems(order.items)}
                    </span>
                    <span className="text-muted-foreground text-sm hidden sm:inline">
                      →
                    </span>
                    <span className="text-xs text-muted-foreground sm:hidden">
                      {formatDate(order.timestamp)} · ₹
                      {order.totalAmount.toString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 sm:hidden">
                    {order.department} · {order.phone}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                    {order.department} · {order.phone}
                  </p>
                </div>

                {/* Time + amount */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-1 text-primary">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-sm font-medium">
                      {formatTime(order.timestamp)}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    ₹{order.totalAmount.toString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            © {currentYear}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="underline hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
