console.log("Index JS Loaded");
console.log(categories);
const menuBtn = document.getElementById(

"menuBtn"

);

if(menuBtn){

    menuBtn.onclick = function(){

        alert(

            "Menu Coming Soon"

        );

    };

}
const pin = localStorage.getItem("pincode");

let market = "Your Local Market";

if(pin==="185121"){

    market="Surankote Bazaar";

}

document.getElementById(

"marketName"

).innerText = market;
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener(

"input",

function(){

console.log(

"Searching:",

this.value

);

});
const categoryWrap = document.getElementById("categoryScroll");

console.log(categoryWrap);

categories.forEach(category=>{

categoryWrap.innerHTML += `

<div
class="categoryCard"
onclick="filterCategory('${category.name}')">

<div class="categoryIcon">

${category.icon}

</div>

<div class="categoryName">

${category.name}

</div>

</div>

`;

});
function renderFeaturedProducts(){

    const wrap = document.getElementById(

        "featuredProducts"

    );

    if(!wrap){

        return;

    }

    wrap.innerHTML="";

    const products = getFeaturedProducts();

    if(products.length===0){

        wrap.innerHTML=`

        <div class="productCard">

            <div class="productImage">

                📦

            </div>

            <div class="productBody">

                <div class="productName">

                    No Products Yet

                </div>

                <div class="productShop">

                    Sellers will appear here

                </div>

            </div>

        </div>

        `;

        return;

    }

    products.forEach(product=>{

        wrap.innerHTML+=`

       <div
class="productCard"
onclick="openProduct(${product.id})">

            <div class="productBody">

                <div class="productName">

                    ${product.name}

                </div>

                <div class="productShop">

                    Shop #${product.shopId}

                </div>

                <div class="productPrice">

                    ₹${product.price}

                </div>

            </div>

        </div>

        `;

    });

}
renderFeaturedProducts();
function renderPopularShops(){

const wrap=document.getElementById(

"shopScroll"

);

if(!wrap){

return;

}

wrap.innerHTML="";

const shops=getAllShops();

if(shops.length===0){

wrap.innerHTML=`

<div class="productCard">

<div class="productImage">

🏪

</div>

<div class="productBody">

<div class="productName">

No Shops Yet

</div>

<div class="productShop">

Be the first seller.

</div>

</div>

</div>

`;

return;

}

shops.forEach(shop=>{

wrap.innerHTML += `

<div
class="productCard"
onclick="openShop(${shop.id})">

<div class="productImage">

🏪

</div>

<div class="productBody">

<div class="productName">

${shop.name}

</div>

<div class="productShop">

${shop.description || "Local Shop"}

</div>

</div>

</div>

`;

});

}
function openShop(id){

localStorage.setItem(

"hb_selectedShop",

id

);

window.location.href="shop.html";

}
function openProduct(productId){

    localStorage.setItem(

        "hb_selectedProduct",

        productId

    );

    window.location.href = "product.html";

}
renderFeaturedProducts();

renderPopularShops();
let selectedCategory = "";

function filterCategory(categoryName){

    selectedCategory = categoryName;

    renderFeaturedProducts();

    console.log("Selected:", categoryName);

}
