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

      app.innerHTML = `

<div class="emptyCart">

    <div style="font-size:80px;">

        🛒

    </div>

    <h2>

        Your Cart is Empty

    </h2>

    <p>

        Add products from your favourite shops.

    </p>

    <a href="index.html">

        Continue Shopping

    </a>

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

        Number(product.price) *

        item.quantity;

        html += `

        <div class="cartCard">

<div class="cartTop">

<div>

<div class="cartName">

${product.emoji || "📦"} ${product.name}

</div>

<div class="cartShop">

Shop #${product.shopId}

</div>

</div>

<div class="cartPrice">

₹${product.price}

</div>

</div>

<div class="qtyRow">

<button
class="qtyBtn"
onclick="changeQty(${product.id},-1)">

−

</button>

<div class="qtyNumber">

${item.quantity}

</div>

<button
class="qtyBtn"
onclick="changeQty(${product.id},1)">

+

</button>

</div>

<div style="margin-top:18px;">

Subtotal :

<b>

₹${subtotal}

</b>

</div>

<button
class="removeBtn"
onclick="deleteCartItem(${product.id})">

🗑 Remove

</button>

</div>
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

 <div class="summary">

<div class="summaryRow">

<span>

Items Total

</span>

<span>

₹${getCartTotal()}

</span>

</div>

<div class="summaryRow">

<span>

Delivery

</span>

<span>

₹30

</span>

</div>

<hr style="margin:18px 0;">

<div class="summaryRow summaryTotal">

<span>

Total

</span>

<span>

₹${getCartTotal()+30}

</span>

</div>

<button
class="checkoutBtn"
onclick="location.href='checkout.html'">

Proceed to Checkout →

</button>

</div>

    `;

    app.innerHTML = html;

}

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

function deleteCartItem(productId){

    removeFromCart(productId);

    renderCart();

}
