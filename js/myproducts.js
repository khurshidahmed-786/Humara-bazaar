const app = document.getElementById(

"productsApp"

);

app.innerHTML = `

<div class="container">

<div class="header">

<div class="title">

My Products

</div>

<div
class="addBtn"
onclick="location.href='addproduct.html'">

➕ Add Product

</div>

</div>

<div
class="products"
id="productList">

</div>

</div>

`;
const shop = getCurrentShop();

const list = document.getElementById(

"productList"

);

if(!shop){

list.innerHTML=`

<div class="productCard">

No shop found.

</div>

`;

}else{

renderProducts();

}
function renderProducts(){

const products = getProductsByShop(

shop.id

);

if(products.length===0){

list.innerHTML=`

<div class="productCard">

<h2>

No Products Yet

</h2>

<br>

<p>

Click "Add Product" to publish your first product.

</p>

</div>

`;

return;

}

list.innerHTML="";

products.forEach(product=>{

list.innerHTML+=`

<div class="productCard">

<h2>

${product.emoji || "📦"}

${product.name}

</h2>

<br>

<div>

₹${product.price}

</div>

<br>

<div>

${product.section}

</div>

<br>

<div style="display:flex;gap:12px;">

<button>

✏ Edit

</button>

<button>

👁 Active

</button>

<button
onclick="removeProduct(${product.id})">

🗑 Delete

</button>

</div>

</div>

`;

});

}
function removeProduct(id){

    const ok = confirm(

        "Delete this product?"

    );

    if(!ok){

        return;

    }

    deleteProduct(id);

    renderProducts();

}
