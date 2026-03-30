import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ShoppingBag, Smartphone } from "lucide-react";
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
    <div className="flex flex-col gap-4">
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
        className="bg-card rounded-xl border border-border shadow-sm p-4"
        data-ocid="order.panel"
      >
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-base text-foreground">
            Order Summary
          </h2>
        </div>

        {allItemCount === 0 ? (
          <div className="text-center py-6" data-ocid="order.empty_state">
            <p className="text-muted-foreground text-sm">No items added yet</p>
            <p className="text-muted-foreground text-xs mt-1">
              Browse the menu and add items
            </p>
          </div>
        ) : (
          <>
            {/* Restaurant label if applicable */}
            {selectedRestaurant && restaurantCartItems.length > 0 && (
              <div className="mb-2">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  🏪 {selectedRestaurant}
                </span>
              </div>
            )}

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {restaurantCartItems.map((ci, i) => (
                <div
                  key={ci.item.id}
                  className="flex justify-between items-center"
                  data-ocid={`order.item.${i + 1}`}
                >
                  <div>
                    <span className="text-sm text-foreground font-medium">
                      {ci.item.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ×{ci.quantity}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
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
                  className="flex justify-between items-center"
                  data-ocid={`order.item.${restaurantCartItems.length + i + 1}`}
                >
                  <div>
                    <span className="text-sm text-foreground font-medium">
                      {ci.item.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ×{ci.quantity}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    ₹{ci.item.price * ci.quantity}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm text-foreground">₹{total}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-base font-bold text-foreground">Total</span>
              <span className="text-base font-bold text-primary">₹{total}</span>
            </div>
          </>
        )}
      </div>

      {/* Order Form */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4">
        <h2 className="font-semibold text-base text-foreground mb-3">
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
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow ${
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
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow ${
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
              className={`w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow ${
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

      {/* Payment Section */}
      <div
        className="rounded-xl border-2 border-amber-400 bg-amber-50 shadow-sm p-4"
        data-ocid="order.payment_section"
      >
        <div className="flex items-center gap-2 mb-3">
          <Smartphone className="w-4 h-4 text-amber-600" />
          <h2 className="font-semibold text-base text-amber-800">
            Pay via UPI
          </h2>
        </div>

        {/* UPI Info */}
        <div className="bg-white rounded-lg border border-amber-200 p-3 mb-3 text-center">
          <p className="text-sm font-bold text-amber-900">
            Pay via UPI to Sanjay
          </p>
          <p className="text-xs text-amber-700 mt-1 break-all font-medium">
            UPI ID: sanjayshegar1990@okaxis
          </p>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center mb-3 gap-2">
          {!qrError ? (
            <img
              src="/assets/uploads/image-019d2ef5-6746-75cb-a591-1a2c5696ec85-1.png"
              alt="UPI QR Code - Scan to pay Sanjay"
              className="w-56 h-56 object-contain rounded-lg border border-amber-200 bg-white p-2"
              onError={() => setQrError(true)}
            />
          ) : (
            <div className="w-56 h-56 rounded-lg border-2 border-dashed border-amber-300 bg-white flex flex-col items-center justify-center gap-1">
              <Smartphone className="w-10 h-10 text-amber-300" />
              <p className="text-xs text-amber-400 text-center px-2">QR Code</p>
            </div>
          )}
          <p className="text-xs text-amber-700 font-medium text-center">
            Scan to pay with any UPI app
          </p>
        </div>

        {/* Amount */}
        <div className="flex justify-between items-center bg-white rounded-lg border border-amber-200 px-3 py-2 mb-3">
          <span className="text-sm text-amber-700">Amount Due</span>
          <span className="text-base font-bold text-amber-900">₹{total}</span>
        </div>

        {/* Instruction */}
        <p className="text-xs text-amber-700 text-center mb-3 font-medium">
          ⚠️ Please complete payment before placing order
        </p>

        {/* Confirmation Checkbox */}
        <label
          className={`flex items-start gap-2.5 cursor-pointer p-2.5 rounded-lg border ${
            paymentError
              ? "border-red-400 bg-red-50"
              : "border-amber-200 bg-white"
          }`}
        >
          <input
            type="checkbox"
            checked={paymentConfirmed}
            onChange={(e) => {
              setPaymentConfirmed(e.target.checked);
              if (e.target.checked) setPaymentError(false);
            }}
            className="mt-0.5 w-4 h-4 accent-amber-500 shrink-0"
            data-ocid="order.payment_confirmed.checkbox"
          />
          <span
            className={`text-sm font-medium leading-snug ${
              paymentError ? "text-red-700" : "text-amber-800"
            }`}
          >
            I have completed the payment
          </span>
        </label>
        {paymentError && (
          <p className="text-xs text-red-600 mt-1.5 text-center font-medium">
            Please complete payment before placing order
          </p>
        )}
      </div>

      {/* Submit Button */}
      {submitted ? (
        <div
          className="w-full py-3 rounded-lg bg-green-100 border border-green-300 text-center"
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
          className="w-full py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-lg transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:opacity-90"
          data-ocid="order.submit_button"
        >
          Submit Order — ₹{total}
        </button>
      )}
    </div>
  );
}
