/* ==========================================
   HMARA BAZAAR DATABASE ENGINE v1
   ========================================== */

const DB = {

    USERS: "hb_users",

    SHOPS: "hb_shops",

    PRODUCTS: "hb_products",

    SERVICES: "hb_services",

    ORDERS: "hb_orders",

    SESSION: "hb_session",
  
    CART: "hb_cart",
   
    SELECTEDSHOP: "hb_selectedShop",
   
    SELECTEDPRODUCT: "hb-selectedProduct"

};

/* ==========================================
   GENERIC FUNCTIONS
   ========================================== */

function getData(key){

    return JSON.parse(

        localStorage.getItem(key) || "[]"

    );

}

function saveData(key,data){

    localStorage.setItem(

        key,

        JSON.stringify(data)

    );

}

/* ==========================================
   USERS
   ========================================== */

function getUsers(){

    return getData(DB.USERS);

}

function saveUser(user){

    let users=getUsers();

    users.push(user);

    saveData(DB.USERS,users);

}

function getCurrentUser(){

    return JSON.parse(

        localStorage.getItem(DB.SESSION)

    );

}

function login(user){

    localStorage.setItem(

        DB.SESSION,

        JSON.stringify(user)

    );

}

function logout(){

    localStorage.removeItem(

        DB.SESSION

    );

}

/* ==========================================
   SHOPS
   ========================================== */

function getShops(){

    return getData(DB.SHOPS);

}

function saveShop(shop){

    let shops=getShops();

    shops.push(shop);

    saveData(DB.SHOPS,shops);

}


/* ==========================================
   SERVICES
   ========================================== */

function getServices(){

    return getData(DB.SERVICES);

}

function saveService(service){

    let services=getServices();

    services.push(service);

    saveData(DB.SERVICES,services);

}

/* ==========================================
   ORDERS
   ========================================== */

function getOrders(){

    return getData(DB.ORDERS);

}

function saveOrder(order){

    let orders=getOrders();

    orders.push(order);

    saveData(DB.ORDERS,orders);

}
