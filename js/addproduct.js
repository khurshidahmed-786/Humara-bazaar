function publishProduct(){

    const currentShop = getCurrentShop();

    if(!currentShop){

        alert("Please create a shop first.");

        return;

    }

    const product={

        id:Date.now(),

        shopId:currentShop.id,

        name:document.getElementById("productName").value,

        price:Number(

            document.getElementById("productPrice").value

        ),

        description:document.getElementById("productDescription").value,

        emoji:document.getElementById("productEmoji").value || "📦",
        category:document.getElementById("productCategory").value,
        featured:true,

        active:true,

        createdAt:new Date().toISOString()

    };

    saveProduct(product);

    alert("Product Published Successfully!");

  setTimeout(function(){

    window.location.href = "dashboard.html";

},1000);

}
