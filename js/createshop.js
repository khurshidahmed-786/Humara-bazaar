const user = getCurrentUser();

if(!user){

    alert(
        "Please login to register your business."
    );

    window.location.href =
        "login.html";

}
let currentStep = 1;

const totalSteps = 4;

const steps = document.querySelectorAll(".step");

const backBtn = document.getElementById("backBtn");

const nextBtn = document.getElementById("nextBtn");

const publishArea = document.getElementById("publishArea");

const progressFill = document.getElementById("progressFill");

const stepText = document.getElementById("stepText");

const titles = [

"Shop Identity",

"Business Details",

"Branding",

"Preview"

];

function showStep(){

steps.forEach(step=>{

step.classList.remove("active");

});

document.getElementById(

"step"+currentStep

).classList.add(

"active"

);

stepText.innerText=

`Step ${currentStep} of ${totalSteps}`;

document.getElementById(

"stepTitle"

).innerText=

titles[currentStep-1];

progressFill.style.width=

(currentStep/totalSteps)*100+"%";

backBtn.style.display=

currentStep===1

?

"none"

:

"block";

if(currentStep===4){

nextBtn.style.display="none";

publishArea.style.display="block";

}

else{

nextBtn.style.display="block";

publishArea.style.display="none";

}

}

showStep();
nextBtn.onclick=function(){

if(currentStep===1){

if(!validateStep1()){

return;

}

}

if(currentStep===2){

if(!validateStep2()){

return;

}

}

if(currentStep<totalSteps){

currentStep++;

showStep();

}

};


backBtn.onclick=function(){

if(currentStep>1){

currentStep--;

showStep();

}

};
/* ==========================
   LIVE PREVIEW ENGINE
========================== */

const shopNameInput =
document.getElementById("shopName");

const shopDescriptionInput =
document.getElementById("shopDescription");

const shopOpenInput =
document.getElementById("shopOpen");

const shopCloseInput =
document.getElementById("shopClose");

const previewName =
document.getElementById("previewName");

const previewDescription =
document.getElementById("previewDescription");

const previewTime =
document.getElementById("previewTime");
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

(shopOpenInput.value || "8:00 AM")

+

" — "

+

(shopCloseInput.value || "8:00 PM");

}
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

updatePreview();
function validateStep1(){

if(shopNameInput.value.trim()===""){

alert("Please enter your shop name.");

return false;

}

const category=document.getElementById("shopCategory");

if(category.value===""){

alert("Please select a category.");

return false;

}

return true;

}
function validateStep2(){

if(shopDescriptionInput.value.trim()===""){

alert("Please enter a shop description.");

return false;

}

if(shopOpenInput.value.trim()===""){

alert("Please enter opening time.");

return false;

}

if(shopCloseInput.value.trim()===""){

alert("Please enter closing time.");

return false;

}

return true;

}
document.getElementById(
    "publishBtn"
).onclick=function(){

    const user = getCurrentUser();

    if(!user){

        alert(
            "Please login to register your business."
        );

        window.location.href =
            "login.html";

        return;

    }

    /*
    ======================================
    STEP 1
    CREATE BUSINESS
    ======================================
    */

    const business = {

        ownerId: user.id,

        name:
            shopNameInput.value.trim(),

        type: "shop",

        category:
            document.getElementById(
                "shopCategory"
            ).value,

        status: "active"

    };

    const createdBusiness =
        createBusiness(
            business
        );


    /*
    ======================================
    STEP 2
    LINK BUSINESS TO USER
    ======================================
    */

    addBusinessToUser(

        user.id,

        createdBusiness.id

    );


    /*
    ======================================
    STEP 3
    CREATE SHOP
    ======================================
    */

    const shop = {

        businessId:
            createdBusiness.id,

        ownerId:
            user.id,

        name:
            shopNameInput.value.trim(),

        category:
            document.getElementById(
                "shopCategory"
            ).value,

        description:
            shopDescriptionInput.value.trim(),

        open:
            shopOpenInput.value.trim(),

        close:
            shopCloseInput.value.trim(),

        logo:
            document.getElementById(
                "shopLogo"
            ).value.trim(),

        banner:
            document.getElementById(
                "shopBanner"
            ).value.trim()

    };


    const createdShop =
        createShop(shop);


    /*
    ======================================
    STEP 4
    SAVE ACTIVE BUSINESS
    ======================================
    */

    localStorage.setItem(

        "hb_activeBusiness",

        createdBusiness.id

    );


    /*
    ======================================
    STEP 5
    SAVE SELECTED SHOP
    ======================================
    */

    localStorage.setItem(

        "hb_selectedShop",

        createdShop.id

    );


    /*
    ======================================
    SUCCESS
    ======================================
    */

    this.innerText =
        "✅ Business Registered";


    setTimeout(function(){

        window.location.href =
            "dashboard.html";

    },1200);

};
};
