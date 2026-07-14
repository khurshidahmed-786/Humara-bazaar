function getPendingOrders(shopId){

    return getOrders().filter(

        order =>

        order.shopId == shopId &&

        order.status == "Pending"

    );

}

function updateOrderStatus(id,status){

    const orders = getOrders();

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
