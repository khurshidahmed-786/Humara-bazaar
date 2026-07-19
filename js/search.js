document.addEventListener(

"DOMContentLoaded",

function(){

renderSearch();
const input = document.getElementById("searchInput");

input.addEventListener("input",function(){

const value = input.value.trim();

history.replaceState(

{},

"",

"?q="+encodeURIComponent(value)

);

renderSearch();

});
});
function renderSearch(){

const params =
new URLSearchParams(window.location.search);

const query = (params.get("q") || "").toLowerCase();
document.getElementById("searchInput").value = query;
const results =
document.getElementById(
"searchResults"
);
const products =
getProducts().filter(
product=>
product.name
.toLowerCase()
.includes(query)
);
const shops = getShops().filter(shop=>

shop.name .toLowerCase() .includes(query));
if(

products.length===0 &&

shops.length===0

){

results.innerHTML=`

<div class="emptyBox">

<h2>

🔍 No Results

</h2>

<p>

Try another keyword.

</p>

</div>

`;

return;}
let html = "";

if(products.length){

html += `

<h2 class="sectionTitle">

📦 Products

</h2>

`;

products.forEach(product=>{

html += `

<div class="resultCard">

<div class="resultTop">

<div>

<h3>

${product.emoji || "📦"} ${product.name}

</h3>

<p>

₹${product.price}

</p>

</div>

<button
class="primaryBtn"
onclick="openProduct(${product.id})">

View

</button>

</div>

</div>

`;

});

}
if(shops.length){

html += `

<h2 class="sectionTitle">

🏪 Shops

</h2>

`;

shops.forEach(shop=>{

html += `

<div class="resultCard">

<div class="resultTop">

<div>

<h3>

🏪 ${shop.name}

</h3>

<p>

${shop.description || "Local Shop"}

</p>

</div>

<button
class="primaryBtn"
onclick="openShop(${shop.id})">

Visit

</button>

</div>

</div>

`;

});

}
results.innerHTML = html;
}
