function renderHeader(){

    return `

    <header>

        Header

    </header>

    `;

}

function renderBottomNav(){

    return `

    <nav>

        Bottom Navigation

    </nav>

    `;

}
function renderHeader(title = "Hamara Bazaar"){

    return `

    <header class="appHeader">

        <div class="headerLeft">

            ☰

        </div>

        <div class="headerTitle">

            ${title}

        </div>

        <div class="headerRight">

            🛒

        </div>

    </header>

    `;

}

function renderBottomNav(){

    return "";

}
