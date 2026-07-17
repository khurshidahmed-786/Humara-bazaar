document.addEventListener(

"DOMContentLoaded",

function(){

renderSearch();

});
function renderSearch(){

}
const params =
new URLSearchParams(

window.location.search

);

const query =
(params.get("q") || "")
.toLowerCase();
document.getElementById(

"searchInput"

).value=query;
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
const shops =
getShops().filter(

shop=>

shop.name
.toLowerCase()
.includes(query)

);
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

return;

}
