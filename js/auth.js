/* ======================================
   HMARA BAZAAR AUTH ENGINE v1
   ====================================== */

function registerUser(name, phone) {

    let user = {

        id: Date.now(),

        name: name,

        phone: phone,

        email: "",

        profilePhoto: "",

        market: localStorage.getItem("pincode") || "",

        roles: ["customer"],

        activeRole: "customer",

        businesses: [],

      activeBusinessId: null,

        favouriteShops: [],

        addresses: [],

        createdAt: new Date().toISOString()

    };

    saveUser(user);

    login(user);

    return user;

}

/* ======================================
   USER SESSION
   ====================================== */

function currentUser() {

    return getCurrentUser();

}

/* ======================================
   SELLER
   ====================================== */

function becomeSeller() {

    let user = currentUser();

    if (!user) return;

    if (!user.roles.includes("seller")) {

        user.roles.push("seller");

    }

    user.activeRole = "seller";

    login(user);

}

/* ======================================
   CUSTOMER
   ====================================== */

function becomeCustomer() {

    let user = currentUser();

    if (!user) return;

    user.activeRole = "customer";

    login(user);

}
