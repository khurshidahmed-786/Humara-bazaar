document.addEventListener(

"DOMContentLoaded",

function(){

renderCart();

});
function renderCart(){

const app = document.getElementById(

"cartApp"

);

const cart = getCart();

if(cart.length===0){

app.innerHTML=`

<div class="container">

<h1>

🛒 My Cart

</h1>

<br>

<p>

Your cart is empty.

</p>

</div>

`;

return;

}

}
