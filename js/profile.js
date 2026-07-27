/* ==========================================================
   PROFILE PAGE
   ========================================================== */

async function initProfilePage(){

    let user = null;

    try {
        user = await authGetCurrentUser();
    } catch(err) {
        console.error(err);
    }

    if(!user){
        window.location.href = "login.html?redirect=profile.html";
        return;
    }

    document.getElementById("profileName").innerText = user.name || "Hamara Bazaar User";
    document.getElementById("profileMarket").innerText = user.market ? `📍 ${user.market}` : "";

    document.getElementById("editName").value = user.name || "";
    document.getElementById("editPhone").value = user.phone || "";
    document.getElementById("editEmail").value = user.email || "";
    document.getElementById("editMarket").value = user.market || "";

    document.getElementById("saveBtn").onclick = async function(){

        const btn = document.getElementById("saveBtn");
        const savedMsg = document.getElementById("savedMsg");

        const updates = {
            name: document.getElementById("editName").value.trim(),
            phone: document.getElementById("editPhone").value.trim(),
            market: document.getElementById("editMarket").value.trim()
        };

        btn.disabled = true;
        btn.innerText = "Saving...";
        savedMsg.style.display = "none";

        try {
            const updated = await dbUpdateMyProfile(updates);
            document.getElementById("profileName").innerText = updated.name || "Hamara Bazaar User";
            document.getElementById("profileMarket").innerText = updated.market ? `📍 ${updated.market}` : "";
            savedMsg.style.display = "block";
        } catch(err) {
            console.error(err);
            alert(err.message || "Could not save changes.");
        }

        btn.disabled = false;
        btn.innerText = "Save Changes";
    };
}

document.addEventListener("DOMContentLoaded", initProfilePage);
