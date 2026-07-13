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
