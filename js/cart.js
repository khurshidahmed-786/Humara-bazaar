const CART_KEY = "hb_cart";

function getCart(){

    return getData(CART_KEY) || [];

}

function saveCart(cart){

    saveData(

        CART_KEY,

        cart

    );
updateCartBadge();
}
function addToCart(productId, quantity){

    let cart = getCart();

    const item = cart.find(

        item => item.productId == productId

    );

    if(item){

        item.quantity += quantity;

    }else{

        cart.push({

            productId,

            quantity

        });

    }

    saveCart(cart);
updateCartBadge();
}
function removeFromCart(productId){

    let cart = getCart();

    cart = cart.filter(

        item => item.productId != productId

    );

    saveCart(cart);
updateCartBadge();
}
function clearCart(){

    saveCart([]);
updateCartBadge();
}
function updateCartQuantity(productId, quantity){

    let cart = getCart();

    const item = cart.find(

        item => item.productId == productId

    );

    if(item){

        item.quantity = quantity;

    }

    saveCart(cart);
updateCartBadge();
}

function getCartTotal(){

    let total = 0;

    const cart = getCart();

    cart.forEach(item=>{

        const product = getProductById(

            item.productId

        );

        if(product){

            total +=

            Number(product.price) *

            item.quantity;

        }

    });

    return total;

}
