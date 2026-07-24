/* ==========================================
   HMARA BAZAAR DATABASE ENGINE v1
   ========================================== */

const DB = {

    USERS: "hb_users",
   BUSINESSES: "hb_businesses",

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
   BUSINESSES
   ========================================== */

function getBusinesses(){

    return getData (DB.BUSINESSES);

}

function saveBusiness(business){

    let businesses = getBusinesses();

    businesses.push(business);

    saveData(

        DB.BUSINESSES,

        businesses

    );

}

function getBusinessesByOwner(ownerId){

    return getBusinesses().filter(

        business => business.ownerId == ownerId

    );

}

function getBusinessById(id){

    return getBusinesses().find(

        business => business.id == id

    );

}
function updateBusiness(updatedBusiness){

    let businesses = getBusinesses();

    businesses = businesses.map(business =>

        business.id == updatedBusiness.id

        ? updatedBusiness

        : business

    );

    saveData(

        DB.BUSINESSES,

        businesses

    );

    return updatedBusiness;

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
function updateOrderStatus(id,status){

    let orders = getOrders();

    const order = orders.find(

        o => o.id == id

    );

    if(order){

        order.status = status;

    }

    saveData(

        DB.ORDERS,

        orders

    );

}
/* ==========================================
   BUSINESSES
========================================== */

function getBusinesses(){

    return getData("hb_businesses");

}


function saveBusiness(business){

    let businesses =
        getBusinesses();

    businesses.push(business);

    saveData(
        "hb_businesses",
        businesses
    );

}


function createBusiness(business){

    business.id =
        Date.now();

    business.createdAt =
        new Date().toISOString();

    saveBusiness(
        business
    );

    return business;

}


function getBusinessById(id){

    return getBusinesses().find(

        business =>
            business.id == id

    ) || null;

}


function addBusinessToUser(
    userId,
    businessId
){

    let users =
        getUsers();

    const user =
        users.find(

            u => u.id == userId

        );

    if(!user){

        return false;

    }


    if(!user.businesses){

        user.businesses = [];

    }


    if(
        !user.businesses.includes(
            businessId
        )
    ){

        user.businesses.push(
            businessId
        );

    }


    saveData(
        DB.USERS,
        users
    );


    /*
    Update current session
    */

    const session =
        getCurrentUser();

    if(
        session &&
        session.id == userId
    ){

        session.businesses =
            user.businesses;

        login(session);

    }


    return true;

}
