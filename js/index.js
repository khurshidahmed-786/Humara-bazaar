console.log("Index JS Loaded");
let selectedCategory = "";
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
const searchInput =
document.getElementById("searchInput");

if(searchInput){

searchInput.addEventListener(

"keydown",

function(e){

if(e.key==="Enter"){

window.location.href=
"search.html?q="+
encodeURIComponent(
searchInput.value
);

}

});

}
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

   let products = getFeaturedProducts();

if(selectedCategory !== ""){

    products = products.filter(

        product => product.category === selectedCategory

    );

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

function filterCategory(categoryName){

    selectedCategory = categoryName;

    renderFeaturedProducts();

    highlightCategory(categoryName);

}
function highlightCategory(categoryName){

    document.querySelectorAll(".categoryCard").forEach(card=>{

        card.classList.remove("active");

    });

    document.querySelectorAll(".categoryCard").forEach(card=>{

        const name = card.querySelector(".categoryName").innerText;

        if(name===categoryName){

            card.classList.add("active");

        }

    });

}
