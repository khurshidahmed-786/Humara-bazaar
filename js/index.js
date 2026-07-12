console.log("Index JS Loaded");
console.log(categories);
document.getElementById(

"menuBtn"

).onclick=function(){

alert(

"Menu Coming Soon"

);

};
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
onclick="window.location.href='${category.page}'">

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

}
