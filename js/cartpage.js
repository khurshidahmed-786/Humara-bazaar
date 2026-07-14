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

let html = `

<div class="container">

<h1>

🛒 My Cart

</h1>

`;

cart.forEach(item=>{

const product = getProductById(

item.productId

);

if(!product){

return;

}

const subtotal =

Number(product.price) * item.quantity;

html += `

<div class="cartCard">

<div class="cartEmoji">

${product.emoji || "📦"}

</div>

<div class="cartInfo">

<h2>

${product.name}

</h2>

<p>

₹${product.price}

</p>

<p>

Quantity :
${item.quantity}

</p>

<p>

Subtotal :
₹${subtotal}

</p>

</div>

</div>

`;

});

html += `

</div>

`;

app.innerHTML = html;

}
