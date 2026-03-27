import Time "mo:core/Time";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


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

  type UserProfile = {
    name : Text;
  };

  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profiles storage
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Stable storage for orders
  stable var orders : [Order] = [];

  // User profile management functions
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

  // Order management functions - no authorization required per user request
  public shared ({ caller }) func placeOrder(name : Text, department : Text, phone : Text, items : [Item], totalAmount : Nat) : async Nat {
    let newOrder : Order = {
      name;
      department;
      phone;
      items;
      totalAmount;
      timestamp = Time.now();
    };

    orders := orders.concat([newOrder]);
    orders.size();
  };

  public query ({ caller }) func getOrders() : async [Order] {
    orders;
  };
};
