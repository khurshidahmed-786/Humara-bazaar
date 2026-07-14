const CART_KEY = "hb_cart";

function getCart(){

    return getData(CART_KEY) || [];

}

function saveCart(cart){

    saveData(

        CART_KEY,

        cart

    );

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

}
function removeFromCart(productId){

    let cart = getCart();

    cart = cart.filter(

        item => item.productId != productId

    );

    saveCart(cart);

}
function clearCart(){

    saveCart([]);

}
