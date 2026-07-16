document.addEventListener(

"DOMContentLoaded",

function(){

const btn=document.getElementById(

"placeOrderBtn"

);

btn.onclick=placeOrder;

});

function placeOrder(){

const name=document.getElementById(

"customerName"

).value;

const phone=document.getElementById(

"customerPhone"

).value;

const cart = getCart();

const firstProduct = getProductById(cart[0].productId);

const order = {

    id: Date.now(),

    shopId: firstProduct.shopId,

    customerName: name,

    customerPhone: phone,

    customerAddress: address,

    items: cart,

    total: getCartTotal(),

    status: "Pending",

    createdAt: new Date().toISOString()

};
saveOrder(order);

clearCart();

alert(

"Order Placed Successfully!"

);

window.location.href="orders.html";

}
