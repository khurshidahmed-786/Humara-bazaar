const app = document.getElementById("productsApp");

let shopGlobal = null;
let productsGlobal = [];
let editingId = null;


app.innerHTML = `
<div class="container">

    <div class="header">
        <div class="title">My Products</div>
        <div class="addBtn" onclick="location.href='addproduct.html'">➕ Add Product</div>
    </div>

    <div class="products" id="productList"></div>

</div>
`;

const list = document.getElementById("productList");


async function init(){

    const activeBusinessId = localStorage.getItem("hb_activeBusiness");

    if(!activeBusinessId){
        list.innerHTML = `<div class="productCard">No business selected. <a href="role.html">Go to My Business</a></div>`;
        return;
    }

    const business = await dbGetBusinessById(activeBusinessId);

    if(!business){
        list.innerHTML = `<div class="productCard">No business found.</div>`;
        return;
    }

    shopGlobal = await dbGetShopByBusinessId(business.id);

    if(!shopGlobal){
        list.innerHTML = `<div class="productCard">No shop found. <a href="createshop.html">Complete shop setup</a></div>`;
        return;
    }

    await renderProducts();
}


async function renderProducts(){

    try {
        productsGlobal = await dbGetAllProductsByShop(shopGlobal.id);
    } catch(err) {
        console.error(err);
        list.innerHTML = `<div class="productCard">Failed to load products.</div>`;
        return;
    }

    if(productsGlobal.length === 0){
        list.innerHTML = `
            <div class="productCard">
                <h2>No Products Yet</h2>
                <br>
                <p>Click "Add Product" to publish your first product.</p>
            </div>
        `;
        return;
    }

    list.innerHTML = "";

    productsGlobal.forEach(product => {

        if(editingId === product.id){

            list.innerHTML += `
                <div class="productCard">
                    <input id="editName_${product.id}" value="${product.name}" style="width:100%; padding:8px; margin-bottom:8px;">
                    <input id="editPrice_${product.id}" value="${product.price}" type="number" style="width:100%; padding:8px; margin-bottom:8px;">
                    <div style="display:flex; gap:12px;">
                        <button onclick="saveEdit(${product.id})">💾 Save</button>
                        <button onclick="cancelEdit()">✖ Cancel</button>
                    </div>
                </div>
            `;

        } else {

            list.innerHTML += `
                <div class="productCard">
                    <h2>${product.emoji || "📦"} ${product.name}</h2>
                    <br>
                    <div>₹${product.price}</div>
                    <br>
                    <div>${product.active ? "🟢 Active" : "⚪ Hidden"}</div>
                    <br>
                    <div style="display:flex; gap:12px;">
                        <button onclick="startEdit(${product.id})">✏ Edit</button>
                        <button onclick="toggleActive(${product.id})">${product.active ? "🙈 Hide" : "👁 Show"}</button>
                        <button onclick="removeProduct(${product.id})">🗑 Delete</button>
                    </div>
                </div>
            `;
        }
    });
}


function startEdit(id){
    editingId = id;
    renderProducts();
}

function cancelEdit(){
    editingId = null;
    renderProducts();
}

async function saveEdit(id){

    const name = document.getElementById(`editName_${id}`).value.trim();
    const price = Number(document.getElementById(`editPrice_${id}`).value);

    if(!name || !price || price <= 0){
        alert("Please enter a valid name and price.");
        return;
    }

    try {
        await dbUpdateProduct(id, { name, price });
        editingId = null;
        await renderProducts();
    } catch(err) {
        console.error(err);
        alert("Failed to update product: " + err.message);
    }
}


async function toggleActive(id){

    const product = productsGlobal.find(p => p.id === id);

    try {
        await dbUpdateProduct(id, { active: !product.active });
        await renderProducts();
    } catch(err) {
        console.error(err);
        alert("Failed to update product: " + err.message);
    }
}


async function removeProduct(id){

    const ok = confirm("Delete this product?");
    if(!ok) return;

    try {
        await dbDeleteProduct(id);
        await renderProducts();
    } catch(err) {
        console.error(err);
        alert("Failed to delete product: " + err.message);
    }
}


init();
