function getProducts(){

    return getData(DB.PRODUCTS) || [];

}

function saveProduct(product){

    let products = getProducts();

    products.push(product);

    saveData(DB.PRODUCTS, products);

}

function getProductById(id){

    return getProducts().find(

        p => p.id == id

    );

}

function getProductsByShop(shopId){

    return getProducts().filter(

        p => p.shopId == shopId

    );

}

function getFeaturedProducts(){

    return getProducts().filter(

        p => p.featured === true && p.active === true

    );

}
function deleteProduct(id){

    let products = getProducts();

    products = products.filter(

        product => product.id != id

    );

    saveData(

        DB.PRODUCTS,

        products

    );

}
