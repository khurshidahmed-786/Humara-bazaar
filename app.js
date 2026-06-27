// HMARA BAZAAR GLOBAL APP FILE
console.log("Hmara Bazaar App Loaded");

// save data
function saveData(key,value){
localStorage.setItem(
key,
JSON.stringify(value)
);
}

// load data
function loadData(key){

let data=
localStorage.getItem(key);

if(data){

return JSON.parse(data);

}

return null;

}
