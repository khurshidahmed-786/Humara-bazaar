let quantity = 1;
let currentProduct = null;


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
    document.getElementById("productDelivery").innerText = "🚚 Delivery within 1-2 days";
    document.getElementById("productStock").innerText = "In Stock";


    /* SHOP INFO */

    const shop = await dbGetShop(product.shop_id);

    if(shop){

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
        window.location.href = "cart.html";
    };
}


function updateQuantity(){
    document.getElementById("quantity").innerText = quantity;
    document.getElementById("totalPrice").innerText = "₹" + (currentProduct.price * quantity);
}
