let selectedImageFile = null;


document.addEventListener("DOMContentLoaded", function(){

    const fileInput = document.getElementById("productImageFile");

    loadCategoryOptions();

    fileInput.addEventListener("change", function(e){

        const file = e.target.files[0];
        if(!file) return;

        selectedImageFile = file;

        const reader = new FileReader();

        reader.onload = function(event){
            const preview = document.getElementById("imagePreview");
            preview.src = event.target.result;
            preview.style.display = "block";
            document.getElementById("imagePlaceholderText").style.display = "none";
        };

        reader.readAsDataURL(file);
    });

});


async function loadCategoryOptions(){

    const select = document.getElementById("productCategory");

    let categories = [];

    try {
        categories = await dbGetActiveCategories();
    } catch(err) {
        console.error("Failed to load categories:", err);
    }

    select.innerHTML = "";

    categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.name;
        opt.textContent = cat.name;
        select.appendChild(opt);
    });

    const suggestOpt = document.createElement("option");
    suggestOpt.value = "__suggest_new__";
    suggestOpt.textContent = "+ Suggest a new category";
    select.appendChild(suggestOpt);

    select.onchange = async function(){

        if(select.value !== "__suggest_new__") return;

        const name = prompt("What category would you like to suggest? A Tehsil Admin will review it before it appears everywhere.");

        if(!name || !name.trim()){
            select.value = categories.length > 0 ? categories[0].name : "";
            return;
        }

        try {
            await dbSuggestCategory(name.trim());
            alert(`"${name.trim()}" has been submitted for review. Please pick an existing category for this product for now.`);
        } catch(err) {
            console.error(err);
            alert(err.message || "Could not submit that suggestion.");
        }

        select.value = categories.length > 0 ? categories[0].name : "";
    };

}


async function publishProduct(){

    const publishBtn = document.getElementById("publishBtn");

    try {

        /* ----- RESOLVE THE SELLER'S SHOP ----- */

        const activeBusinessId = localStorage.getItem("hb_activeBusiness");

        if(!activeBusinessId){
            alert("Please select a business first.");
            window.location.href = "role.html";
            return;
        }

        const business = await dbGetBusinessById(activeBusinessId);

        if(!business){
            alert("Please select a business first.");
            window.location.href = "role.html";
            return;
        }

        const shop = await dbGetShopByBusinessId(business.id);

        if(!shop){
            alert("Please complete your shop setup first.");
            window.location.href = "createshop.html";
            return;
        }


        /* ----- VALIDATE FORM ----- */

        const name = document.getElementById("productName").value.trim();
        const price = Number(document.getElementById("productPrice").value);
        const mrpRaw = document.getElementById("productMrp").value;
        const mrp = mrpRaw ? Number(mrpRaw) : null;
        const stock = Number(document.getElementById("productStock").value) || 0;
        const unit = document.getElementById("productUnit").value;

        if(!name){
            alert("Please enter a product name.");
            return;
        }

        if(!price || price <= 0){
            alert("Please enter a valid price.");
            return;
        }

        if(mrp && mrp < price){
            alert("MRP should not be lower than the selling price.");
            return;
        }


        publishBtn.style.pointerEvents = "none";
        publishBtn.innerText = "Publishing...";


        /* ----- UPLOAD IMAGE (IF ANY) ----- */

        let imageUrl = null;

        if(selectedImageFile){

            publishBtn.innerText = "Uploading photo...";

            imageUrl = await dbUploadProductImage(selectedImageFile, shop.id);
        }


        /* ----- SAVE PRODUCT ----- */

        publishBtn.innerText = "Saving...";

        const product = {
            shop_id: shop.id,
            name: name,
            price: price,
            mrp: mrp,
            stock: stock,
            unit: unit,
            description: document.getElementById("productDescription").value.trim(),
            category: document.getElementById("productCategory").value,
            section: document.getElementById("productSection").value,
            image: imageUrl,
            /* BUGFIX: this was hardcoded to `true` for every single product ever
               created, regardless of what the seller picked in the Section
               dropdown above. That made the "Featured" flag meaningless (every
               product qualified) and had nothing to do with the dropdown's
               value. Now it only becomes featured when the seller actually
               chose "⭐ Featured" in that dropdown. */
            featured: document.getElementById("productSection").value === "featured",
            active: true
        };

        await dbSaveProduct(product);

        localStorage.setItem("hb_selectedShop", shop.id);

        alert("Product Published Successfully!");

        window.location.href = "dashboard.html";

    } catch(err) {

        console.error("Publish product failed:", err);
        alert("Something went wrong publishing your product:\n\n" + (err.message || err));

        publishBtn.style.pointerEvents = "auto";
        publishBtn.innerText = "➕ Publish Product";
    }
}
