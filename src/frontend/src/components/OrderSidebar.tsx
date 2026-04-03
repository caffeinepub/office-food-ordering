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

      {/* Order Summary */}
      <div
        className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
        data-ocid="order.panel"
      >
        {/* Card Header with gradient */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.20 0.10 258) 0%, oklch(0.28 0.14 258) 100%)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-base text-white tracking-tight">
              Order Summary
            </h2>
          </div>
          {allItemCount > 0 && (
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{
                background: "oklch(0.68 0.21 42)",
                color: "white",
              }}
            >
              {allItemCount} item{allItemCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="p-4">
          {allItemCount === 0 ? (
            <div className="text-center py-8" data-ocid="order.empty_state">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">
                Your cart is empty
              </p>
              <p className="text-xs text-muted-foreground">
                Browse the menu and add items to get started
              </p>
            </div>
          ) : (
            <>
              {/* Restaurant label if applicable */}
              {selectedRestaurant && restaurantCartItems.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    🏪 {selectedRestaurant}
                  </span>
                </div>
              )}

              {/* Items list */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {restaurantCartItems.map((ci, i) => (
                  <div
                    key={ci.item.id}
                    className="flex justify-between items-center gap-2 px-2.5 py-2 rounded-xl transition-colors"
                    style={{
                      background:
                        i % 2 === 0 ? "oklch(0.97 0.004 255)" : "transparent",
                      borderLeft: "3px solid oklch(0.68 0.21 42)",
                    }}
                    data-ocid={`order.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm text-foreground font-medium leading-snug line-clamp-1 flex-1">
                        {ci.item.name}
                      </span>
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded-md shrink-0"
                        style={{
                          background: "oklch(0.93 0.05 42)",
                          color: "oklch(0.38 0.12 42)",
                        }}
                      >
                        &times;{ci.quantity}
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
                    className="flex justify-between items-center gap-2 px-2.5 py-2 rounded-xl transition-colors"
                    style={{
                      background:
                        (restaurantCartItems.length + i) % 2 === 0
                          ? "oklch(0.97 0.004 255)"
                          : "transparent",
                      borderLeft: "3px solid oklch(0.68 0.21 42)",
                    }}
                    data-ocid={`order.item.${restaurantCartItems.length + i + 1}`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm text-foreground font-medium leading-snug line-clamp-1 flex-1">
                        {ci.item.name}
                      </span>
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded-md shrink-0"
                        style={{
                          background: "oklch(0.93 0.05 42)",
                          color: "oklch(0.38 0.12 42)",
                        }}
                      >
                        &times;{ci.quantity}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-foreground shrink-0">
                      ₹{ci.item.price * ci.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtotal row */}
              <div className="flex justify-between items-center mt-3 px-1">
                <span className="text-xs text-muted-foreground">Subtotal</span>
                <span className="text-xs text-muted-foreground">₹{total}</span>
              </div>

              {/* Total — prominent highlight row */}
              <div
                className="flex justify-between items-center mt-2 rounded-xl px-3 py-3"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.96 0.04 42) 0%, oklch(0.98 0.02 42) 100%)",
                  border: "1.5px solid oklch(0.85 0.09 42)",
                }}
              >
                <div className="flex items-center gap-2">
                  <Receipt
                    className="w-4 h-4"
                    style={{ color: "oklch(0.52 0.15 42)" }}
                  />
                  <span
                    className="text-sm font-bold"
                    style={{ color: "oklch(0.30 0.10 42)" }}
                  >
                    Total
                  </span>
                </div>
                <span
                  className="font-display text-2xl font-black tracking-tight"
                  style={{ color: "oklch(0.55 0.20 42)" }}
                >
                  ₹{total}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order Form */}
      <div className="bg-card rounded-2xl border border-border shadow-card p-4">
        <h2 className="font-display font-semibold text-base text-foreground mb-3">
          Delivery Details
        </h2>
        <div className="space-y-3">
          <div>
            <label
              className="block text-xs font-medium text-foreground mb-1"
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
              className={`w-full px-3 py-2.5 text-sm rounded-2xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow ${
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
              className="block text-xs font-medium text-foreground mb-1"
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
              className={`w-full px-3 py-2.5 text-sm rounded-2xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow ${
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
              className="block text-xs font-medium text-foreground mb-1"
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
              className={`w-full px-3 py-2.5 text-sm rounded-2xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow ${
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

      {/* Payment Section — on-brand, visually distinct */}
      <div
        className="rounded-2xl border-2 shadow-card p-5"
        style={{
          borderColor: "oklch(0.75 0.12 42)",
          background:
            "linear-gradient(160deg, oklch(0.99 0.008 55) 0%, oklch(0.97 0.015 42) 100%)",
        }}
        data-ocid="order.payment_section"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.68 0.21 42)" }}
          >
            <QrCode className="w-4 h-4 text-white" />
          </div>
          <h2
            className="font-display font-bold text-base"
            style={{ color: "oklch(0.28 0.09 42)" }}
          >
            Pay via UPI
          </h2>
          <span
            className="ml-auto text-xs font-bold px-3 py-1 rounded-full"
            style={{
              background: "oklch(0.68 0.21 42)",
              color: "white",
            }}
          >
            Scan &amp; Pay
          </span>
        </div>

        <Separator
          className="mb-4"
          style={{ background: "oklch(0.88 0.07 42)" }}
        />

        {/* UPI Info block */}
        <div
          className="rounded-xl border p-4 mb-5 text-center"
          style={{
            borderColor: "oklch(0.85 0.08 42)",
            background: "white",
          }}
        >
          <p
            className="text-base font-bold mb-2"
            style={{ color: "oklch(0.24 0.09 42)" }}
          >
            Pay via UPI to Sanjay
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide"
              style={{
                background: "oklch(0.68 0.21 42)",
                color: "white",
              }}
            >
              UPI
            </span>
            <span
              className="font-mono text-sm px-3 py-1 rounded-lg border inline-block"
              style={{
                background: "oklch(0.97 0.015 42)",
                borderColor: "oklch(0.85 0.08 42)",
                color: "oklch(0.30 0.10 42)",
              }}
            >
              sanjayshegar1990@okaxis
            </span>
          </div>
        </div>

        {/* QR Code — centered, larger */}
        <div className="flex flex-col items-center mb-5 gap-3">
          <div
            className="rounded-2xl p-4 shadow-md mx-auto"
            style={{
              background: "white",
              border: "1.5px solid oklch(0.88 0.07 42)",
            }}
          >
            {!qrError ? (
              <img
                src="/assets/uploads/image-019d2ef5-6746-75cb-a591-1a2c5696ec85-1.png"
                alt="UPI QR Code - Scan to pay Sanjay"
                className="w-64 h-64 object-contain"
                onError={() => setQrError(true)}
              />
            ) : (
              <div
                className="w-64 h-64 rounded-xl flex flex-col items-center justify-center gap-2"
                style={{ border: "2px dashed oklch(0.80 0.10 42)" }}
              >
                <QrCode
                  className="w-10 h-10"
                  style={{ color: "oklch(0.70 0.12 42)" }}
                />
                <p
                  className="text-xs px-4 text-center"
                  style={{ color: "oklch(0.60 0.09 42)" }}
                >
                  QR Code unavailable
                </p>
              </div>
            )}
          </div>
          <p
            className="text-sm font-medium text-center"
            style={{ color: "oklch(0.48 0.09 42)" }}
          >
            Scan with any UPI app to pay
          </p>
        </div>

        {/* Amount due — prominent */}
        <div
          className="flex justify-between items-center rounded-xl px-4 py-4 mb-4"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.96 0.04 42) 0%, oklch(0.98 0.02 42) 100%)",
            border: "1.5px solid oklch(0.82 0.10 42)",
          }}
        >
          <span
            className="text-sm font-bold"
            style={{ color: "oklch(0.36 0.10 42)" }}
          >
            Amount Due
          </span>
          <span
            className="text-xl font-black tracking-tight"
            style={{ color: "oklch(0.55 0.20 42)" }}
          >
            ₹{total}
          </span>
        </div>

        {/* Instruction */}
        <p
          className="text-xs text-center mb-4 font-medium"
          style={{ color: "oklch(0.52 0.10 42)" }}
        >
          ⚠️ Complete payment before placing your order
        </p>

        {/* Confirmation checkbox */}
        <label
          className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border transition-colors ${
            paymentError
              ? "border-red-400 bg-red-50"
              : "border-transparent bg-white/70 hover:bg-white"
          }`}
          style={{
            border: paymentError
              ? undefined
              : "1.5px solid oklch(0.85 0.08 42)",
          }}
        >
          <input
            type="checkbox"
            checked={paymentConfirmed}
            onChange={(e) => {
              setPaymentConfirmed(e.target.checked);
              if (e.target.checked) setPaymentError(false);
            }}
            className="mt-0.5 w-4 h-4 shrink-0"
            style={{ accentColor: "oklch(0.68 0.21 42)" }}
            data-ocid="order.payment_confirmed.checkbox"
          />
          <span
            className={`text-sm font-medium leading-snug ${
              paymentError ? "text-red-700" : ""
            }`}
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

      {/* Submit Button */}
      {submitted ? (
        <div
          className="w-full py-3 rounded-2xl bg-green-100 border border-green-300 text-center"
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
          className="w-full py-4 font-black text-base rounded-2xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:opacity-90 shadow-md"
          style={{
            background: paymentConfirmed
              ? "linear-gradient(135deg, oklch(0.62 0.20 42) 0%, oklch(0.70 0.22 42) 100%)"
              : "oklch(0.75 0.08 42)",
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
