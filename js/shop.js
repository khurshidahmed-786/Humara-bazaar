/* ===========================
   SHOP MODULE
=========================== */

function createShop(shop){

    let shops = getShops();

    shop.id = Date.now();

    shop.createdAt = new Date().toISOString();

    shops.push(shop);

    saveData(DB.SHOPS, shops);

    return shop;

}

function getShop(id){

    let shops = getShops();

    return shops.find(s => s.id == id);

}

function getAllShops(){

    return getShops();

}

function updateShop(updatedShop){

    let shops = getShops();

    shops = shops.map(shop =>

        shop.id == updatedShop.id

        ? updatedShop

        : shop

    );

    saveData(DB.SHOPS, shops);

}

function deleteShop(id){

    let shops = getShops();

    shops = shops.filter(

        shop => shop.id != id

    );

    saveData(DB.SHOPS, shops);

}
function getCurrentShop(){

    const id = Number(
        localStorage.getItem("hb_selectedShop")
    );

    if(!id){

        return null;

    }

    return getShops().find(

        shop => shop.id === id

    ) || null;

}
