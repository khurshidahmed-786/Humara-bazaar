const app = document.getElementById("sellerApp");

const shop = getCurrentShop();

if(!shop){

    app.innerHTML = `

    <div class="sellerContainer">

        <div class="shopCard">

            <h2>No Shop Found</h2>

            <p>
                Create your first shop to start selling.
            </p>

            <br>

            <a
            href="createshop.html">

            Create Shop →

            </a>

        </div>

    </div>

    `;

}else{

    renderDashboard(shop);

}
function renderDashboard(shop){

const products = getProductsByShop(shop.id);

app.innerHTML = `

<div class="sellerContainer">

<header class="sellerHeader">

<h1>

Welcome,
${shop.name}

</h1>

<p>

Manage your business from one place.

</p>

</header>

<div class="shopCard">

<div class="shopName">

${shop.name}

</div>

<div class="shopDescription">

${shop.description || "No description yet."}

</div>

</div>

<div class="stats">

<div class="stat">

<div class="statValue">

${products.length}

</div>

<div class="statLabel">

Products

</div>

</div>

<div class="stat">

<div class="statValue">

0

</div>

<div class="statLabel">

Orders

</div>

</div>

<div class="stat">

<div class="statValue">

0

</div>

<div class="statLabel">

Customers

</div>

</div>

</div>

<div class="quickActions">

<div
class="actionCard"
onclick="location.href='addproduct.html'">

<div class="actionIcon">

➕

</div>

<div class="actionTitle">

Add Product

</div>

<div class="actionText">

Publish a new product.

</div>

</div>

<div
class="actionCard"
onclick="location.href='createshop.html'">

<div class="actionIcon">

✏️

</div>

<div class="actionTitle">

Edit Shop

</div>

<div class="actionText">

Update shop details.

</div>

</div>

<div
class="actionCard">

<div class="actionIcon">

📦

</div>

<div class="actionTitle">

Orders

</div>

<div class="actionText">

Coming Soon

</div>

</div>

<div
class="actionCard">

<div class="actionIcon">

📊

</div>

<div class="actionTitle">

Analytics

</div>

<div class="actionText">

Coming Soon

</div>

</div>

</div>

</div>

`;

}
