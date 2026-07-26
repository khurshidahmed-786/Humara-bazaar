let quantity = 1;
let currentProduct = null;
let currentShopIdForCart = null;


function getProductIdFromUrl(){
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}


document.addEventListener("DOMContentLoaded", function(){
    loadProductPage();
    bindEvents();
});


async function loadProductPage(){

    const id = getProductIdFromUrl();

    if(!id){
        document.getElementById("productName").innerText = "Product Not Found";
        return;
    }

    const product = await dbGetProductById(id);

    if(!product){
        document.getElementById("productName").innerText = "Product Not Found";
        return;
    }

    await renderProduct(product);
}


async function renderProduct(product){

    currentProduct = product;

    const imageEl = document.getElementById("productImage");
    if(product.image){
        imageEl.innerHTML = `<img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;">`;
    } else {
        imageEl.innerText = product.emoji || "📦";
    }

    document.getElementById("productName").innerText = product.name;
    document.getElementById("productPrice").innerText = "₹" + product.price;
    document.getElementById("totalPrice").innerText = "₹" + product.price;
    document.getElementById("productDescription").innerText = product.description || "No description provided.";

    if(product.mrp && product.mrp > product.price){
        const savings = product.mrp - product.price;
        document.getElementById("productDelivery").innerText = `MRP ₹${product.mrp} — You save ₹${savings}`;
    } else {
        document.getElementById("productDelivery").innerText = "";
    }

    const stockText = product.stock > 0
        ? `${product.stock} ${product.unit || "Piece"} Available`
        : "Out of Stock";

    document.getElementById("productStock").innerText = stockText;


    /* SHOP INFO */

    const shop = await dbGetShop(product.shop_id);

    if(shop){

        currentShopIdForCart = shop.id;

        document.getElementById("shopName").innerText = shop.name;

        const visitBtn = document.getElementById("visitShopBtn");
        if(visitBtn){
            visitBtn.onclick = function(){
                window.location.href = `shop.html?id=${shop.id}`;
            };
        }

        await renderRelatedProducts(shop.id, product.id);
    }
}


async function renderRelatedProducts(shopId, excludeId){

    const container = document.getElementById("relatedProducts");
    if(!container) return;

    let products = [];

    try {
        products = await dbGetProductsByShop(shopId);
    } catch(err) {
        console.error(err);
        return;
    }

    const related = products.filter(p => p.id != excludeId).slice(0, 4);

    if(related.length === 0){
        container.innerHTML = `<p style="color:#777;">No other products from this shop yet.</p>`;
        return;
    }

    container.innerHTML = "";

    related.forEach(product => {
        container.innerHTML += `
            <div class="product" onclick="window.location.href='product.html?id=${product.id}'">
                <div class="image">
                    ${
                        product.image
                        ? `<img src="${product.image}" alt="${product.name}">`
                        : (product.emoji || "📦")
                    }
                </div>
                <div class="info">
                    ${product.name}
                    <div class="price">₹${product.price}</div>
                </div>
            </div>
        `;
    });
}


function bindEvents(){

    document.getElementById("plusBtn").onclick = function(){
        quantity++;
        updateQuantity();
    };

    document.getElementById("minusBtn").onclick = function(){
        if(quantity > 1){
            quantity--;
            updateQuantity();
        }
    };

    document.getElementById("addCartBtn").onclick = function(){
        if(!currentProduct) return;
        addToCart(currentProduct.id, quantity);
        showAddedToCartModal();
    };
}


function showAddedToCartModal(){

    const overlay = document.createElement("div");
    overlay.style.cssText = `
        position:fixed; inset:0; background:rgba(0,0,0,0.5);
        display:flex; align-items:flex-end; justify-content:center;
        z-index:9999;
    `;

    overlay.innerHTML = `
        <div style="background:white; width:100%; max-width:480px; border-radius:20px 20px 0 0;
                    padding:28px 24px; text-align:center; font-family:Arial;">
            <div style="font-size:44px;">✅</div>
            <h2 style="margin:10px 0 6px; color:#345D2A;">Added to Cart</h2>
            <p style="color:#666; margin-bottom:20px;">${currentProduct.name} × ${quantity}</p>
            <div style="display:flex; gap:12px;">
                <button id="continueShoppingBtn"
                    style="flex:1; padding:14px; border-radius:12px; border:1px solid #ddd;
                           background:white; font-size:15px; cursor:pointer;">
                    Continue Shopping
                </button>
                <button id="viewCartBtn"
                    style="flex:1; padding:14px; border-radius:12px; border:none;
                           background:#B63A3A; color:white; font-size:15px; cursor:pointer;">
                    View Cart →
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("continueShoppingBtn").onclick = function(){
        if(currentShopIdForCart){
            window.location.href = `shop.html?id=${currentShopIdForCart}`;
        } else {
            document.body.removeChild(overlay);
        }
    };

    document.getElementById("viewCartBtn").onclick = function(){
        window.location.href = "cart.html";
    };
}


function updateQuantity(){
    document.getElementById("quantity").innerText = quantity;
    document.getElementById("totalPrice").innerText = "₹" + (currentProduct.price * quantity);
}
