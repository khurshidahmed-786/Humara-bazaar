function getOrders(){

    return getData(DB.ORDERS);

}

function saveOrder(order){

    let orders = getOrders();

    orders.push(order);

    saveData(DB.ORDERS, orders);

}

function getPendingOrders(shopId){

    return getOrders().filter(

        order =>

        order.shopId == shopId &&

        order.status == "Pending"

    );

}

function updateOrderStatus(id,status){

    let orders = getOrders();

    const order = orders.find(

        o => o.id == id

    );

    if(order){

        order.status = status;

    }

    saveData(DB.ORDERS, orders);

}
