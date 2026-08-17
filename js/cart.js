const CART_KEY = "hb_cart";

function getCart(){
    return getData(CART_KEY) || [];
}

function saveCart(cart){
    saveData(CART_KEY, cart);
    updateCartBadge();
}

function showCartAddedFeedback(){
    if (navigator.vibrate) {
        try { navigator.vibrate(40); } catch(e) {}
    }

    let toast=document.getElementById("hbCartAddedToast");

    if(!toast){
        toast=document.createElement("div");
        toast.id="hbCartAddedToast";
        toast.style.cssText=`
            position:fixed;
            left:50%;
            bottom:86px;
            transform:translateX(-50%) translateY(15px);
            background:#345D2A;
            color:white;
            padding:12px 18px;
            border-radius:999px;
            font:600 14px Arial,sans-serif;
            box-shadow:0 8px 24px rgba(0,0,0,.18);
            z-index:10000;
            opacity:0;
            pointer-events:none;
            transition:opacity .18s ease,transform .18s ease;
            white-space:nowrap;
        `;
        document.body.appendChild(toast);
    }

    toast.textContent="✓ Added to cart";

    requestAnimationFrame(()=>{
        toast.style.opacity="1";
        toast.style.transform="translateX(-50%) translateY(0)";
    });

    clearTimeout(window.__hbCartToastTimer);

    window.__hbCartToastTimer=setTimeout(()=>{
        toast.style.opacity="0";
        toast.style.transform="translateX(-50%) translateY(15px)";
    },1400);
}

function addToCart(productId, quantity){
    let cart=getCart();
    const amount=Math.max(1,Number(quantity)||1);
    const item=cart.find(item=>item.productId==productId);

    if(item) item.quantity+=amount;
    else cart.push({productId,quantity:amount});

    saveCart(cart);
    showCartAddedFeedback();

    window.dispatchEvent(new CustomEvent("hb:cart-added",{
        detail:{productId,quantity:amount}
    }));
}

function removeFromCart(productId){
    let cart=getCart();
    cart=cart.filter(item=>item.productId!=productId);
    saveCart(cart);
}

function clearCart(){
    saveCart([]);
}

function updateCartQuantity(productId, quantity){
    let cart=getCart();
    const item=cart.find(item=>item.productId==productId);

    if(item){
        item.quantity=Math.max(1,Number(quantity)||1);
    }

    saveCart(cart);
}

function getCartTotal(){
    let total=0;
    const cart=getCart();

    cart.forEach(item=>{
        const product=getProductById(item.productId);
        if(product){
            total+=Number(product.price)*item.quantity;
        }
    });

    return total;
}
