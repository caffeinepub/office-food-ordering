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
      className={`group bg-card rounded-2xl border overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-[transform,box-shadow,border-color] duration-300 cursor-pointer ${
        isSelected
          ? "border-accent ring-1 ring-accent/30"
          : "border-border hover:border-accent/40"
      }`}
      data-ocid={`menu.item.${item.id}`}
    >
      <div className="relative h-32 overflow-hidden bg-muted">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 ease-out"
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
      <div className="p-4">
        <h3 className="font-display font-semibold text-sm text-foreground leading-tight mb-1.5">
          {item.name}
        </h3>
        <p className="text-xs text-muted-foreground leading-snug mb-3">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-base text-accent">
            ₹{item.price}
          </span>
          {isSelected ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onQtyChange(item.id, -1)}
                className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted active:scale-95 transition-all duration-150"
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
                className="w-7 h-7 rounded-full bg-accent flex items-center justify-center hover:brightness-110 active:scale-95 transition-all duration-150"
                data-ocid={`menu.item.${item.id}.toggle`}
              >
                <Plus className="w-3 h-3 text-white" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onToggle(item)}
              className="rounded-full bg-accent text-accent-foreground px-4 py-2 text-xs font-bold hover:brightness-110 active:scale-95 transition-all duration-150"
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
