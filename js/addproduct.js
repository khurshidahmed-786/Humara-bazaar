let selectedImageFile = null;


document.addEventListener("DOMContentLoaded", function(){

    const fileInput = document.getElementById("productImageFile");

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
            featured: true,
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
