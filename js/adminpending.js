/* ==========================================================
   ADMIN APPLICATION STATUS PAGE
   ========================================================== */

async function initAdminPending(){

    const box = document.getElementById("statusBox");

    let user = null;

    try {
        user = await authGetCurrentUser();
    } catch(err) {
        console.error(err);
    }

    if(!user){
        window.location.href = "login.html?redirect=admin-pending.html";
        return;
    }

    let role = null;

    try {
        role = await dbGetMyRole();
    } catch(err) {
        console.error(err);
    }

    if(role && role.role === "super_admin"){
        window.location.href = "superadmin.html";
        return;
    }

    if(role && role.role === "tehsil_admin"){
        window.location.href = "tehsil-admin.html";
        return;
    }

    let application = null;

    try {
        application = await dbGetMyAdminApplication();
    } catch(err) {
        console.error(err);
    }

    if(!application){
        window.location.href = "admin-apply.html";
        return;
    }

    if(application.status === "pending"){

        box.innerHTML = `
            <div class="icon">⏳</div>
            <h1>Application Submitted</h1>
            <p>Thanks, ${application.full_name}. Your application to become the Tehsil Admin for <strong>${application.tehsil_name}</strong> is pending Super Admin approval.</p>
            <div class="badge pending">Pending Review</div>
        `;

    }else if(application.status === "rejected"){

        box.innerHTML = `
            <div class="icon">✖️</div>
            <h1>Application Not Approved</h1>
            <p>Your application for <strong>${application.tehsil_name}</strong> was not approved this time.</p>
            <div class="badge rejected">Rejected</div>
            <br>
            <a class="action" href="admin-apply.html">Apply Again</a>
        `;

    }else{

        box.innerHTML = `
            <div class="icon">✅</div>
            <h1>Application Approved</h1>
            <p>Redirecting you to your Tehsil Admin dashboard...</p>
        `;

        window.location.href = "tehsil-admin.html";

    }

}

document.addEventListener("DOMContentLoaded", initAdminPending);
