import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ChefHat, ShoppingCart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AdminDashboard } from "./components/AdminDashboard";
import { MenuItemCard } from "./components/MenuItemCard";
import { OrderSidebar } from "./components/OrderSidebar";
import { SuccessOverlay } from "./components/SuccessOverlay";
import { menuItems } from "./data/menuData";
import { useActor } from "./hooks/useActor";
import type { CartItem, MenuItem, OrderForm } from "./types";

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
  const [activeTab, setActiveTab] = useState<string>("breakfast");
  const [form, setForm] = useState<OrderForm>({
    name: "",
    department: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<OrderForm>>({});
  const [showOrderPanel, setShowOrderPanel] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { actor } = useActor();

  const cartTotalItems = cart.reduce((sum, ci) => sum + ci.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, ci) => sum + ci.item.price * ci.quantity,
    0,
  );

  const getCartItem = (itemId: string) =>
    cart.find((ci) => ci.item.id === itemId);

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

    if (cart.length === 0) {
      alert("Please add at least one item to your order.");
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (actor) {
      try {
        await actor.placeOrder(
          form.name,
          form.department,
          form.phone,
          cart.map((ci) => ({
            itemName: ci.item.name,
            quantity: BigInt(ci.quantity),
            price: BigInt(ci.item.price),
          })),
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
    setForm({ name: "", department: "", phone: "" });
    setFormErrors({});
    setShowOrderPanel(false);
  };

  const currentYear = new Date().getFullYear();

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

              {CATEGORIES.map((cat) => (
                <TabsContent key={cat.key} value={cat.key} className="mt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {menuItems
                      .filter((item) => item.category === cat.key)
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
            cartItems={cart}
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
