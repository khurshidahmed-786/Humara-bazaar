function saveShop(data){

localStorage.setItem(
"shopData",
JSON.stringify(data)
);

}

function getShop(){

let shop=
localStorage.getItem(
"shopData"
);

if(shop){

return JSON.parse(shop);

}

return {};

}

function updateShop(key,value){

let shop=getShop();

shop[key]=value;

saveShop(shop);

}
