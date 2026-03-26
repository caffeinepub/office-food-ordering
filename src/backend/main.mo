import Time "mo:core/Time";
import List "mo:core/List";
import Nat "mo:core/Nat";



actor {
  type Item = {
    itemName : Text;
    quantity : Nat;
    price : Nat;
  };

  type Order = {
    name : Text;
    department : Text;
    phone : Text;
    items : [Item];
    totalAmount : Nat;
    timestamp : Int;
  };

  var nextOrderId = 1;
  let ordersList = List.empty<Order>();

  public shared ({ caller }) func placeOrder(name : Text, department : Text, phone : Text, items : [Item], totalAmount : Nat) : async Nat {
    let newOrder : Order = {
      name;
      department;
      phone;
      items;
      totalAmount;
      timestamp = Time.now();
    };

    ordersList.add(newOrder);
    let orderId = nextOrderId;
    nextOrderId += 1;
    orderId;
  };

  public query ({ caller }) func getOrders() : async [Order] {
    ordersList.toArray();
  };
};
