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

<div class="cartTotal">

<h2>

Grand Total

</h2>

<h1>

₹${getCartTotal()}

</h1>
html += `

<button
class="checkoutBtn">

Proceed to Checkout →

</button>

`;
</div>

`;
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
<div class="quantityBox">

<button
onclick="changeQty(${product.id},-1)">

−

</button>

<span>

${item.quantity}

</span>

<button
onclick="changeQty(${product.id},1)">

+

</button>

</div>
function changeQty(productId, change){

    const cart = getCart();

    const item = cart.find(

        i => i.productId == productId

    );

    if(!item){

        return;

    }

    item.quantity += change;

    if(item.quantity < 1){

        item.quantity = 1;

    }

    saveCart(cart);

    renderCart();

}
<p>

Subtotal :
₹${subtotal}

</p>
<br>

<button
onclick="deleteCartItem(${product.id})">

🗑 Remove

</button>
</div>

</div>

`;

});

html += `

</div>

`;

app.innerHTML = html;

}
function deleteCartItem(productId){

    removeFromCart(productId);

    renderCart();

}
