import { Separator } from "@/components/ui/separator";
import { ArrowLeft, QrCode, Receipt, ShoppingBag } from "lucide-react";
import { useState } from "react";
import type { CartItem, OrderForm, RestaurantCartItem } from "../types";

interface OrderSidebarProps {
  cartItems: CartItem[];
  restaurantCartItems: RestaurantCartItem[];
  selectedRestaurant: string;
  form: OrderForm;
  onFormChange: (field: keyof OrderForm, value: string) => void;
  onSubmit: () => void;
  formErrors: Partial<OrderForm>;
  submitted: boolean;
  onBack?: () => void;
}

export function OrderSidebar({
  cartItems,
  restaurantCartItems,
  selectedRestaurant,
  form,
  onFormChange,
  onSubmit,
  formErrors,
  submitted,
  onBack,
}: OrderSidebarProps) {
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentError, setPaymentError] = useState(false);
  const [qrError, setQrError] = useState(false);

  const regularSubtotal = cartItems.reduce(
    (sum, ci) => sum + ci.item.price * ci.quantity,
    0,
  );
  const restaurantSubtotal = restaurantCartItems.reduce(
    (sum, ci) => sum + ci.item.price * ci.quantity,
    0,
  );
  const total = regularSubtotal + restaurantSubtotal;
  const allItemCount =
    cartItems.reduce((s, ci) => s + ci.quantity, 0) +
    restaurantCartItems.reduce((s, ci) => s + ci.quantity, 0);

  const handleSubmitClick = () => {
    if (!paymentConfirmed) {
      setPaymentError(true);
      return;
    }
    setPaymentError(false);
    onSubmit();
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Back Button - mobile only */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="lg:hidden flex items-center gap-1.5 min-h-10 px-1 text-muted-foreground hover:text-foreground transition-colors self-start"
          data-ocid="order.back_button"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      )}

      {/* ── Order Summary Card ──────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        data-ocid="order.panel"
      >
        {/* Gradient header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.28 0.15 255) 0%, oklch(0.35 0.14 255) 100%)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-base text-white tracking-tight">
              Order Summary
            </h2>
          </div>
          {allItemCount > 0 && (
            <span
              className="text-xs font-black px-2.5 py-1 rounded-full"
              style={{ background: "oklch(0.70 0.18 45)", color: "white" }}
            >
              {allItemCount} item{allItemCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="p-5">
          {allItemCount === 0 ? (
            <div className="text-center py-10" data-ocid="order.empty_state">
              <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🍽️</span>
              </div>
              <p className="text-sm font-semibold text-foreground mb-1.5">
                Your cart is empty
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Browse the menu and add items to get started
              </p>
            </div>
          ) : (
            <>
              {/* Restaurant label */}
              {selectedRestaurant && restaurantCartItems.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    🏪 {selectedRestaurant}
                  </span>
                </div>
              )}

              {/* Items list */}
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                {restaurantCartItems.map((ci, i) => (
                  <div
                    key={ci.item.id}
                    className="flex justify-between items-center gap-2 py-2.5 border-b border-gray-50 last:border-0"
                    data-ocid={`order.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded-md shrink-0"
                        style={{
                          background: "oklch(0.93 0.06 45)",
                          color: "oklch(0.42 0.14 45)",
                        }}
                      >
                        ×{ci.quantity}
                      </span>
                      <span className="text-sm text-foreground font-medium leading-snug line-clamp-1 flex-1">
                        {ci.item.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-foreground shrink-0">
                      ₹{ci.item.price * ci.quantity}
                    </span>
                  </div>
                ))}
                {cartItems.length > 0 && restaurantCartItems.length > 0 && (
                  <Separator className="my-1" />
                )}
                {cartItems.map((ci, i) => (
                  <div
                    key={ci.item.id}
                    className="flex justify-between items-center gap-2 py-2.5 border-b border-gray-50 last:border-0"
                    data-ocid={`order.item.${restaurantCartItems.length + i + 1}`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded-md shrink-0"
                        style={{
                          background: "oklch(0.93 0.06 45)",
                          color: "oklch(0.42 0.14 45)",
                        }}
                      >
                        ×{ci.quantity}
                      </span>
                      <span className="text-sm text-foreground font-medium leading-snug line-clamp-1 flex-1">
                        {ci.item.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-foreground shrink-0">
                      ₹{ci.item.price * ci.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotal */}
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-muted-foreground">Subtotal</span>
                <span className="text-xs font-semibold text-muted-foreground">
                  ₹{total}
                </span>
              </div>

              {/* Total — prominent */}
              <div
                className="flex justify-between items-center mt-2.5 rounded-xl px-4 py-3.5"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.96 0.05 45) 0%, oklch(0.98 0.025 45) 100%)",
                  border: "1.5px solid oklch(0.85 0.09 45)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Receipt
                    className="w-4 h-4"
                    style={{ color: "oklch(0.55 0.15 45)" }}
                  />
                  <span
                    className="text-sm font-bold"
                    style={{ color: "oklch(0.32 0.10 45)" }}
                  >
                    Total
                  </span>
                </div>
                <span
                  className="font-display text-2xl font-black tracking-tight"
                  style={{ color: "oklch(0.58 0.20 45)" }}
                >
                  ₹{total}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Delivery Details Form ─────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
        <h2 className="font-display font-semibold text-base text-foreground mb-4">
          Delivery Details
        </h2>
        <div className="space-y-3.5">
          <div>
            <label
              className="block text-xs font-semibold text-muted-foreground mb-1.5"
              htmlFor="order-name"
            >
              Name *
            </label>
            <input
              id="order-name"
              type="text"
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => onFormChange("name", e.target.value)}
              className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all ${
                formErrors.name ? "border-destructive" : "border-input"
              }`}
              data-ocid="order.name.input"
            />
            {formErrors.name && (
              <p
                className="text-xs text-destructive mt-1"
                data-ocid="order.name.error_state"
              >
                {formErrors.name}
              </p>
            )}
          </div>
          <div>
            <label
              className="block text-xs font-semibold text-muted-foreground mb-1.5"
              htmlFor="order-dept"
            >
              Department *
            </label>
            <input
              id="order-dept"
              type="text"
              placeholder="e.g. Engineering, HR"
              value={form.department}
              onChange={(e) => onFormChange("department", e.target.value)}
              className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all ${
                formErrors.department ? "border-destructive" : "border-input"
              }`}
              data-ocid="order.department.input"
            />
            {formErrors.department && (
              <p
                className="text-xs text-destructive mt-1"
                data-ocid="order.department.error_state"
              >
                {formErrors.department}
              </p>
            )}
          </div>
          <div>
            <label
              className="block text-xs font-semibold text-muted-foreground mb-1.5"
              htmlFor="order-phone"
            >
              Phone Number *
            </label>
            <input
              id="order-phone"
              type="tel"
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={(e) => onFormChange("phone", e.target.value)}
              className={`w-full px-4 py-2.5 text-sm rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all ${
                formErrors.phone ? "border-destructive" : "border-input"
              }`}
              data-ocid="order.phone.input"
            />
            {formErrors.phone && (
              <p
                className="text-xs text-destructive mt-1"
                data-ocid="order.phone.error_state"
              >
                {formErrors.phone}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Payment Section ────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border-2 shadow-card p-5"
        style={{
          borderColor: "oklch(0.78 0.10 42)",
          background:
            "linear-gradient(160deg, oklch(0.995 0.005 55) 0%, oklch(0.975 0.018 42) 100%)",
        }}
        data-ocid="order.payment_section"
      >
        {/* Payment header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: "oklch(0.70 0.18 45)" }}
          >
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2
              className="font-display font-bold text-base leading-tight"
              style={{ color: "oklch(0.26 0.09 42)" }}
            >
              📱 Scan &amp; Pay via UPI
            </h2>
            <p className="text-xs" style={{ color: "oklch(0.55 0.08 42)" }}>
              Complete payment before placing order
            </p>
          </div>
        </div>

        <Separator
          className="mb-4"
          style={{ background: "oklch(0.88 0.07 42)" }}
        />

        {/* Payee info */}
        <div
          className="rounded-xl border p-4 mb-5 text-center"
          style={{ borderColor: "oklch(0.87 0.08 42)", background: "white" }}
        >
          <p
            className="text-sm font-bold mb-3"
            style={{ color: "oklch(0.24 0.09 42)" }}
          >
            Pay via UPI to Sanjay
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span
              className="text-xs font-black px-2 py-0.5 rounded-md uppercase tracking-wide"
              style={{ background: "oklch(0.70 0.18 45)", color: "white" }}
            >
              UPI
            </span>
            <span
              className="font-mono text-sm px-3 py-1.5 rounded-full border inline-flex items-center gap-1.5"
              style={{
                background: "oklch(0.96 0.02 42)",
                borderColor: "oklch(0.84 0.09 42)",
                color: "oklch(0.30 0.10 42)",
              }}
            >
              sanjayshegar1990@okaxis
            </span>
          </div>
        </div>

        {/* QR Code — centered */}
        <div className="flex flex-col items-center mb-5 gap-3">
          <div
            className="rounded-2xl p-4 shadow-md mx-auto inline-block"
            style={{
              background: "white",
              border: "1.5px solid oklch(0.88 0.07 42)",
            }}
          >
            {!qrError ? (
              <img
                src="/assets/uploads/image-019d2ef5-6746-75cb-a591-1a2c5696ec85-1.png"
                alt="UPI QR Code - Scan to pay Sanjay"
                className="w-56 h-56 object-contain"
                onError={() => setQrError(true)}
              />
            ) : (
              <div
                className="w-56 h-56 rounded-xl flex flex-col items-center justify-center gap-2"
                style={{ border: "2px dashed oklch(0.80 0.10 42)" }}
              >
                <QrCode
                  className="w-10 h-10"
                  style={{ color: "oklch(0.70 0.12 42)" }}
                />
                <p
                  className="text-xs text-center px-4"
                  style={{ color: "oklch(0.60 0.09 42)" }}
                >
                  QR Code unavailable
                </p>
              </div>
            )}
          </div>
          <p
            className="text-sm font-medium text-center"
            style={{ color: "oklch(0.50 0.09 42)" }}
          >
            Scan with any UPI app to pay
          </p>
        </div>

        {/* Amount due */}
        <div
          className="flex justify-between items-center rounded-xl px-4 py-4 mb-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.96 0.05 45) 0%, oklch(0.985 0.02 45) 100%)",
            border: "1.5px solid oklch(0.84 0.10 45)",
          }}
        >
          <span
            className="text-sm font-bold"
            style={{ color: "oklch(0.36 0.10 42)" }}
          >
            Amount Due
          </span>
          <span
            className="font-display text-2xl font-black"
            style={{ color: "oklch(0.58 0.20 45)" }}
          >
            ₹{total}
          </span>
        </div>

        {/* Confirmation checkbox */}
        <label
          className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border transition-all ${
            paymentError
              ? "border-red-400 bg-red-50"
              : "border-transparent bg-white"
          }`}
          style={
            !paymentError ? { border: "1.5px solid oklch(0.87 0.08 42)" } : {}
          }
        >
          <input
            type="checkbox"
            checked={paymentConfirmed}
            onChange={(e) => {
              setPaymentConfirmed(e.target.checked);
              if (e.target.checked) setPaymentError(false);
            }}
            className="mt-0.5 w-4 h-4 shrink-0 cursor-pointer"
            style={{ accentColor: "oklch(0.70 0.18 45)" }}
            data-ocid="order.payment_confirmed.checkbox"
          />
          <span
            className={`text-sm font-medium leading-snug ${paymentError ? "text-red-700" : ""}`}
            style={!paymentError ? { color: "oklch(0.30 0.09 42)" } : {}}
          >
            I have completed the payment
          </span>
        </label>

        {paymentError && (
          <p
            className="text-xs text-red-600 mt-1.5 text-center font-medium"
            data-ocid="order.payment.error_state"
          >
            Please confirm payment before placing your order
          </p>
        )}
      </div>

      {/* ── Submit Button ───────────────────────────────────────────────────── */}
      {submitted ? (
        <div
          className="w-full py-3.5 rounded-2xl bg-green-100 border border-green-300 text-center"
          data-ocid="order.success_state"
        >
          <p className="text-sm font-semibold text-green-800">
            ✓ Order Submitted!
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleSubmitClick}
          disabled={!paymentConfirmed}
          className="w-full py-4 font-black text-base rounded-2xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:enabled:shadow-xl hover:enabled:brightness-105"
          style={{
            background: paymentConfirmed
              ? "linear-gradient(135deg, oklch(0.64 0.19 45) 0%, oklch(0.72 0.20 45) 100%)"
              : "oklch(0.78 0.08 45)",
            color: "white",
          }}
          data-ocid="order.submit_button"
        >
          <span className="block text-xs font-semibold opacity-80 mb-0.5 tracking-widest uppercase">
            Place Order
          </span>
          <span className="font-display block text-xl font-black tracking-tight">
            ₹{total}
          </span>
        </button>
      )}
    </div>
  );
}
