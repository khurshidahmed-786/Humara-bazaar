/* ==========================================
   HAMARA BAZAAR
   CREATE / EDIT SHOP ENGINE
========================================== */


/* ==========================================
   AUTH CHECK
========================================== */

const user = getCurrentUser();

if(!user){

    alert(
        "Please login to manage your business."
    );

    window.location.href =
        "login.html";

}


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


/* ==========================================
   LOAD EDIT DATA
========================================== */

if(editMode){

    activeBusiness =
        getActiveBusiness();


    if(!activeBusiness){

        alert(
            "No active business found."
        );

        window.location.href =
            "role.html";

    }


    existingShop =
        getShopByBusinessId(
            activeBusiness.id
        );


    if(!existingShop){

        alert(
            "Shop not found."
        );

        window.location.href =
            "role.html";

    }

}


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

const shopLogoInput =
    document.getElementById(
        "shopLogo"
    );

const shopBannerInput =
    document.getElementById(
        "shopBanner"
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

if(editMode && existingShop){

    shopNameInput.value =
        existingShop.name || "";


    shopCategoryInput.value =
        existingShop.category || "";


    shopDescriptionInput.value =
        existingShop.description || "";


    shopOpenInput.value =
        existingShop.open || "";


    shopCloseInput.value =
        existingShop.close || "";


    shopLogoInput.value =
        existingShop.logo || "";


    shopBannerInput.value =
        existingShop.banner || "";

}


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
            shopOpenInput.value

            ||

            "8:00 AM"
        )

        +

        " — "

        +

        (
            shopCloseInput.value

            ||

            "8:00 PM"
        );


    /* LOGO PREVIEW */

    if(

        shopLogoInput.value.trim()

    ){

        previewLogo.innerHTML = `

            <img
                src="${shopLogoInput.value.trim()}"
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

    if(

        shopBannerInput.value.trim()

    ){

        previewBanner.style.backgroundImage =

            `url("${shopBannerInput.value.trim()}")`;

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

shopLogoInput.addEventListener(

    "input",

    updatePreview

);

shopBannerInput.addEventListener(

    "input",

    updatePreview

);


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

publishBtn.onclick = function(){

    const currentUser =
        getCurrentUser();


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

        /* UPDATE BUSINESS */

        activeBusiness.name =
            shopNameInput.value.trim();

        activeBusiness.category =
            shopCategoryInput.value;

        activeBusiness.status =
            "active";


        updateBusiness(
            activeBusiness
        );


        /* UPDATE SHOP */

        existingShop.name =
            shopNameInput.value.trim();

        existingShop.category =
            shopCategoryInput.value;

        existingShop.description =
            shopDescriptionInput.value.trim();

        existingShop.open =
            shopOpenInput.value.trim();

        existingShop.close =
            shopCloseInput.value.trim();

        existingShop.logo =
            shopLogoInput.value.trim();

        existingShop.banner =
            shopBannerInput.value.trim();


        updateShop(
            existingShop
        );


        /* SAVE ACTIVE IDs */

        localStorage.setItem(

            "hb_activeBusiness",

            activeBusiness.id

        );


        localStorage.setItem(

            "hb_selectedShop",

            existingShop.id

        );


        publishBtn.innerText =
            "✅ Changes Saved";


        setTimeout(function(){

            window.location.href =
                "dashboard.html";

        },1000);


        return;

    }


    /* ======================================
       CREATE NEW BUSINESS
    ====================================== */

    const business = {

        ownerId:
            currentUser.id,

        name:
            shopNameInput.value.trim(),

        type:
            "shop",

        category:
            shopCategoryInput.value,

        status:
            "active"

    };


    const createdBusiness =

        createBusiness(
            business
        );


    /* LINK BUSINESS */

    addBusinessToUser(

        currentUser.id,

        createdBusiness.id

    );


    /* CREATE SHOP */

    const shop = {

        businessId:
            createdBusiness.id,

        ownerId:
            currentUser.id,

        name:
            shopNameInput.value.trim(),

        category:
            shopCategoryInput.value,

        description:
            shopDescriptionInput.value.trim(),

        open:
            shopOpenInput.value.trim(),

        close:
            shopCloseInput.value.trim(),

        logo:
            shopLogoInput.value.trim(),

        banner:
            shopBannerInput.value.trim()

    };


    const createdShop =

        createShop(
            shop
        );


    /* SAVE ACTIVE BUSINESS */

    localStorage.setItem(

        "hb_activeBusiness",

        createdBusiness.id

    );


    /* SAVE SELECTED SHOP */

    localStorage.setItem(

        "hb_selectedShop",

        createdShop.id

    );


    publishBtn.innerText =
        "✅ Business Registered";


    setTimeout(function(){

        window.location.href =
            "dashboard.html";

    },1000);

};


/* ==========================================
   INITIALIZE
========================================== */

updatePreview();

showStep();
