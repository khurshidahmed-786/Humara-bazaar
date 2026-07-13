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
