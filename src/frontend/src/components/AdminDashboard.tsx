import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ClipboardList,
  Clock,
  Lock,
  LogOut,
  Package,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import type { Order } from "../backend.d";
import { useActor } from "../hooks/useActor";

// Admin PIN — change this to your desired PIN
const ADMIN_PIN = "admin2024";
const STORAGE_KEY = "bonkersbites_admin_auth";

function formatDateTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp / 1_000_000n));
  const datePart = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const timePart = `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
  return `${datePart}, ${timePart}`;
}

function getDateKey(timestamp: bigint): string {
  const date = new Date(Number(timestamp / 1_000_000n));
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, "0");
  const d = now.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateHeading(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const formatted = date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const today = getTodayKey();
  const yesterday = getYesterdayKey();
  if (dateKey === today) return `📅 Today · ${formatted}`;
  if (dateKey === yesterday) return `📅 Yesterday · ${formatted}`;
  return `📅 ${formatted}`;
}

function formatTodayDate(): string {
  return new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
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

type FilterMode = "all" | "today" | "yesterday" | "custom";
type ViewMode = "by-date" | "by-restaurant";

function groupOrdersByDate(
  orders: Order[],
): { dateKey: string; orders: Order[] }[] {
  const map = new Map<string, Order[]>();
  for (const order of orders) {
    const key = getDateKey(order.timestamp);
    const group = map.get(key) ?? [];
    group.push(order);
    map.set(key, group);
  }
  const sortedKeys = Array.from(map.keys()).sort((a, b) => (a > b ? -1 : 1));
  return sortedKeys.map((dateKey) => ({
    dateKey,
    orders: (map.get(dateKey) ?? []).sort((a, b) =>
      b.timestamp > a.timestamp ? 1 : b.timestamp < a.timestamp ? -1 : 0,
    ),
  }));
}

function groupOrdersByRestaurant(
  orders: Order[],
): { restaurant: string; orders: Order[] }[] {
  const map = new Map<string, Order[]>();
  for (const order of orders) {
    const key = order.restaurantName || "General";
    const group = map.get(key) ?? [];
    group.push(order);
    map.set(key, group);
  }
  return Array.from(map.entries())
    .map(([restaurant, ords]) => ({
      restaurant,
      orders: ords.sort((a, b) =>
        b.timestamp > a.timestamp ? 1 : b.timestamp < a.timestamp ? -1 : 0,
      ),
    }))
    .sort((a, b) => b.orders.length - a.orders.length);
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
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [customDate, setCustomDate] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("by-date");

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
  const allOrders = orders ?? [];
  const summary = allOrders.length > 0 ? buildSummary(allOrders) : [];

  // Today's summary
  const todayKey = getTodayKey();
  const todayOrders = allOrders.filter(
    (o) => getDateKey(o.timestamp) === todayKey,
  );
  const todaySummary = buildSummary(todayOrders);
  const todayTotalItems = todaySummary.reduce((acc, { qty }) => acc + qty, 0);

  // Filtering
  const yesterdayKey = getYesterdayKey();
  let filteredOrders: Order[];
  if (filterMode === "today") {
    filteredOrders = allOrders.filter(
      (o) => getDateKey(o.timestamp) === todayKey,
    );
  } else if (filterMode === "yesterday") {
    filteredOrders = allOrders.filter(
      (o) => getDateKey(o.timestamp) === yesterdayKey,
    );
  } else if (filterMode === "custom" && customDate) {
    filteredOrders = allOrders.filter(
      (o) => getDateKey(o.timestamp) === customDate,
    );
  } else {
    filteredOrders = allOrders;
  }

  const groupedOrders = groupOrdersByDate(filteredOrders);
  const groupedByRestaurant = groupOrdersByRestaurant(filteredOrders);
  const mostRecentKey =
    allOrders.length > 0
      ? `${allOrders[0].name}-${allOrders[0].timestamp}`
      : null;

  const isFiltered = filterMode !== "all";

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
        {/* TODAY'S ORDER SUMMARY — top of dashboard */}
        {!loading && (
          <div
            className="mb-6 rounded-xl border-2 border-amber-300/60 bg-amber-50/60 dark:bg-amber-950/20 dark:border-amber-600/40 p-4"
            data-ocid="today.summary.section"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  Today's Order Summary
                </h2>
                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  {formatTodayDate()}
                </span>
              </div>
              {todaySummary.length > 0 && (
                <span className="text-xs bg-amber-200/70 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200 px-2.5 py-1 rounded-full font-semibold">
                  {todayTotalItems} {todayTotalItems === 1 ? "item" : "items"}{" "}
                  today
                </span>
              )}
            </div>
            {todaySummary.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {todaySummary.map(({ name, qty }) => (
                  <div
                    key={name}
                    className="flex items-center justify-between bg-white/70 dark:bg-amber-900/30 border border-amber-200/80 dark:border-amber-700/40 rounded-lg px-3 py-2"
                    data-ocid="today.summary.item.card"
                  >
                    <span className="text-sm text-amber-900 dark:text-amber-100 font-medium truncate mr-2">
                      {name}
                    </span>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400 shrink-0">
                      = {qty}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p
                className="text-sm text-amber-700/70 dark:text-amber-400/60 italic"
                data-ocid="today.summary.empty_state"
              >
                No orders placed today yet.
              </p>
            )}
          </div>
        )}

        {/* Stats bar */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-foreground">All Orders</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isFiltered && !loading
                ? `Showing ${filteredOrders.length} of ${allOrders.length} orders`
                : "Sorted by latest time"}
            </p>
          </div>
          {!loading && allOrders.length > 0 && (
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl">
              <Package className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {isFiltered ? filteredOrders.length : allOrders.length}{" "}
                {(isFiltered ? filteredOrders.length : allOrders.length) === 1
                  ? "Order"
                  : "Orders"}
              </span>
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        {!loading && allOrders.length > 0 && (
          <div
            className="flex items-center gap-1 p-1 bg-muted rounded-xl mb-5 w-fit"
            data-ocid="admin.view.toggle"
          >
            <button
              type="button"
              onClick={() => setViewMode("by-date")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "by-date"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="admin.view.date.tab"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              By Date
            </button>
            <button
              type="button"
              onClick={() => setViewMode("by-restaurant")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "by-restaurant"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-ocid="admin.view.restaurant.tab"
            >
              <Store className="w-3.5 h-3.5" />
              By Restaurant
            </button>
          </div>
        )}

        {/* Filter bar — only shown in by-date mode */}
        {!loading && viewMode === "by-date" && (
          <div className="mb-5" data-ocid="orders.filter.panel">
            <div className="flex flex-wrap gap-2">
              {(["all", "today", "yesterday", "custom"] as FilterMode[]).map(
                (mode) => {
                  const labels: Record<FilterMode, string> = {
                    all: "All Orders",
                    today: "Today",
                    yesterday: "Yesterday",
                    custom: "Custom Date",
                  };
                  const isActive = filterMode === mode;
                  return (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setFilterMode(mode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
                      }`}
                      data-ocid={`orders.filter.${mode}.button`}
                    >
                      {labels[mode]}
                    </button>
                  );
                },
              )}
            </div>
            {filterMode === "custom" && (
              <div className="flex items-center gap-3 mt-3">
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  data-ocid="orders.filter.custom.input"
                />
                {customDate && (
                  <span className="text-xs text-muted-foreground">
                    {formatDateHeading(customDate).replace("📅 ", "")}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* All-Time Item Summary Section — always uses ALL orders */}
        {!loading && summary.length > 0 && (
          <div
            className="mb-6 bg-card border border-border rounded-xl p-4"
            data-ocid="summary.section"
          >
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
              All-Time Item Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {summary.map(({ name, qty }) => (
                <div
                  key={name}
                  className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-lg px-3 py-2"
                  data-ocid="summary.item.card"
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

        {/* Empty state — no orders at all */}
        {!loading && allOrders.length === 0 && (
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

        {/* Empty state — filtered but no matches */}
        {!loading &&
          allOrders.length > 0 &&
          filteredOrders.length === 0 &&
          isFiltered && (
            <div
              className="flex flex-col items-center justify-center py-16 text-center"
              data-ocid="orders.filter.empty_state"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                <CalendarDays className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                No orders found for this date.
              </p>
              <p className="text-xs text-muted-foreground">
                Try selecting a different date filter.
              </p>
            </div>
          )}

        {/* BY DATE view */}
        {!loading && filteredOrders.length > 0 && viewMode === "by-date" && (
          <div className="space-y-6" data-ocid="orders.list">
            {groupedOrders.map(({ dateKey, orders: dateOrders }) => (
              <div key={dateKey}>
                {/* Date heading */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-muted/60 border border-border/50 rounded-full px-4 py-1">
                    <span className="text-sm font-semibold text-foreground">
                      {formatDateHeading(dateKey)}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-border/50" />
                  <span className="text-xs text-muted-foreground">
                    {dateOrders.length}{" "}
                    {dateOrders.length === 1 ? "order" : "orders"}
                  </span>
                </div>
                <div className="space-y-2">
                  {dateOrders.map((order, index) => {
                    const orderKey = `${order.name}-${order.timestamp}`;
                    const isMostRecent = orderKey === mostRecentKey;
                    return (
                      <OrderCard
                        key={orderKey}
                        order={order}
                        index={index}
                        isMostRecent={isMostRecent}
                        showRestaurant
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BY RESTAURANT view */}
        {!loading &&
          filteredOrders.length > 0 &&
          viewMode === "by-restaurant" && (
            <div className="space-y-8" data-ocid="orders.restaurant.list">
              {groupedByRestaurant.map(({ restaurant, orders: restOrders }) => {
                const restSummary = buildSummary(restOrders);
                return (
                  <div key={restaurant}>
                    {/* Restaurant heading */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-4 py-1">
                        <Store className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-semibold text-primary">
                          {restaurant}
                        </span>
                      </div>
                      <div className="flex-1 h-px bg-border/50" />
                      <span className="text-xs text-muted-foreground">
                        {restOrders.length}{" "}
                        {restOrders.length === 1 ? "order" : "orders"}
                      </span>
                    </div>

                    {/* Orders for this restaurant */}
                    <div className="space-y-2 mb-3">
                      {restOrders.map((order, index) => (
                        <OrderCard
                          key={`${order.name}-${order.timestamp}`}
                          order={order}
                          index={index}
                          isMostRecent={
                            `${order.name}-${order.timestamp}` === mostRecentKey
                          }
                          showRestaurant={false}
                        />
                      ))}
                    </div>

                    {/* Per-restaurant item summary */}
                    {restSummary.length > 0 && (
                      <div className="bg-muted/40 border border-border/60 rounded-xl p-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Item Summary — {restaurant}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {restSummary.map(({ name, qty }) => (
                            <div
                              key={name}
                              className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-2.5 py-1"
                            >
                              <span className="text-xs text-foreground font-medium">
                                {name}
                              </span>
                              <span className="text-xs font-bold text-primary">
                                ×{qty}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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

function OrderCard({
  order,
  index,
  isMostRecent,
  showRestaurant,
}: {
  order: Order;
  index: number;
  isMostRecent: boolean;
  showRestaurant: boolean;
}) {
  return (
    <div
      className={`bg-card border rounded-xl px-4 py-3 flex items-start sm:items-center gap-3 hover:border-primary/30 hover:bg-primary/5 transition-colors ${
        isMostRecent
          ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20"
          : "border-border"
      }`}
      data-ocid={`orders.item.${index + 1}`}
    >
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          isMostRecent ? "bg-primary/25" : "bg-primary/15"
        }`}
      >
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
          {isMostRecent && (
            <span className="text-xs bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-medium">
              Latest
            </span>
          )}
          {showRestaurant &&
            order.restaurantName &&
            order.restaurantName !== "General" && (
              <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                🏪 {order.restaurantName}
              </span>
            )}
          <span className="text-muted-foreground text-sm">→</span>
          <span className="text-sm text-foreground/80 truncate">
            {formatItems(order.items)}
          </span>
          <span className="text-muted-foreground text-sm hidden sm:inline">
            →
          </span>
          <span className="text-xs text-muted-foreground sm:hidden">
            ₹{order.totalAmount.toString()}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {order.department} · {order.phone}
        </p>
      </div>

      {/* DateTime + amount */}
      <div className="flex flex-col items-end gap-1 shrink-0 max-w-[160px]">
        <div className="flex items-center gap-1 text-primary">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span className="text-xs font-medium text-right leading-tight">
            {formatDateTime(order.timestamp)}
          </span>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          ₹{order.totalAmount.toString()}
        </span>
      </div>
    </div>
  );
}
