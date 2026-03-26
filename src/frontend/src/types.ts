export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "breakfast" | "lunch" | "snacks";
  image: string;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface OrderForm {
  name: string;
  department: string;
  phone: string;
}
