import Time "mo:core/Time";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  public type Item = {
    itemName : Text;
    quantity : Nat;
    price : Nat;
  };

  public type Order = {
    name : Text;
    department : Text;
    phone : Text;
    restaurantName : Text;
    items : [Item];
    totalAmount : Nat;
    timestamp : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();

  var orders : [Order] = [];

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared func placeOrder(name : Text, department : Text, phone : Text, restaurantName : Text, items : [Item], totalAmount : Nat) : async Nat {
    let newOrder : Order = {
      name;
      department;
      phone;
      restaurantName;
      items;
      totalAmount;
      timestamp = Time.now();
    };

    let size = orders.size();
    orders := Array.tabulate<Order>(size + 1, func(i) {
      if (i < size) orders[i] else newOrder
    });
    orders.size();
  };

  public query func getOrders() : async [Order] {
    orders;
  };
};
