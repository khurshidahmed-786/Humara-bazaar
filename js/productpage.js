document.addEventListener(

"DOMContentLoaded",

function(){

loadProductPage();

});
function loadProductPage(){

const id = Number(

localStorage.getItem(

"hb_selectedProduct"

)

);

const product = getProductById(id);

if(!product){

document.getElementById(

"productName"

).innerText =

"Product Not Found";

return;

}

renderProduct(product);

}
function renderProduct(product){

document.getElementById(

"productImage"

).innerText =

product.emoji || "📦";

document.getElementById(

"productName"

).innerText =

product.name;

document.getElementById(

"productPrice"

).innerText =

"₹" + product.price;

document.getElementById(

"totalPrice"

).innerText =

"₹" + product.price;

document.getElementById(

"productDescription"

).innerText =

product.description;

document.getElementById(

"productDelivery"

).innerText =

product.deliveryTime;

document.getElementById(

"productStock"

).innerText =

product.stock + " " + product.unit + " Available";

const shop = getShop(product.shopId);

if(shop){

document.getElementById(

"shopName"

).innerText =

shop.name;

}

}
