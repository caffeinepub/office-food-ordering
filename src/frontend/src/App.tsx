import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ChefHat, ShoppingCart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AdminDashboard } from "./components/AdminDashboard";
import { MenuItemCard } from "./components/MenuItemCard";
import { OrderSidebar } from "./components/OrderSidebar";
import { SuccessOverlay } from "./components/SuccessOverlay";
import { RESTAURANTS, menuItems, restaurantMenus } from "./data/menuData";
import { useActor } from "./hooks/useActor";
import type {
  CartItem,
  MenuItem,
  OrderForm,
  RestaurantCartItem,
} from "./types";

const CATEGORIES = [
  { key: "breakfast", label: "Breakfast" },
  { key: "lunch", label: "Lunch" },
  { key: "snacks", label: "Snacks" },
] as const;

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
  const [activeTab, setActiveTab] = useState<string>("breakfast");
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
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
  const cartTotalItems =
    cart.reduce((sum, ci) => sum + ci.quantity, 0) +
    restaurantCart.reduce((sum, ci) => sum + ci.quantity, 0);
  const cartTotal = regularCartTotal + restaurantCartTotal;

  const getCartItem = (itemId: string) =>
    cart.find((ci) => ci.item.id === itemId);
  const getRestaurantCartItem = (itemId: string) =>
    restaurantCart.find((ci) => ci.item.id === itemId);

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

  const handleRestaurantChange = (restaurant: string) => {
    setSelectedRestaurant(restaurant);
    setRestaurantCart([]);
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

    const restaurantName = selectedRestaurant || "General";

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
    setSelectedRestaurant("");
    setForm({ name: "", department: "", phone: "", restaurantName: "" });
    setFormErrors({});
    setShowOrderPanel(false);
  };

  const currentYear = new Date().getFullYear();

  // Build CartItem-compatible list for success overlay (restaurant items)
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
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-lg text-foreground leading-none">
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
              className="lg:hidden relative p-2 rounded-lg bg-muted"
              onClick={() => setShowOrderPanel((v) => !v)}
              data-ocid="order.open_modal_button"
            >
              <ShoppingCart className="w-5 h-5 text-foreground" />
              {cartTotalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartTotalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight"
          >
            Fresh food,
            <br />
            delivered to your desk.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-2 text-sm text-primary-foreground/80 max-w-sm"
          >
            Browse our daily menu, place your order, and enjoy a hot meal at
            your workspace.
          </motion.p>
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
                        "relative px-5 py-3 text-sm font-medium transition-colors duration-150 focus:outline-none whitespace-nowrap",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground",
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
                  <select
                    id="restaurant-select"
                    value={selectedRestaurant}
                    onChange={(e) => handleRestaurantChange(e.target.value)}
                    className="w-full sm:w-72 px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                    data-ocid="breakfast.restaurant.select"
                  >
                    <option value="">-- Select a restaurant --</option>
                    {RESTAURANTS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {!selectedRestaurant ? (
                  <div
                    className="flex flex-col items-center justify-center py-16 text-center"
                    data-ocid="breakfast.restaurant.empty_state"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                      <ChefHat className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Please select a restaurant to view the menu
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Choose from Ruchi Cafe, Anna Cafe, or Local Shop
                    </p>
                  </div>
                ) : (
                  <motion.div
                    key={selectedRestaurant}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-base font-bold text-foreground">
                        {selectedRestaurant}
                      </h2>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {restaurantMenus[selectedRestaurant]?.length} items
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(restaurantMenus[selectedRestaurant] ?? []).map(
                        (item, idx) => {
                          const cartItem = getRestaurantCartItem(item.id);
                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3 hover:border-primary/30 transition-colors"
                              data-ocid={`breakfast.item.${idx + 1}`}
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-primary font-semibold mt-0.5">
                                  ₹{item.price}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 ml-3 shrink-0">
                                {cartItem ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRestaurantQtyChange(item.id, -1)
                                      }
                                      className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors text-sm font-bold"
                                      data-ocid={`breakfast.item.${idx + 1}.secondary_button`}
                                    >
                                      −
                                    </button>
                                    <span className="text-sm font-semibold text-foreground w-5 text-center">
                                      {cartItem.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRestaurantAdd(item.id)
                                      }
                                      className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold hover:opacity-90 transition-opacity"
                                      data-ocid={`breakfast.item.${idx + 1}.primary_button`}
                                    >
                                      +
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleRestaurantAdd(item.id)}
                                    className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                                    data-ocid={`breakfast.item.${idx + 1}.primary_button`}
                                  >
                                    Add
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

              {/* Lunch & Snacks tabs — existing behavior */}
              {(["lunch", "snacks"] as const).map((cat) => (
                <TabsContent key={cat} value={cat} className="mt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {menuItems
                      .filter((item) => item.category === cat)
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
              ))}
            </Tabs>
          </div>

          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-20">
              <OrderSidebar
                cartItems={cart}
                restaurantCartItems={restaurantCart}
                selectedRestaurant={selectedRestaurant}
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
              restaurantCartItems={restaurantCart}
              selectedRestaurant={selectedRestaurant}
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
            className="px-4 py-2 bg-accent text-accent-foreground text-sm font-semibold rounded-lg"
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
