import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Order {
    name: string;
    totalAmount: bigint;
    timestamp: bigint;
    phone: string;
    items: Array<Item>;
    department: string;
}
export interface Item {
    itemName: string;
    quantity: bigint;
    price: bigint;
}
export interface backendInterface {
    getOrders(): Promise<Array<Order>>;
    placeOrder(name: string, department: string, phone: string, items: Array<Item>, totalAmount: bigint): Promise<bigint>;
}
