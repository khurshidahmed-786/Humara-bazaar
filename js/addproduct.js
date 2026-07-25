async function publishProduct(){

    const shopId = localStorage.getItem("hb_selectedShop");

    if(!shopId){
        alert("Please create a shop first.");
        window.location.href = "role.html";
        return;
    }

    const shop = await dbGetShop(shopId);

    if(!shop){
        alert("Please create a shop first.");
        window.location.href = "role.html";
        return;
    }

    const name = document.getElementById("productName").value.trim();
    const price = Number(document.getElementById("productPrice").value);

    if(!name){
        alert("Please enter a product name.");
        return;
    }

    if(!price || price <= 0){
        alert("Please enter a valid price.");
        return;
    }

    const publishBtn = document.getElementById("publishBtn");
    publishBtn.style.pointerEvents = "none";
    publishBtn.innerText = "Publishing...";

    const product = {
        shop_id: shop.id,
        name: name,
        price: price,
        description: document.getElementById("productDescription").value.trim(),
        emoji: document.getElementById("productEmoji").value || "📦",
        category: document.getElementById("productCategory").value,
        featured: true,
        active: true
    };

    try {

        await dbSaveProduct(product);

        alert("Product Published Successfully!");

        setTimeout(function(){
            window.location.href = "dashboard.html";
        }, 500);

    } catch(err) {

        console.error(err);
        alert("Something went wrong publishing your product: " + err.message);

        publishBtn.style.pointerEvents = "auto";
        publishBtn.innerText = "➕ Publish Product";
    }
}
