/* ==========================================================
   RIDER APPLICATION PAGE
   ========================================================== */

async function initRiderApply(){

    const loadingBox = document.getElementById("loadingBox");
    const statusBox = document.getElementById("statusBox");
    const formBox = document.getElementById("formBox");

    let user = null;

    try {
        user = await authGetCurrentUser();
    } catch(err) {
        console.error(err);
    }

    if(!user){
        window.location.href = "login.html?redirect=rider-apply.html";
        return;
    }

    let existingApplication = null;

    try {
        existingApplication = await dbGetMyRiderApplication();
    } catch(err) {
        console.error(err);
    }

    loadingBox.style.display = "none";

    if(existingApplication){

        statusBox.style.display = "block";

        const statusLabel = {
            pending: "Pending Review",
            approved: "Approved",
            rejected: "Not Approved",
            suspended: "Suspended",
            inactive: "Inactive"
        }[existingApplication.status] || existingApplication.status;

        const badgeClass = existingApplication.status === "approved"
            ? "approved"
            : existingApplication.status === "rejected"
            ? "rejected"
            : "pending";

        statusBox.innerHTML = `
            <h1>Rider Application</h1>
            <p>Hi ${existingApplication.full_name}, here's your current status.</p>
            <div class="badge ${badgeClass}">${statusLabel}</div>
        `;

        return;
    }

    formBox.style.display = "block";

    document.getElementById("fullName").value = user.name || "";
    document.getElementById("phone").value = user.phone || "";

    let tehsils = [];

    try {
        tehsils = await dbGetAllTehsils();
    } catch(err) {
        console.error(err);
    }

    const tehsilSelect = document.getElementById("tehsilSelect");
    tehsils.forEach(tehsil => {
        const opt = document.createElement("option");
        opt.value = tehsil.id;
        opt.textContent = `${tehsil.name}${tehsil.district ? " — " + tehsil.district : ""}`;
        tehsilSelect.appendChild(opt);
    });

    document.getElementById("submitBtn").onclick = async function(){

        const fullName = document.getElementById("fullName").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const tehsilId = document.getElementById("tehsilSelect").value;
        const vehicleType = document.getElementById("vehicleType").value;
        const vehicleNumber = document.getElementById("vehicleNumber").value.trim();
        const documentFile = document.getElementById("documentFile").files[0];

        const error = document.getElementById("error");
        const btn = document.getElementById("submitBtn");

        error.style.display = "none";

        if(!fullName || !phone || !tehsilId){
            error.innerText = "Please fill in your name, phone, and tehsil.";
            error.style.display = "block";
            return;
        }

        btn.disabled = true;
        btn.innerText = "Submitting...";

        try {

            let documentUrl = null;

            if(documentFile){
                documentUrl = await dbUploadVerificationDoc(documentFile, user.id);
            }

            const rider = await dbSubmitRiderApplication({
                user_id: user.id,
                tehsil_id: Number(tehsilId),
                full_name: fullName,
                phone: phone,
                document_url: documentUrl
            });

            if(vehicleType || vehicleNumber){
                await dbAddVehicle(rider.id, vehicleType, vehicleNumber, documentUrl);
            }

            window.location.reload();

        } catch(err) {

            console.error(err);
            error.innerText = err.message || "Something went wrong. Please try again.";
            error.style.display = "block";

            btn.disabled = false;
            btn.innerText = "Submit Application";
        }

    };

}

document.addEventListener("DOMContentLoaded", initRiderApply);
