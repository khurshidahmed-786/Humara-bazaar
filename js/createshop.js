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
