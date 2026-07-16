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

const address=document.getElementById(

"customerAddress"

).value;

if(

name==="" ||

phone==="" ||

address===""

){

alert(

"Please fill all details."

);

return;

}

const order={

id:Date.now(),

customerName:name,

customerPhone:phone,

customerAddress:address,

items:getCart(),

total:getCartTotal(),

status:"Pending",

createdAt:new Date().toISOString()

};

saveOrder(order);

saveCart([]);

alert(

"Order Placed Successfully!"

);

window.location.href="orders.html";

}
