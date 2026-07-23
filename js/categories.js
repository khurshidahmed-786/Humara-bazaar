/* ==========================================
   HAMARA BAZAAR CATEGORY ENGINE
========================================== */

const categories = [

    {
        id: 1,
        name: "Grocery",
        icon: "🥦"
    },

    {
        id: 2,
        name: "Restaurant",
        icon: "🍔"
    },

    {
        id: 3,
        name: "Fashion",
        icon: "👕"
    },

    {
        id: 4,
        name: "Beauty",
        icon: "💄"
    },

    {
        id: 5,
        name: "Services",
        icon: "🛠"
    },

    {
        id: 6,
        name: "Transport",
        icon: "🚚"
    }

];


/* ==========================================
   RENDER HOMEPAGE CATEGORIES
========================================== */

function renderCategories(){

    const container =
        document.getElementById(
            "categoryScroll"
        );

    if(!container){

        return;

    }

    container.innerHTML = "";


    categories.forEach(category => {

        const card =
            document.createElement("div");

        card.className =
            "categoryCard";


        card.innerHTML = `

            <div class="categoryIcon">

                ${category.icon}

            </div>

            <div class="categoryName">

                ${category.name}

            </div>

        `;


        card.onclick = function(){

            window.location.href =
                "shops.html?category=" +
                encodeURIComponent(
                    category.name
                );

        };


        container.appendChild(card);

    });

}
