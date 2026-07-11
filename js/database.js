// SHOPS

function getShops(){

return JSON.parse(

localStorage.getItem("shops")

||

"[]"

);

}

function saveShop(shop){

let shops=getShops();

shops.push(shop);

localStorage.setItem(

"shops",

JSON.stringify(shops)

);

}

// USERS

function getUsers(){

return JSON.parse(

localStorage.getItem("users")

||

"[]"

);

}

function saveUser(user){

let users=getUsers();

users.push(user);

localStorage.setItem(

"users",

JSON.stringify(users)

);

}
