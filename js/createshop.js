/* ==========================================
   HAMARA BAZAAR
   CREATE / EDIT SHOP ENGINE
========================================== */


/* ==========================================
   AUTH CHECK
========================================== */

/* Real Supabase user, filled in below (async).
   publishBtn.onclick checks this before allowing a submit. */
let realCurrentUser = null;

(async function checkAuth(){

    realCurrentUser = await authGetCurrentUser();

    if(!realCurrentUser){

        alert(
            "Please login to manage your business."
        );

        window.location.href =
            "login.html";

    }

})();


/* ==========================================
   EDIT MODE
========================================== */

const params =
    new URLSearchParams(
        window.location.search
    );

const editMode =
    params.get("edit") === "true";


/* ==========================================
   CURRENT DATA
========================================== */

let activeBusiness = null;

let existingShop = null;

/* Uploaded image URLs (set once a file finishes uploading to
   Supabase Storage). Start as null so we know whether the user
   picked a new file vs. is keeping whatever was already saved. */
let uploadedLogoUrl = null;
let uploadedBannerUrl = null;


/* ==========================================
   PAGE ELEMENTS
========================================== */

let currentStep = 1;

const totalSteps = 4;

const steps =
    document.querySelectorAll(
        ".step"
    );

const backBtn =
    document.getElementById(
        "backBtn"
    );

const nextBtn =
    document.getElementById(
        "nextBtn"
    );

const publishArea =
    document.getElementById(
        "publishArea"
    );

const publishBtn =
    document.getElementById(
        "publishBtn"
    );

const progressFill =
    document.getElementById(
        "progressFill"
    );

const stepText =
    document.getElementById(
        "stepText"
    );

const stepTitle =
    document.getElementById(
        "stepTitle"
    );


/* ==========================================
   INPUTS
========================================== */

const shopNameInput =
    document.getElementById(
        "shopName"
    );

const shopCategoryInput =
    document.getElementById(
        "shopCategory"
    );

const shopDescriptionInput =
    document.getElementById(
        "shopDescription"
    );

const shopOpenInput =
    document.getElementById(
        "shopOpen"
    );

const shopCloseInput =
    document.getElementById(
        "shopClose"
    );

/* These are now FILE inputs, not text inputs */
const shopLogoInput =
    document.getElementById(
        "shopLogo"
    );

const shopBannerInput =
    document.getElementById(
        "shopBanner"
    );

const shopLogoPreview =
    document.getElementById(
        "shopLogoPreview"
    );

const shopBannerPreview =
    document.getElementById(
        "shopBannerPreview"
    );

const shopLogoStatus =
    document.getElementById(
        "shopLogoStatus"
    );

const shopBannerStatus =
    document.getElementById(
        "shopBannerStatus"
    );


/* ==========================================
   PAGE TEXT
========================================== */

const pageTitle =
    document.getElementById(
        "pageTitle"
    );

const pageSubtitle =
    document.getElementById(
        "pageSubtitle"
    );


/* ==========================================
   EDIT MODE UI
========================================== */

if(editMode){

    pageTitle.innerText =
        "✏️ Edit Your Business";

    pageSubtitle.innerText =
        "Update your business information. Your existing details are already saved.";

    publishBtn.innerText =
        "💾 Save Changes";

}


/* ==========================================
   LOAD EXISTING DATA
========================================== */

(async function loadEditData(){

    if(!editMode) return;

    const activeBusinessId = localStorage.getItem("hb_activeBusiness");

    activeBusiness = activeBusinessId
        ? await dbGetBusinessById(activeBusinessId)
        : null;

    if(!activeBusiness){
        alert("No active business found.");
        window.location.href = "role.html";
        return;
    }

    existingShop = await dbGetShopByBusinessId(activeBusiness.id);

    if(!existingShop){
        alert("Shop not found.");
        window.location.href = "role.html";
        return;
    }

    shopNameInput.value = existingShop.name || "";
    shopCategoryInput.value = existingShop.category || "";
    shopDescriptionInput.value = existingShop.description || "";

    /* parseTimeTo24Hour (js/shopStatus.js) also handles shops saved
       under the old free-text time format, e.g. "8:00 AM" */
    shopOpenInput.value = parseTimeTo24Hour(existingShop.open_time || "");
    shopCloseInput.value = parseTimeTo24Hour(existingShop.close_time || "");

    /* Existing logo/banner are shown as previews. They stay as-is
       unless the shopkeeper picks a new file. */
    if(existingShop.logo){
        shopLogoPreview.innerHTML = `<img src="${existingShop.logo}" alt="Shop logo">`;
    }

    if(existingShop.banner){
        shopBannerPreview.style.backgroundImage = `url("${existingShop.banner}")`;
        shopBannerPreview.style.backgroundSize = "cover";
        shopBannerPreview.style.backgroundPosition = "center";
    }

    updatePreview();

})();


/* ==========================================
   STEP TITLES
========================================== */

const titles = [

    "Shop Identity",

    "Business Details",

    "Branding",

    "Preview"

];


/* ==========================================
   SHOW STEP
========================================== */

function showStep(){

    steps.forEach(step => {

        step.classList.remove(
            "active"
        );

    });


    document.getElementById(

        "step" + currentStep

    ).classList.add(

        "active"

    );


    stepText.innerText =

        `Step ${currentStep} of ${totalSteps}`;


    stepTitle.innerText =

        titles[
            currentStep - 1
        ];


    progressFill.style.width =

        (
            currentStep /
            totalSteps
        ) * 100 + "%";


    backBtn.style.display =

        currentStep === 1

        ? "none"

        : "block";


    if(currentStep === totalSteps){

        nextBtn.style.display =
            "none";

        publishArea.style.display =
            "block";

    }

    else{

        nextBtn.style.display =
            "block";

        publishArea.style.display =
            "none";

    }

}


/* ==========================================
   PREVIEW
========================================== */

const previewName =
    document.getElementById(
        "previewName"
    );

const previewDescription =
    document.getElementById(
        "previewDescription"
    );

const previewTime =
    document.getElementById(
        "previewTime"
    );

const previewLogo =
    document.getElementById(
        "previewLogo"
    );

const previewBanner =
    document.getElementById(
        "previewBanner"
    );


function currentLogoUrl(){

    if(uploadedLogoUrl !== null) return uploadedLogoUrl;
    return (existingShop && existingShop.logo) || "";

}

function currentBannerUrl(){

    if(uploadedBannerUrl !== null) return uploadedBannerUrl;
    return (existingShop && existingShop.banner) || "";

}


function updatePreview(){

    previewName.innerText =

        shopNameInput.value.trim()

        ||

        "Your Shop";


    previewDescription.innerText =

        shopDescriptionInput.value.trim()

        ||

        "Your shop description will appear here.";


    previewTime.innerText =

        (
            formatTime12h(shopOpenInput.value)

            ||

            "8:00 AM"
        )

        +

        " — "

        +

        (
            formatTime12h(shopCloseInput.value)

            ||

            "8:00 PM"
        );


    /* LOGO PREVIEW */

    const logoUrl = currentLogoUrl();

    if(logoUrl){

        previewLogo.innerHTML = `

            <img
                src="${logoUrl}"
                style="
                width:100%;
                height:100%;
                object-fit:cover;
                border-radius:20px;
                "
            >

        `;

    }

    else{

        previewLogo.innerHTML =
            "🏪";

    }


    /* BANNER PREVIEW */

    const bannerUrl = currentBannerUrl();

    if(bannerUrl){

        previewBanner.style.backgroundImage =

            `url("${bannerUrl}")`;

        previewBanner.style.backgroundSize =
            "cover";

        previewBanner.style.backgroundPosition =
            "center";

    }

    else{

        previewBanner.style.backgroundImage =
            "none";

    }

}


/* ==========================================
   LIVE PREVIEW EVENTS
========================================== */

shopNameInput.addEventListener(

    "input",

    updatePreview

);

shopDescriptionInput.addEventListener(

    "input",

    updatePreview

);

shopOpenInput.addEventListener(

    "input",

    updatePreview

);

shopCloseInput.addEventListener(

    "input",

    updatePreview

);


/* ==========================================
   IMAGE UPLOAD HANDLERS
   Upload happens as soon as a file is picked, so by the time the
   shopkeeper hits Publish/Save the URL is already ready.
========================================== */

async function handleImageSelect(fileInput, kind, previewEl, statusEl, isRound){

    const file = fileInput.files[0];
    if(!file) return;

    if(!realCurrentUser){
        alert("Please wait a moment for your account to load, then try again.");
        return;
    }

    statusEl.innerText = "Uploading...";
    fileInput.disabled = true;

    try{

        const url = await dbUploadShopImage(file, realCurrentUser.id, kind);

        if(kind === "logo"){
            uploadedLogoUrl = url;
            previewEl.innerHTML = `<img src="${url}" alt="Shop logo">`;
        }
        else{
            uploadedBannerUrl = url;
            previewEl.style.backgroundImage = `url("${url}")`;
            previewEl.style.backgroundSize = "cover";
            previewEl.style.backgroundPosition = "center";
        }

        statusEl.innerText = "✅ Uploaded";
        updatePreview();

    }
    catch(err){

        console.error(err);
        statusEl.innerText = "";
        alert("Couldn't upload that image: " + err.message);

    }
    finally{

        fileInput.disabled = false;

    }

}

shopLogoInput.addEventListener("change", function(){
    handleImageSelect(shopLogoInput, "logo", shopLogoPreview, shopLogoStatus, true);
});

shopBannerInput.addEventListener("change", function(){
    handleImageSelect(shopBannerInput, "banner", shopBannerPreview, shopBannerStatus, false);
});


/* ==========================================
   VALIDATION
========================================== */

function validateStep1(){

    if(

        shopNameInput.value.trim() === ""

    ){

        alert(
            "Please enter your shop name."
        );

        return false;

    }


    if(

        shopCategoryInput.value === ""

    ){

        alert(
            "Please select a category."
        );

        return false;

    }


    return true;

}


function validateStep2(){

    if(

        shopDescriptionInput.value.trim() === ""

    ){

        alert(
            "Please enter a shop description."
        );

        return false;

    }


    if(

        shopOpenInput.value.trim() === ""

    ){

        alert(
            "Please enter opening time."
        );

        return false;

    }


    if(

        shopCloseInput.value.trim() === ""

    ){

        alert(
            "Please enter closing time."
        );

        return false;

    }


    return true;

}


/* ==========================================
   NEXT BUTTON
========================================== */

nextBtn.onclick = function(){

    if(currentStep === 1){

        if(!validateStep1()){

            return;

        }

    }


    if(currentStep === 2){

        if(!validateStep2()){

            return;

        }

    }


    if(

        currentStep < totalSteps

    ){

        currentStep++;

        showStep();

    }

};


/* ==========================================
   BACK BUTTON
========================================== */

backBtn.onclick = function(){

    if(currentStep > 1){

        currentStep--;

        showStep();

    }

};


/* ==========================================
   CREATE / UPDATE
========================================== */

publishBtn.onclick = async function(){

    const currentUser = realCurrentUser;


    if(!currentUser){

        alert(
            "Please login first."
        );

        window.location.href =
            "login.html";

        return;

    }


    /* ======================================
       EDIT EXISTING BUSINESS
    ====================================== */

    if(editMode){

        try {

            /* UPDATE BUSINESS */

            await dbUpdateBusiness(activeBusiness.id, {
                name: shopNameInput.value.trim(),
                category: shopCategoryInput.value,
                status: "active"
            });


            /* UPDATE SHOP */

            await dbUpdateShop(existingShop.id, {
                name: shopNameInput.value.trim(),
                category: shopCategoryInput.value,
                description: shopDescriptionInput.value.trim(),
                open_time: shopOpenInput.value.trim(),
                close_time: shopCloseInput.value.trim(),
                logo: currentLogoUrl(),
                banner: currentBannerUrl()
            });


            localStorage.setItem("hb_activeBusiness", activeBusiness.id);
            localStorage.setItem("hb_selectedShop", existingShop.id);


            publishBtn.innerText = "✅ Changes Saved";

            setTimeout(function(){
                window.location.href = "dashboard.html";
            }, 1000);

        } catch(err) {

            console.error(err);
            alert("Something went wrong saving your changes: " + err.message);
        }

        return;

    }


    /* ======================================
       CREATE NEW BUSINESS (real backend)
    ====================================== */

    publishBtn.disabled = true;
    publishBtn.innerText = "Publishing...";

    try {

        const createdBusiness = await dbCreateBusiness({
            owner_id: currentUser.id,
            name: shopNameInput.value.trim(),
            type: "shop",
            category: shopCategoryInput.value,
            status: "active"
        });


        /* RESOLVE TEHSIL from the shopkeeper's saved pincode/market,
           so Tehsil Admins can actually see this shop. Without this,
           the shop is created with no tehsil_id and never shows up
           in any Tehsil Admin's dashboard. */

        let resolvedTehsil = null;

        if(currentUser.market){
            try {
                resolvedTehsil = await dbFindTehsilByPincodeOrName(currentUser.market);
            } catch(tehsilErr){
                console.error("Tehsil lookup failed:", tehsilErr);
            }
        }


        /* CREATE SHOP, linked to the business above */

        const createdShop = await dbCreateShop({
            business_id: createdBusiness.id,
            owner_id: currentUser.id,
            name: shopNameInput.value.trim(),
            category: shopCategoryInput.value,
            description: shopDescriptionInput.value.trim(),
            open_time: shopOpenInput.value.trim(),
            close_time: shopCloseInput.value.trim(),
            logo: currentLogoUrl(),
            banner: currentBannerUrl(),
            manual_status: "auto",
            tehsil_id: resolvedTehsil ? resolvedTehsil.id : null,
            approval_status: "pending"
        });

        if(!resolvedTehsil){
            alert(
                "Your shop was created, but there's no Tehsil Admin covering your area (" +
                currentUser.market +
                ") yet. It will go live automatically as soon as one joins and approves it."
            );
        }


        /* SAVE ACTIVE BUSINESS / SHOP for other (not-yet-migrated) pages */

        localStorage.setItem("hb_activeBusiness", createdBusiness.id);
        localStorage.setItem("hb_selectedShop", createdShop.id);


        publishBtn.innerText = "✅ Business Registered";

        setTimeout(function(){

            window.location.href = "role.html";

        }, 1000);

    } catch(err) {

        console.error(err);
        alert("Something went wrong publishing your shop: " + err.message);

        publishBtn.disabled = false;
        publishBtn.innerText = "Publish";
    }

};


/* ==========================================
   INITIALIZE
========================================== */

updatePreview();

showStep();