import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Item {
    itemName: string;
    quantity: bigint;
    price: bigint;
}
export interface Order {
    name: string;
    totalAmount: bigint;
    restaurantName: string;
    timestamp: bigint;
    phone: string;
    items: Array<Item>;
    department: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrders(): Promise<Array<Order>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(name: string, department: string, phone: string, restaurantName: string, items: Array<Item>, totalAmount: bigint): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
