import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ChefHat, ChevronDown, ShoppingCart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AdminDashboard } from "./components/AdminDashboard";
import { MenuItemCard } from "./components/MenuItemCard";
import { OrderSidebar } from "./components/OrderSidebar";
import { SuccessOverlay } from "./components/SuccessOverlay";
import {
  LUNCH_RESTAURANTS,
  RESTAURANTS,
  lunchMenus,
  menuItems,
  restaurantMenus,
} from "./data/menuData";
import { useActor } from "./hooks/useActor";
import type {
  CartItem,
  MenuItem,
  OrderForm,
  RestaurantCartItem,
} from "./types";

const CATEGORIES = [
  { key: "breakfast", label: "☀️ Breakfast" },
  { key: "lunch", label: "🍱 Lunch" },
  { key: "snacks", label: "🍿 Snacks" },
] as const;

// Restaurant emojis mapping
const RESTAURANT_EMOJIS: Record<string, string> = {
  "Ruchi Cafe": "🍽️",
  "Anna Cafe": "☕",
  "Local Shop": "🛒",
  "Babu's Classic": "🍔",
};

function getRestaurantLabel(name: string): string {
  const emoji = RESTAURANT_EMOJIS[name] ?? "🏪";
  return `${emoji} ${name}`;
}

// Food emoji mapping based on item name keywords
function getMenuItemEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("dosa")) return "🫓";
  if (lower.includes("idli")) return "🍚";
  if (lower.includes("vada") || lower.includes("wada")) return "🍩";
  if (
    lower.includes("upma") ||
    lower.includes("poha") ||
    lower.includes("khichdi") ||
    lower.includes("khichadi")
  )
    return "🥣";
  if (lower.includes("puri") || lower.includes("bhaji")) return "🍛";
  if (lower.includes("thali")) return "🍽️";
  if (lower.includes("biryani")) return "🍲";
  if (lower.includes("rice")) return "🍚";
  if (lower.includes("noodle")) return "🍜";
  if (lower.includes("pizza")) return "🍕";
  if (lower.includes("burger")) return "🍔";
  if (lower.includes("sandwich")) return "🥪";
  if (lower.includes("lassi")) return "🥛";
  if (lower.includes("juice")) return "🧃";
  if (lower.includes("tea") || lower.includes("chai")) return "☕";
  if (lower.includes("coffee")) return "☕";
  if (lower.includes("samosa")) return "🥟";
  if (lower.includes("vada pav") || lower.includes("wada pav")) return "🍔";
  if (lower.includes("pav") || lower.includes("bhaji")) return "🍞";
  if (lower.includes("maggi")) return "🍜";
  if (lower.includes("pulav") || lower.includes("pulao")) return "🍲";
  if (lower.includes("chapati") || lower.includes("roti")) return "🫓";
  if (lower.includes("sheera")) return "🍮";
  if (lower.includes("sabudana")) return "🥣";
  if (lower.includes("misal") || lower.includes("usal")) return "🍛";
  if (
    lower.includes("lime") ||
    lower.includes("lemon") ||
    lower.includes("ginger")
  )
    return "🍋";
  if (lower.includes("buttermilk")) return "🥛";
  if (
    lower.includes("sugar") ||
    lower.includes("beet") ||
    lower.includes("carrot") ||
    lower.includes("watermelon") ||
    lower.includes("pineapple") ||
    lower.includes("mosambi")
  )
    return "🧃";
  return "🍴";
}

const isAdminRoute = window.location.pathname === "/admin";

export default function App() {
  if (isAdminRoute) {
    return <AdminDashboard />;
  }

  return <MainApp />;
}

function MainApp() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [restaurantCart, setRestaurantCart] = useState<RestaurantCartItem[]>(
    [],
  );
  const [lunchCart, setLunchCart] = useState<RestaurantCartItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("breakfast");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [selectedLunchRestaurant, setSelectedLunchRestaurant] =
    useState<string>("");
  const [form, setForm] = useState<OrderForm>({
    name: "",
    department: "",
    phone: "",
    restaurantName: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<OrderForm>>({});
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { actor } = useActor();

  const regularCartTotal = cart.reduce(
    (sum, ci) => sum + ci.item.price * ci.quantity,
    0,
  );
  const restaurantCartTotal = restaurantCart.reduce(
    (sum, ci) => sum + ci.item.price * ci.quantity,
    0,
  );
  const lunchCartTotal = lunchCart.reduce(
    (sum, ci) => sum + ci.item.price * ci.quantity,
    0,
  );
  const cartTotalItems =
    cart.reduce((sum, ci) => sum + ci.quantity, 0) +
    restaurantCart.reduce((sum, ci) => sum + ci.quantity, 0) +
    lunchCart.reduce((sum, ci) => sum + ci.quantity, 0);
  const cartTotal = regularCartTotal + restaurantCartTotal + lunchCartTotal;

  const getCartItem = (itemId: string) =>
    cart.find((ci) => ci.item.id === itemId);
  const getRestaurantCartItem = (itemId: string) =>
    restaurantCart.find((ci) => ci.item.id === itemId);
  const getLunchCartItem = (itemId: string) =>
    lunchCart.find((ci) => ci.item.id === itemId);

  const handleToggle = (item: MenuItem) => {
    setCart((prev) => {
      const exists = prev.find((ci) => ci.item.id === item.id);
      if (exists) {
        return prev.map((ci) =>
          ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci,
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleQtyChange = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((ci) =>
          ci.item.id === itemId ? { ...ci, quantity: ci.quantity + delta } : ci,
        )
        .filter((ci) => ci.quantity > 0),
    );
  };

  const handleRestaurantAdd = (itemId: string) => {
    const menu = restaurantMenus[selectedRestaurant];
    const item = menu?.find((m) => m.id === itemId);
    if (!item) return;
    setRestaurantCart((prev) => {
      const exists = prev.find((ci) => ci.item.id === itemId);
      if (exists) {
        return prev.map((ci) =>
          ci.item.id === itemId ? { ...ci, quantity: ci.quantity + 1 } : ci,
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleRestaurantQtyChange = (itemId: string, delta: number) => {
    setRestaurantCart((prev) =>
      prev
        .map((ci) =>
          ci.item.id === itemId ? { ...ci, quantity: ci.quantity + delta } : ci,
        )
        .filter((ci) => ci.quantity > 0),
    );
  };

  const handleLunchAdd = (itemId: string) => {
    const menu = lunchMenus[selectedLunchRestaurant];
    const item = menu?.find((m) => m.id === itemId);
    if (!item) return;
    setLunchCart((prev) => {
      const exists = prev.find((ci) => ci.item.id === itemId);
      if (exists) {
        return prev.map((ci) =>
          ci.item.id === itemId ? { ...ci, quantity: ci.quantity + 1 } : ci,
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const handleLunchQtyChange = (itemId: string, delta: number) => {
    setLunchCart((prev) =>
      prev
        .map((ci) =>
          ci.item.id === itemId ? { ...ci, quantity: ci.quantity + delta } : ci,
        )
        .filter((ci) => ci.quantity > 0),
    );
  };

  const handleRestaurantChange = (restaurant: string) => {
    setSelectedRestaurant(restaurant);
    setRestaurantCart([]);
    setForm((prev) => ({ ...prev, restaurantName: restaurant }));
  };

  const handleLunchRestaurantChange = (restaurant: string) => {
    setSelectedLunchRestaurant(restaurant);
    setLunchCart([]);
    setForm((prev) => ({ ...prev, restaurantName: restaurant }));
  };

  const handleFormChange = (field: keyof OrderForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const errors: Partial<OrderForm> = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.department.trim()) errors.department = "Department is required";
    if (!form.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(form.phone.trim()))
      errors.phone = "Enter a valid 10-digit number";

    if (cartTotalItems === 0) {
      alert("Please add at least one item to your order.");
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const restaurantName =
      selectedRestaurant || selectedLunchRestaurant || "General";

    const allItems = [
      ...cart.map((ci) => ({
        itemName: ci.item.name,
        quantity: BigInt(ci.quantity),
        price: BigInt(ci.item.price),
      })),
      ...restaurantCart.map((ci) => ({
        itemName: ci.item.name,
        quantity: BigInt(ci.quantity),
        price: BigInt(ci.item.price),
      })),
      ...lunchCart.map((ci) => ({
        itemName: ci.item.name,
        quantity: BigInt(ci.quantity),
        price: BigInt(ci.item.price),
      })),
    ];

    if (actor) {
      try {
        await actor.placeOrder(
          form.name,
          form.department,
          form.phone,
          restaurantName,
          allItems,
          BigInt(cartTotal),
        );
      } catch (e) {
        console.error("Failed to save order:", e);
      }
    }

    setShowSuccess(true);
  };

  const handleNewOrder = () => {
    setShowSuccess(false);
    setCart([]);
    setRestaurantCart([]);
    setLunchCart([]);
    setSelectedRestaurant("");
    setSelectedLunchRestaurant("");
    setForm({ name: "", department: "", phone: "", restaurantName: "" });
    setFormErrors({});
    setShowOrderPanel(false);
  };

  const currentYear = new Date().getFullYear();

  // Build CartItem-compatible list for success overlay
  const allCartItemsForSuccess: CartItem[] = [
    ...cart,
    ...restaurantCart.map((ci) => ({
      item: {
        id: ci.item.id,
        name: ci.item.name,
        description: "",
        price: ci.item.price,
        category: "breakfast" as const,
        image: "",
      },
      quantity: ci.quantity,
    })),
    ...lunchCart.map((ci) => ({
      item: {
        id: ci.item.id,
        name: ci.item.name,
        description: "",
        price: ci.item.price,
        category: "lunch" as const,
        image: "",
      },
      quantity: ci.quantity,
    })),
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg text-foreground leading-none tracking-tight">
                Bonkers Bites
              </span>
              <span className="text-[10px] text-muted-foreground italic tracking-wide leading-none mt-0.5">
                Fresh food, delivered at Bonkers 🚀
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="lg:hidden relative p-2 rounded-xl bg-muted hover:bg-secondary hover:scale-105 active:scale-95 transition-all duration-150"
              onClick={() => setShowOrderPanel((v) => !v)}
              data-ocid="order.open_modal_button"
            >
              <ShoppingCart className="w-5 h-5 text-foreground" />
              {cartTotalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 min-w-[18px] min-h-[18px] bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {cartTotalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero — richer visual with floating food accents */}
      <section
        className="relative overflow-hidden bg-primary text-primary-foreground"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.16 258) 0%, oklch(0.32 0.14 258) 60%, oklch(0.35 0.13 275) 100%)",
        }}
      >
        {/* Decorative background circles */}
        <div
          className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-10"
          style={{ background: "oklch(0.68 0.21 42)" }}
        />
        <div
          className="absolute top-4 right-20 w-24 h-24 rounded-full opacity-5"
          style={{ background: "oklch(0.68 0.21 42)" }}
        />
        <div
          className="absolute -bottom-4 left-1/3 w-32 h-32 rounded-full opacity-8"
          style={{ background: "oklch(0.5 0.18 280)" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10 relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight"
              >
                Fresh food,
                <br />
                <span style={{ color: "oklch(0.80 0.18 42)" }}>
                  delivered to your desk.
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="mt-3 text-sm text-primary-foreground/70 max-w-xs"
              >
                Browse our daily menu, place your order, and enjoy a hot meal at
                your workspace.
              </motion.p>
              {/* Quick stats */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex items-center gap-4 mt-5"
              >
                <div className="flex items-center gap-1.5 text-xs text-primary-foreground/80">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: "oklch(0.72 0.19 140)" }}
                  />
                  4 Restaurants
                </div>
                <div className="flex items-center gap-1.5 text-xs text-primary-foreground/80">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: "oklch(0.80 0.18 42)" }}
                  />
                  Daily Fresh Menu
                </div>
                <div className="flex items-center gap-1.5 text-xs text-primary-foreground/80">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: "oklch(0.68 0.18 230)" }}
                  />
                  UPI Payments
                </div>
              </motion.div>
            </div>

            {/* Floating food emojis - decorative */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="hidden sm:flex flex-col gap-3 items-end shrink-0 select-none"
              aria-hidden="true"
            >
              <div className="flex gap-3">
                <span
                  className="text-3xl food-float"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
                >
                  🍛
                </span>
                <span
                  className="text-3xl food-float food-float-delay-1"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
                >
                  🫓
                </span>
              </div>
              <div className="flex gap-3">
                <span
                  className="text-3xl food-float food-float-delay-2"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
                >
                  🍲
                </span>
                <span
                  className="text-3xl food-float food-float-delay-3"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
                >
                  🥗
                </span>
              </div>
              <div className="flex gap-3">
                <span
                  className="text-3xl food-float food-float-delay-4"
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
                >
                  🧃
                </span>
                <span
                  className="text-3xl food-float"
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                    animationDelay: "2.5s",
                  }}
                >
                  ☕
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Menu Column */}
          <div className="flex-1 min-w-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Category Tabs */}
              <div
                className="flex border-b border-border mb-6"
                data-ocid="menu.tab"
              >
                {CATEGORIES.map((cat) => {
                  const isActive = activeTab === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setActiveTab(cat.key)}
                      data-ocid={`menu.${cat.key}.tab`}
                      className={[
                        "relative px-5 py-3 text-sm font-medium transition-all duration-200 focus:outline-none whitespace-nowrap rounded-t-lg",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                      ].join(" ")}
                    >
                      {cat.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Breakfast Tab — restaurant-based ordering */}
              <TabsContent value="breakfast" className="mt-0">
                {/* Restaurant selector */}
                <div className="mb-5">
                  <label
                    htmlFor="restaurant-select"
                    className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"
                  >
                    Select Restaurant
                  </label>
                  <div className="relative w-full sm:w-80">
                    <select
                      id="restaurant-select"
                      value={selectedRestaurant}
                      onChange={(e) => handleRestaurantChange(e.target.value)}
                      className="w-full appearance-none bg-card border-2 border-border rounded-xl px-4 py-3 pr-10 text-sm font-medium text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none hover:border-primary/60 transition-all duration-200 cursor-pointer"
                      data-ocid="breakfast.restaurant.select"
                    >
                      <option value="">— Select a restaurant —</option>
                      {RESTAURANTS.map((r) => (
                        <option key={r} value={r}>
                          {getRestaurantLabel(r)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {!selectedRestaurant ? (
                  <div
                    className="flex flex-col items-center justify-center py-16 text-center"
                    data-ocid="breakfast.restaurant.empty_state"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
                      <ChefHat className="w-8 h-8 text-primary/50" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      Please select a restaurant to view the menu
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Choose from Ruchi Cafe, Anna Cafe, Local Shop, or Babu's
                      Classic
                    </p>
                  </div>
                ) : (
                  <motion.div
                    key={selectedRestaurant}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <h2 className="text-base font-bold text-foreground">
                        {getRestaurantLabel(selectedRestaurant)}
                      </h2>
                      <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
                        {restaurantMenus[selectedRestaurant]?.length} items
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                      {(restaurantMenus[selectedRestaurant] ?? []).map(
                        (item, idx) => {
                          const cartItem = getRestaurantCartItem(item.id);
                          const emoji = getMenuItemEmoji(item.name);
                          return (
                            <div
                              key={item.id}
                              className="group bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-accent/30 transition-[transform,box-shadow,border-color] duration-300 cursor-pointer"
                              data-ocid={`breakfast.item.${idx + 1}`}
                            >
                              {/* Emoji image area — richer gradient */}
                              <div className="h-28 menu-card-header flex items-center justify-center relative overflow-hidden">
                                <span
                                  className="text-4xl group-hover:scale-110 transition-transform duration-300 ease-out select-none"
                                  style={{
                                    filter:
                                      "drop-shadow(0 2px 8px rgba(0,0,0,0.12))",
                                  }}
                                >
                                  {emoji}
                                </span>
                              </div>
                              <div className="p-3 pt-2.5">
                                <p className="font-semibold text-sm text-foreground leading-tight mb-1.5 line-clamp-2">
                                  {item.name}
                                </p>
                                <p className="text-accent font-bold text-sm mb-2.5">
                                  ₹{item.price}
                                </p>
                                {cartItem ? (
                                  <div className="flex items-center justify-between bg-muted rounded-xl px-1 py-0.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRestaurantQtyChange(item.id, -1)
                                      }
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground hover:bg-card active:scale-95 transition-all duration-150 text-base font-bold"
                                      data-ocid={`breakfast.item.${idx + 1}.secondary_button`}
                                    >
                                      −
                                    </button>
                                    <span className="text-sm font-bold text-foreground w-6 text-center">
                                      {cartItem.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRestaurantAdd(item.id)
                                      }
                                      className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center text-base font-bold hover:brightness-110 active:scale-95 transition-all duration-150"
                                      data-ocid={`breakfast.item.${idx + 1}.primary_button`}
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleRestaurantAdd(item.id)}
                                    className="w-full py-2 rounded-xl bg-accent text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all duration-150 shadow-sm"
                                    data-ocid={`breakfast.item.${idx + 1}.primary_button`}
                                  >
                                    Add to Cart
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </motion.div>
                )}
              </TabsContent>

              {/* Lunch Tab — restaurant-based ordering */}
              <TabsContent value="lunch" className="mt-0">
                <div className="mb-5">
                  <label
                    htmlFor="lunch-restaurant-select"
                    className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"
                  >
                    Select Restaurant
                  </label>
                  <div className="relative w-full sm:w-80">
                    <select
                      id="lunch-restaurant-select"
                      value={selectedLunchRestaurant}
                      onChange={(e) =>
                        handleLunchRestaurantChange(e.target.value)
                      }
                      className="w-full appearance-none bg-card border-2 border-border rounded-xl px-4 py-3 pr-10 text-sm font-medium text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none hover:border-primary/60 transition-all duration-200 cursor-pointer"
                      data-ocid="lunch.restaurant.select"
                    >
                      <option value="">— Select a restaurant —</option>
                      {LUNCH_RESTAURANTS.map((r) => (
                        <option key={r} value={r}>
                          {getRestaurantLabel(r)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {!selectedLunchRestaurant ? (
                  <div
                    className="flex flex-col items-center justify-center py-16 text-center"
                    data-ocid="lunch.restaurant.empty_state"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
                      <ChefHat className="w-8 h-8 text-primary/50" />
                    </div>
                    <p className="text-sm font-semibold text-foreground mb-1">
                      Please select a restaurant to view the lunch menu
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Currently available: Ruchi Cafe, Anna Cafe
                    </p>
                  </div>
                ) : (
                  <motion.div
                    key={selectedLunchRestaurant}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <h2 className="text-base font-bold text-foreground">
                        {getRestaurantLabel(selectedLunchRestaurant)}
                      </h2>
                      <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-semibold">
                        {lunchMenus[selectedLunchRestaurant]?.length} items
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                      {(lunchMenus[selectedLunchRestaurant] ?? []).map(
                        (item, idx) => {
                          const cartItem = getLunchCartItem(item.id);
                          const emoji = getMenuItemEmoji(item.name);
                          return (
                            <div
                              key={item.id}
                              className="group bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-accent/30 transition-[transform,box-shadow,border-color] duration-300 cursor-pointer"
                              data-ocid={`lunch.item.${idx + 1}`}
                            >
                              {/* Emoji image area — richer gradient */}
                              <div className="h-28 menu-card-header flex items-center justify-center relative overflow-hidden">
                                <span
                                  className="text-4xl group-hover:scale-110 transition-transform duration-300 ease-out select-none"
                                  style={{
                                    filter:
                                      "drop-shadow(0 2px 8px rgba(0,0,0,0.12))",
                                  }}
                                >
                                  {emoji}
                                </span>
                              </div>
                              <div className="p-3 pt-2.5">
                                <p className="font-semibold text-sm text-foreground leading-tight mb-1.5 line-clamp-2">
                                  {item.name}
                                </p>
                                <p className="text-accent font-bold text-sm mb-2.5">
                                  ₹{item.price}
                                </p>
                                {cartItem ? (
                                  <div className="flex items-center justify-between bg-muted rounded-xl px-1 py-0.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleLunchQtyChange(item.id, -1)
                                      }
                                      className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground hover:bg-card active:scale-95 transition-all duration-150 text-base font-bold"
                                      data-ocid={`lunch.item.${idx + 1}.secondary_button`}
                                    >
                                      −
                                    </button>
                                    <span className="text-sm font-bold text-foreground w-6 text-center">
                                      {cartItem.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleLunchAdd(item.id)}
                                      className="w-7 h-7 rounded-lg bg-accent text-white flex items-center justify-center text-base font-bold hover:brightness-110 active:scale-95 transition-all duration-150"
                                      data-ocid={`lunch.item.${idx + 1}.primary_button`}
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleLunchAdd(item.id)}
                                    className="w-full py-2 rounded-xl bg-accent text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all duration-150 shadow-sm"
                                    data-ocid={`lunch.item.${idx + 1}.primary_button`}
                                  >
                                    Add to Cart
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </motion.div>
                )}
              </TabsContent>

              {/* Snacks tab */}
              <TabsContent key="snacks" value="snacks" className="mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {menuItems
                    .filter((item) => item.category === "snacks")
                    .map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        cartItem={getCartItem(item.id)}
                        onToggle={handleToggle}
                        onQtyChange={handleQtyChange}
                      />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-20">
              <OrderSidebar
                cartItems={cart}
                restaurantCartItems={[...restaurantCart, ...lunchCart]}
                selectedRestaurant={
                  selectedRestaurant || selectedLunchRestaurant
                }
                form={form}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                formErrors={formErrors}
                submitted={false}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Order Panel Backdrop */}
      <AnimatePresence>
        {showOrderPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setShowOrderPanel(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Order Panel */}
      <AnimatePresence>
        {showOrderPanel && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl border-t border-border shadow-xl max-h-[85vh] overflow-y-auto p-4 lg:hidden"
            data-ocid="order.sheet"
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
            <OrderSidebar
              cartItems={cart}
              restaurantCartItems={[...restaurantCart, ...lunchCart]}
              selectedRestaurant={selectedRestaurant || selectedLunchRestaurant}
              form={form}
              onFormChange={handleFormChange}
              onSubmit={handleSubmit}
              formErrors={formErrors}
              submitted={false}
              onBack={() => setShowOrderPanel(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Sticky Bottom Bar */}
      {cartTotalItems > 0 && !showOrderPanel && (
        <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-sm font-semibold">
              {cartTotalItems} item{cartTotalItems > 1 ? "s" : ""} selected
            </span>
            <span className="text-xs text-primary-foreground/80 ml-2">
              ₹{cartTotal}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowOrderPanel(true)}
            className="px-4 py-2 bg-accent text-accent-foreground text-sm font-semibold rounded-xl hover:brightness-110 active:scale-[0.98] transition-all duration-150"
            data-ocid="order.open_modal_button"
          >
            View Order
          </button>
        </div>
      )}

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <SuccessOverlay
            form={form}
            cartItems={allCartItemsForSuccess}
            total={cartTotal}
            onClose={handleNewOrder}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center">
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
