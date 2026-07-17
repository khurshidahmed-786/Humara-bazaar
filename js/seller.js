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
const orders = getOrders().filter(
    order => order.shopId == shop.id
);

const pendingOrders = orders.filter(
    order => order.status == "Pending"
).length;
<div class="sellerContainer">

<header class="sellerHeader">

<h1>

Seller Dashboard

</h1>

<p>

Managing

<strong>

${shop.name}

</strong>

</p>

<p>

Manage your business from one place.

</p>

</header>

<div class="shopCard">

<div style="display:flex;align-items:center;gap:20px;">

<img
src="${shop.logo || 'assets/shop-placeholder.png'}"
style="
width:90px;
height:90px;
border-radius:20px;
object-fit:cover;
background:#F3F3F3;
">

<div>

<div class="shopName">

🏪 ${shop.name}

</div>

<div style="margin-top:8px;color:#666;">

${shop.open || "8:00 AM"}
—

${shop.close || "8:00 PM"}

</div>

</div>

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

📦 Products

</div>

</div>

<div class="stat">

<div class="statValue">

${orders.length}

</div>

<div class="statLabel">

🛒 Orders

</div>

</div>

<div class="stat">

<div class="statValue">

New

</div>

<div class="statLabel">

⭐ Rating

</div>

</div>

<div class="stat">

<div class="statValue">

0

</div>

<div class="statLabel">

👀 Visitors

</div>

</div>

</div>

<div class="quickActions">

<div
class="actionCard"
onclick="location.href='addproduct.html'">

<div class="actionIcon">➕</div>

<div class="actionTitle">

Add Product

</div>

<div class="actionText">

Publish a new product

</div>

</div>

<div
class="actionCard"
onclick="location.href='myproducts.html'">

<div class="actionIcon">📦</div>

<div class="actionTitle">

My Products

</div>

<div class="actionText">

Manage products

</div>

</div>

<div
class="actionCard"
onclick="location.href='createshop.html'">

<div class="actionIcon">✏️</div>

<div class="actionTitle">

Edit Shop

</div>

<div class="actionText">

Update shop details

</div>

</div>

<div
class="actionCard"
onclick="location.href='sellerorders.html'">

<div class="actionIcon">

📦

</div>

<div class="actionTitle">

Incoming Orders

</div>

<div class="actionCard ${pendingOrders>0 ? 'newOrders' : ''}">

${pendingOrders} Pending Order(s)

</div>

</div>

<div class="actionCard">

<div class="actionIcon">📑</div>

<div class="actionTitle">

Orders

</div>

<div class="actionText">

Coming Soon

</div>

</div>

<div
class="actionCard"
onclick="openShop(shop.id)">

<div class="actionIcon">👁</div>

<div class="actionTitle">

View Shop

</div>

<div class="actionText">

See customer view

</div>

</div>
<h2 style="margin-top:50px;">

Recent Products

</h2>

<div id="recentProducts">

</div>
</div>

`;

}
