/* ==========================================================
   ADMIN APPLICATION PAGE
   ========================================================== */

async function initAdminApply(){

    const loadingBox = document.getElementById("loadingBox");
    const formBox = document.getElementById("formBox");

    let user = null;

    try {
        user = await authGetCurrentUser();
    } catch(err) {
        console.error(err);
    }

    if(!user){
        window.location.href = "login.html?redirect=admin-apply.html";
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

    let existingApp = null;

    try {
        existingApp = await dbGetMyAdminApplication();
    } catch(err) {
        console.error(err);
    }

    if(existingApp && existingApp.status === "pending"){
        window.location.href = "admin-pending.html";
        return;
    }

    loadingBox.style.display = "none";
    formBox.style.display = "block";

    document.getElementById("email").value = user.email || "";
    document.getElementById("phone").value = user.phone || "";
    document.getElementById("fullName").value = user.name || "";

    document.getElementById("submitBtn").onclick = async function(){

        const fullName = document.getElementById("fullName").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const email = document.getElementById("email").value.trim();
        const address = document.getElementById("address").value.trim();
        const district = document.getElementById("district").value.trim();
        const tehsilName = document.getElementById("tehsilName").value.trim();
        const experience = document.getElementById("experience").value.trim();
        const availability = document.getElementById("availability").value.trim();
        const agree = document.getElementById("agree").checked;

        const error = document.getElementById("error");
        const btn = document.getElementById("submitBtn");

        error.style.display = "none";

        if(!fullName || !phone || !email || !district || !tehsilName){
            error.innerText = "Please fill in every required field.";
            error.style.display = "block";
            return;
        }

        if(!agree){
            error.innerText = "Please agree to the terms before submitting.";
            error.style.display = "block";
            return;
        }

        btn.disabled = true;
        btn.innerText = "Submitting...";

        try {

            await dbSubmitAdminApplication({
                user_id: user.id,
                full_name: fullName,
                phone: phone,
                email: email,
                address: address,
                district: district,
                tehsil_name: tehsilName,
                experience: experience,
                availability: availability
            });

            window.location.href = "admin-pending.html";

        } catch(err) {

            console.error(err);
            error.innerText = err.message || "Something went wrong. Please try again.";
            error.style.display = "block";

            btn.disabled = false;
            btn.innerText = "Submit Application";
        }

    };

}

document.addEventListener("DOMContentLoaded", initAdminApply);
