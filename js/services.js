/* ==========================================================
   SERVICES HUB — riders live now, rest coming soon
   ========================================================== */

async function initServicesPage(){

    const actionSlot = document.getElementById("riderCardAction");

    let user = null;

    try {
        user = await authGetCurrentUser();
    } catch(err) {
        console.error(err);
    }

    if(!user){
        actionSlot.innerHTML = `<a class="serviceBtn" href="login.html?redirect=rider-apply.html">Log In to Apply</a>`;
        return;
    }

    let application = null;

    try {
        application = await dbGetMyRiderApplication();
    } catch(err) {
        console.error(err);
    }

    if(!application){
        actionSlot.innerHTML = `<a class="serviceBtn" href="rider-apply.html">Apply as a Rider</a>`;
        return;
    }

    const label = {
        pending: "Pending Review",
        approved: "Approved",
        rejected: "Not Approved",
        suspended: "Suspended",
        inactive: "Inactive"
    }[application.status] || application.status;

    const badgeClass = application.status === "approved"
        ? "approved"
        : application.status === "rejected"
        ? "rejected"
        : "pending";

    if(application.status === "approved"){
        actionSlot.innerHTML = `<a class="serviceBtn" href="riderdashboard.html">Open Rider Dashboard →</a>`;
        return;
    }

    actionSlot.innerHTML = `<span class="serviceStatus ${badgeClass}">${label}</span>`;
}

document.addEventListener("DOMContentLoaded", initServicesPage);
