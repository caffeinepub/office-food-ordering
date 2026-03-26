import { Minus, Plus } from "lucide-react";
import type { CartItem, MenuItem } from "../types";

interface MenuItemCardProps {
  item: MenuItem;
  cartItem: CartItem | undefined;
  onToggle: (item: MenuItem) => void;
  onQtyChange: (itemId: string, delta: number) => void;
}

export function MenuItemCard({
  item,
  cartItem,
  onToggle,
  onQtyChange,
}: MenuItemCardProps) {
  const isSelected = !!cartItem;

  return (
    <div
      className={`bg-card rounded-xl border overflow-hidden shadow-sm transition-all duration-200 ${
        isSelected ? "border-accent ring-1 ring-accent/30" : "border-border"
      }`}
      data-ocid={`menu.item.${item.id}`}
    >
      <div className="relative h-36 overflow-hidden bg-muted">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-label="Selected"
              role="img"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-foreground leading-tight">
          {item.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
          {item.description}
        </p>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-sm text-foreground">
            ₹{item.price}
          </span>
          {isSelected ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onQtyChange(item.id, -1)}
                className="w-7 h-7 rounded-md bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors"
                data-ocid={`menu.item.${item.id}.toggle`}
              >
                <Minus className="w-3 h-3 text-foreground" />
              </button>
              <span className="w-6 text-center text-sm font-semibold text-foreground">
                {cartItem.quantity}
              </span>
              <button
                type="button"
                onClick={() => onQtyChange(item.id, 1)}
                className="w-7 h-7 rounded-md bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors"
                data-ocid={`menu.item.${item.id}.toggle`}
              >
                <Plus className="w-3 h-3 text-foreground" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onToggle(item)}
              className="px-3 py-1.5 bg-accent text-accent-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
              data-ocid={`menu.item.${item.id}.button`}
            >
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
