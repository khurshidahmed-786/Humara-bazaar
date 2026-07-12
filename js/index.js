document.getElementById(

"menuBtn"

).onclick=function(){

alert(

"Menu Coming Soon"

);

};
const pin = localStorage.getItem("pincode");

let market = "Your Local Market";

if(pin==="185121"){

    market="Surankote Bazaar";

}

document.getElementById(

"marketName"

).innerText = market;
