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

// Exact name → unique image mapping for every menu item
const ITEM_IMAGE_MAP: Record<string, string> = {
  // ── Idli variants ──
  Idli: "/assets/generated/plain-idli.dim_400x300.jpg",
  "Idli (2 pcs)": "/assets/generated/plain-idli.dim_400x300.jpg",
  "Steam Idli": "/assets/generated/idli.dim_400x300.jpg",
  "Butter Idli": "/assets/generated/butter-idli.dim_400x300.jpg",
  "Masala Idli": "/assets/generated/masala-idli.dim_400x300.jpg",
  "Rasam Idli": "/assets/generated/rasam-idli.dim_400x300.jpg",
  "Idli Vada": "/assets/generated/idli-vada.dim_400x300.jpg",
  "Idli Sambar": "/assets/generated/idli-sambar.dim_400x300.jpg",

  // ── Vada variants ──
  "Medu Vada": "/assets/generated/medu-vada.dim_400x300.jpg",
  "Medu Vada (2 pcs)": "/assets/generated/medu-vada.dim_400x300.jpg",
  "Masala Vada": "/assets/generated/masala-vada.dim_400x300.jpg",
  "Rasam Wada": "/assets/generated/rasam-wada.dim_400x300.jpg",
  "Sabudana Vada": "/assets/generated/sabudana-vada.dim_400x300.jpg",
  "Batata Vada Usal": "/assets/generated/batata-vada-usal.dim_400x300.jpg",
  "Wada Pav": "/assets/generated/wada-pav.dim_400x300.jpg",
  "Vada Pav": "/assets/generated/vada-pav.dim_400x300.jpg",

  // ── Poha / Upma / Sheera ──
  Poha: "/assets/generated/poha.dim_400x300.jpg",
  "Kanda Poha": "/assets/generated/kanda-poha.dim_400x300.jpg",
  Upma: "/assets/generated/upma.dim_400x300.jpg",
  Sheera: "/assets/generated/sheera.dim_400x300.jpg",
  "Sheera Upma Mix": "/assets/generated/sheera-upma-mix.dim_400x300.jpg",
  "Sabudana Khichdi": "/assets/generated/sabudana-khichdi.dim_400x300.jpg",
  "Sabudana Khichadi": "/assets/generated/sabudana-khichdi.dim_400x300.jpg",

  // ── Puri / Pav ──
  "Puri Bhaji": "/assets/generated/puri-bhaji.dim_400x300.jpg",
  "Misal Pav": "/assets/generated/misal-pav.dim_400x300.jpg",
  "Usal Pav": "/assets/generated/usal-pav.dim_400x300.jpg",
  "Pav Bhaji": "/assets/generated/pav-bhaji.dim_400x300.jpg",
  "Masala Pav": "/assets/generated/masala-pav.dim_400x300.jpg",
  "Cheese Pav Bhaji": "/assets/generated/cheese-pav-bhaji.dim_400x300.jpg",
  "Bhaji Pav": "/assets/generated/bhaji-pav.dim_400x300.jpg",

  // ── Dosa variants ──
  "Sada Dosa": "/assets/generated/sada-dosa.dim_400x300.jpg",
  "Mysore Sada Dosa": "/assets/generated/mysore-sada-dosa.dim_400x300.jpg",
  "Masala Dosa": "/assets/generated/masala-dosa.dim_400x300.jpg",
  "Mysore Masala Dosa": "/assets/generated/mysore-masala-dosa.dim_400x300.jpg",
  "Rava Sada Dosa": "/assets/generated/rava-sada-dosa.dim_400x300.jpg",
  "Onion Rava Sada": "/assets/generated/onion-rava-sada-dosa.dim_400x300.jpg",
  "Rava Masala Dosa": "/assets/generated/rava-masala-dosa.dim_400x300.jpg",
  "Ragi Rava Masala": "/assets/generated/ragi-rava-masala-dosa.dim_400x300.jpg",
  "Butter Sada Dosa": "/assets/generated/butter-sada-dosa.dim_400x300.jpg",
  "Cheese Sada Dosa": "/assets/generated/cheese-sada-dosa.dim_400x300.jpg",
  "Onion Sada Dosa": "/assets/generated/onion-sada-dosa.dim_400x300.jpg",
  "Butter Masala Dosa": "/assets/generated/butter-masala-dosa.dim_400x300.jpg",
  "Mysore Rava Masala Dosa":
    "/assets/generated/mysore-rava-masala-dosa.dim_400x300.jpg",
  "Schezwan Sada Dosa": "/assets/generated/schezwan-sada-dosa.dim_400x300.jpg",

  // ── Uttapam / Uthappa variants ──
  "Sada Uttapam": "/assets/generated/sada-uttapam.dim_400x300.jpg",
  "Sada Uthappa": "/assets/generated/sada-uttapam.dim_400x300.jpg",
  "Sada Uttappa (2 pcs)": "/assets/generated/sada-uttapam.dim_400x300.jpg",
  "Onion Uttapam": "/assets/generated/onion-uttapam.dim_400x300.jpg",
  "Onion Uthappa": "/assets/generated/onion-uttapam.dim_400x300.jpg",
  "Onion Uttappa": "/assets/generated/onion-uttapam.dim_400x300.jpg",
  "Masala Uttapam": "/assets/generated/masala-uttapam.dim_400x300.jpg",
  "Masala Uthappa": "/assets/generated/masala-uttapam.dim_400x300.jpg",
  "Masala Uttappa": "/assets/generated/masala-uttapam.dim_400x300.jpg",
  "Cheese Uttapam": "/assets/generated/cheese-uttapam.dim_400x300.jpg",
  "Cheese Uttappa": "/assets/generated/cheese-uttapam.dim_400x300.jpg",
  "Veg Uttapam": "/assets/generated/veg-uttapam.dim_400x300.jpg",
  "Veg Uttappa": "/assets/generated/veg-uttapam.dim_400x300.jpg",
  "Vegetable Uthappa": "/assets/generated/vegetable-uttapam.dim_400x300.jpg",
  "Butter Onion Uthappa":
    "/assets/generated/butter-onion-uttapam.dim_400x300.jpg",
  "Butter Masala Uthappa":
    "/assets/generated/butter-masala-uttapam.dim_400x300.jpg",
  "Mysore Sada Uthappa":
    "/assets/generated/mysore-sada-uttapam.dim_400x300.jpg",

  // ── Biryani variants ──
  "Paneer Biryani": "/assets/generated/paneer-biryani.dim_400x300.jpg",
  "Veg Biryani": "/assets/generated/veg-biryani.dim_400x300.jpg",
  "Soya Bean Biryani": "/assets/generated/soya-biryani.dim_400x300.jpg",
  "Soya Biryani": "/assets/generated/soya-biryani.dim_400x300.jpg",
  "Mushroom Biryani": "/assets/generated/mushroom-biryani.dim_400x300.jpg",

  // ── Pulav variants ──
  "Veg Pulav": "/assets/generated/veg-pulav.dim_400x300.jpg",
  "Paneer Pulav": "/assets/generated/paneer-pulav.dim_400x300.jpg",

  // ── Rice dishes ──
  "Mini Thali": "/assets/generated/mini-thali.dim_400x300.jpg",
  "Veg Thali": "/assets/generated/veg-thali.dim_400x300.jpg",
  "Dal Rice": "/assets/generated/dal-rice.dim_400x300.jpg",
  "Sambar Rice": "/assets/generated/sambar-rice.dim_400x300.jpg",
  "Lemon Rice": "/assets/generated/lemon-rice.dim_400x300.jpg",
  "Curd Rice": "/assets/generated/curd-rice.dim_400x300.jpg",
  "Masala Rice": "/assets/generated/masala-rice.dim_400x300.jpg",
  "Chapati Bhaji": "/assets/generated/chapati-bhaji.dim_400x300.jpg",
  "Dal Khichdi": "/assets/generated/dal-khichdi.dim_400x300.jpg",
  "Dal Khichadi": "/assets/generated/dal-khichdi.dim_400x300.jpg",
  "Dal Khichdi Tadka": "/assets/generated/dal-khichdi-tadka.dim_400x300.jpg",
  "Rasam Rice": "/assets/generated/rasam-rice.dim_400x300.jpg",

  // ── Fried Rice variants ──
  "Veg Fried Rice": "/assets/generated/veg-fried-rice.dim_400x300.jpg",
  "Schezwan Fried Rice":
    "/assets/generated/schezwan-fried-rice.dim_400x300.jpg",
  "Hong Kong Fried Rice":
    "/assets/generated/hong-kong-fried-rice.dim_400x300.jpg",
  "Paneer Fried Rice": "/assets/generated/paneer-fried-rice.dim_400x300.jpg",
  "Veg Manchurian Fried Rice":
    "/assets/generated/veg-manchurian-fried-rice.dim_400x300.jpg",

  // ── Noodles variants ──
  "Veg Hakka Noodles": "/assets/generated/veg-hakka-noodles.dim_400x300.jpg",
  "Veg Schezwan Noodles":
    "/assets/generated/veg-schezwan-noodles.dim_400x300.jpg",
  "Hong Kong Noodles": "/assets/generated/hong-kong-noodles.dim_400x300.jpg",
  "Triple Schezwan Noodles":
    "/assets/generated/triple-schezwan-noodles.dim_400x300.jpg",

  // ── Drinks / Lassi ──
  "Sweet Lassi": "/assets/generated/sweet-lassi.dim_400x300.jpg",
  "Salted Lassi": "/assets/generated/salted-lassi.dim_400x300.jpg",
  "Mango Lassi": "/assets/generated/mango-lassi.dim_400x300.jpg",
  Buttermilk: "/assets/generated/buttermilk.dim_400x300.jpg",
  "Fresh Lime Water": "/assets/generated/fresh-lime-water.dim_400x300.jpg",
  "Fresh Lime Soda": "/assets/generated/fresh-lime-soda.dim_400x300.jpg",
  "Ginger Lemon": "/assets/generated/ginger-lemon.dim_400x300.jpg",

  // ── Juices ──
  "Sugarcane Juice": "/assets/generated/sugarcane-juice.dim_400x300.jpg",
  "Beetroot Juice": "/assets/generated/beetroot-juice.dim_400x300.jpg",
  "Carrot Juice": "/assets/generated/carrot-juice.dim_400x300.jpg",
  "Mosambi Juice": "/assets/generated/mosambi-juice.dim_400x300.jpg",
  "Watermelon Juice": "/assets/generated/watermelon-juice.dim_400x300.jpg",
  "Pineapple Juice": "/assets/generated/pineapple-juice.dim_400x300.jpg",

  // ── Maggi ──
  "Plain Masala Maggi": "/assets/generated/plain-masala-maggi.dim_400x300.jpg",
  "Paneer Maggi": "/assets/generated/paneer-maggi.dim_400x300.jpg",

  // ── Sandwiches (Babu's Classic) ──
  "Veg Sandwich": "/assets/generated/veg-sandwich-plain.dim_400x300.jpg",
  Sandwich: "/assets/generated/veg-sandwich.dim_400x300.jpg",
  "Masala Toast Sandwich":
    "/assets/generated/masala-toast-sandwich.dim_400x300.jpg",
  "Bread Butter Toast": "/assets/generated/bread-butter-toast.dim_400x300.jpg",
  "Veg Three Slice Sandwich":
    "/assets/generated/veg-three-slice-sandwich.dim_400x300.jpg",
  "Veg Cheese Sandwich":
    "/assets/generated/veg-cheese-sandwich.dim_400x300.jpg",
  "Veg Grill Sandwich": "/assets/generated/veg-grill-sandwich.dim_400x300.jpg",
  "Paneer Cheese Grill Sandwich":
    "/assets/generated/paneer-cheese-grill-sandwich.dim_400x300.jpg",
  "Samosa Veg Sandwich":
    "/assets/generated/samosa-veg-sandwich.dim_400x300.jpg",
  "Samosa Toast Sandwich":
    "/assets/generated/samosa-toast-sandwich.dim_400x300.jpg",

  // ── Pizzas ──
  "Veg Cheese Pizza": "/assets/generated/veg-cheese-pizza.dim_400x300.jpg",
  "Veg Masala Pizza": "/assets/generated/veg-masala-pizza.dim_400x300.jpg",
  "Chilly Corn Pizza": "/assets/generated/chilly-corn-pizza.dim_400x300.jpg",
  "Mushroom Pizza": "/assets/generated/mushroom-pizza.dim_400x300.jpg",
  "Veg Paneer Pizza": "/assets/generated/veg-paneer-pizza.dim_400x300.jpg",

  // ── Burgers ──
  "Veg Burger": "/assets/generated/veg-burger.dim_400x300.jpg",
  "Veg Cheese Burger": "/assets/generated/veg-cheese-burger.dim_400x300.jpg",
  "Schezwan Cheese Burger":
    "/assets/generated/schezwan-cheese-burger.dim_400x300.jpg",

  // ── Other ──
  Samosa: "/assets/generated/samosa.dim_400x300.jpg",
  Patty: "/assets/generated/veg-burger.dim_400x300.jpg",
};

function getMenuItemImage(name: string): string {
  // Exact match first
  if (ITEM_IMAGE_MAP[name]) return ITEM_IMAGE_MAP[name];

  // Fallback: keyword matching for any unlisted items
  const lower = name.toLowerCase();
  if (lower.includes("idli")) return "/assets/generated/idli.dim_400x300.jpg";
  if (lower.includes("dosa")) return "/assets/generated/dosa.dim_400x300.jpg";
  if (lower.includes("uttap") || lower.includes("uthap"))
    return "/assets/generated/uttapam.dim_400x300.jpg";
  if (lower.includes("vada") || lower.includes("wada"))
    return "/assets/generated/medu-vada.dim_400x300.jpg";
  if (lower.includes("biryani"))
    return "/assets/generated/veg-biryani.dim_400x300.jpg";
  if (lower.includes("pulav") || lower.includes("pulao"))
    return "/assets/generated/veg-pulav.dim_400x300.jpg";
  if (lower.includes("fried rice"))
    return "/assets/generated/veg-fried-rice.dim_400x300.jpg";
  if (lower.includes("noodle"))
    return "/assets/generated/veg-noodles.dim_400x300.jpg";
  if (lower.includes("thali"))
    return "/assets/generated/veg-thali.dim_400x300.jpg";
  if (lower.includes("lassi")) return "/assets/generated/lassi.dim_400x300.jpg";
  if (lower.includes("juice")) return "/assets/generated/juice.dim_400x300.jpg";
  if (lower.includes("pizza"))
    return "/assets/generated/veg-pizza.dim_400x300.jpg";
  if (lower.includes("burger"))
    return "/assets/generated/veg-burger.dim_400x300.jpg";
  if (lower.includes("sandwich") || lower.includes("toast"))
    return "/assets/generated/veg-sandwich.dim_400x300.jpg";
  if (lower.includes("maggi")) return "/assets/generated/maggi.dim_400x300.jpg";
  if (lower.includes("samosa"))
    return "/assets/generated/samosa.dim_400x300.jpg";
  if (lower.includes("poha")) return "/assets/generated/poha.dim_400x300.jpg";
  if (lower.includes("upma")) return "/assets/generated/upma.dim_400x300.jpg";
  if (lower.includes("sheera"))
    return "/assets/generated/sheera.dim_400x300.jpg";
  if (lower.includes("rice"))
    return "/assets/generated/sambar-rice.dim_400x300.jpg";
  if (lower.includes("pav"))
    return "/assets/generated/pav-bhaji.dim_400x300.jpg";
  return "/assets/generated/veg-thali.dim_400x300.jpg";
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-xl text-foreground leading-none tracking-tight">
                Bonkers Bites
              </span>
              <span className="text-[10px] text-muted-foreground/90 italic tracking-wide leading-none mt-0.5">
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

      {/* Hero — food-focused with image background */}
      <section
        className="relative overflow-hidden min-h-[420px] flex items-center"
        style={{
          backgroundImage:
            'url("/assets/generated/hero-food-bg.dim_1400x600.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.15 0.16 258 / 0.92) 0%, oklch(0.25 0.14 258 / 0.85) 100%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 w-full">
          <div className="flex items-center justify-between gap-8">
            {/* Left column — text content */}
            <div className="flex-1 max-w-xl">
              {/* Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white"
              >
                Fresh food{" "}
                <span style={{ color: "oklch(0.80 0.18 42)" }}>delivered</span>
                <br />
                to your desk
              </motion.h1>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="mt-4 text-base text-white/70 max-w-md leading-relaxed"
              >
                Order breakfast, lunch &amp; snacks from multiple restaurants —
                fresh to your desk every day.
              </motion.p>
            </div>
            {/* Right column — floating food emoji cards (hidden on mobile) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden md:grid grid-cols-2 gap-4 shrink-0 select-none"
              aria-hidden="true"
            >
              {[
                { emoji: "🍛", delay: "0s" },
                { emoji: "🥗", delay: "0.6s" },
                { emoji: "🌮", delay: "1.2s" },
                { emoji: "🍱", delay: "1.8s" },
              ].map(({ emoji, delay }) => (
                <div
                  key={emoji}
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl food-float"
                  style={{
                    background: "rgba(255,255,255,0.10)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                    animationDelay: delay,
                  }}
                >
                  {emoji}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main
        id="menu-section"
        className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8"
      >
        <div className="flex flex-col lg:flex-row gap-8">
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
                        "relative px-6 py-3.5 text-sm font-medium transition-all duration-200 focus:outline-none whitespace-nowrap rounded-t-lg",
                        isActive
                          ? "text-primary font-semibold bg-primary/5 rounded-t-xl"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                      ].join(" ")}
                    >
                      {cat.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-t-full" />
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
                      className="w-full appearance-none bg-card border-2 border-border rounded-xl px-4 py-3.5 pr-10 text-sm font-medium text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none hover:border-primary/60 transition-all duration-200 cursor-pointer"
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
                      Choose from Ruchi Cafe, Anna Cafe, Local Shop, or
                      Babu&apos;s Classic
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
                          return (
                            <div
                              key={item.id}
                              className="group bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-accent/30 transition-[transform,box-shadow,border-color] duration-300 cursor-pointer"
                              data-ocid={`breakfast.item.${idx + 1}`}
                            >
                              {/* Real food image */}
                              <div className="relative h-32 overflow-hidden bg-muted">
                                <img
                                  src={getMenuItemImage(item.name)}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ease-out"
                                />
                              </div>
                              <div className="p-4">
                                <p className="font-display font-semibold text-sm text-foreground leading-tight mb-1.5 line-clamp-2">
                                  {item.name}
                                </p>
                                <p className="text-accent font-bold text-base mb-2.5">
                                  ₹{item.price}
                                </p>
                                {cartItem ? (
                                  <div className="flex items-center justify-between bg-muted rounded-full px-1 py-0.5">
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
                                    className="w-full py-2.5 rounded-full bg-accent text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all duration-150 shadow-sm"
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
                      className="w-full appearance-none bg-card border-2 border-border rounded-xl px-4 py-3.5 pr-10 text-sm font-medium text-foreground shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none hover:border-primary/60 transition-all duration-200 cursor-pointer"
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
                          return (
                            <div
                              key={item.id}
                              className="group bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-accent/30 transition-[transform,box-shadow,border-color] duration-300 cursor-pointer"
                              data-ocid={`lunch.item.${idx + 1}`}
                            >
                              {/* Real food image */}
                              <div className="relative h-32 overflow-hidden bg-muted">
                                <img
                                  src={getMenuItemImage(item.name)}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ease-out"
                                />
                              </div>
                              <div className="p-4">
                                <p className="font-display font-semibold text-sm text-foreground leading-tight mb-1.5 line-clamp-2">
                                  {item.name}
                                </p>
                                <p className="text-accent font-bold text-base mb-2.5">
                                  ₹{item.price}
                                </p>
                                {cartItem ? (
                                  <div className="flex items-center justify-between bg-muted rounded-full px-1 py-0.5">
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
                                    className="w-full py-2.5 rounded-full bg-accent text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all duration-150 shadow-sm"
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
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
            <div className="sticky top-[72px]">
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
            className="px-4 py-2 bg-accent text-accent-foreground text-sm font-semibold rounded-full hover:brightness-110 active:scale-[0.98] transition-all duration-150"
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
      <footer className="border-t border-border bg-card mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 text-center">
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
