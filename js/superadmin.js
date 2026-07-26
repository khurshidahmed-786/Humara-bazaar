/* ==========================================================
   SUPER ADMIN DASHBOARD
   ========================================================== */

async function initSuperAdmin(){

    const app = document.getElementById("superAdminApp");
    const unauthorized = document.getElementById("unauthorized");

    let user = null;

    try {
        user = await authGetCurrentUser();
    } catch(err) {
        console.error(err);
    }

    if(!user){
        window.location.href = "login.html?redirect=superadmin.html";
        return;
    }

    let role = null;

    try {
        role = await dbGetMyRole();
    } catch(err) {
        console.error(err);
    }

    if(!role || role.role !== "super_admin"){
        app.style.display = "none";
        unauthorized.style.display = "block";
        return;
    }

    await renderSuperAdminApp();
}

async function renderSuperAdminApp(){

    const app = document.getElementById("superAdminApp");
    app.innerHTML = `<div class="adminEmpty">Loading dashboard...</div>`;

    let applications = [];
    let tehsils = [];
    let auditLogs = [];

    try {
        applications = await dbGetPendingAdminApplications();
    } catch(err) { console.error(err); }

    try {
        tehsils = await dbGetAllTehsils();
    } catch(err) { console.error(err); }

    try {
        auditLogs = await dbGetAuditLogs(null, 20);
    } catch(err) { console.error(err); }

    app.innerHTML = `

        <h2 class="adminHeading">Pending Tehsil Admin Applications</h2>
        <p class="adminSub">Approve to create/assign the tehsil and grant Tehsil Admin access.</p>
        <div id="applicationsList"></div>

        <h2 class="adminHeading">Tehsils</h2>
        <p class="adminSub">Only Super Admin can open, pause, or suspend a tehsil.</p>
        <div id="tehsilsList"></div>

        <h2 class="adminHeading">Recent Activity</h2>
        <div id="auditList"></div>
    `;

    renderApplicationsList(applications);
    renderTehsilsList(tehsils);
    renderAuditList(auditLogs);
}

function renderApplicationsList(applications){

    const container = document.getElementById("applicationsList");

    if(!applications || applications.length === 0){
        container.innerHTML = `<div class="adminEmpty">No pending applications right now.</div>`;
        return;
    }

    container.innerHTML = "";

    applications.forEach(application => {

        const card = document.createElement("div");
        card.className = "adminCard";

        card.innerHTML = `
            <div class="adminRow">
                <div>
                    <strong>${application.full_name}</strong> — ${application.tehsil_name} (${application.district || "—"})
                    <div style="color:#777; font-size:13px; margin-top:4px;">
                        ${application.phone} · ${application.email}
                    </div>
                    ${application.experience ? `<div style="color:#777; font-size:13px; margin-top:4px;">Experience: ${application.experience}</div>` : ""}
                </div>
                <div class="adminActions">
                    <button class="adminBtn approve" data-action="approve">Approve</button>
                    <button class="adminBtn reject" data-action="reject">Reject</button>
                </div>
            </div>
        `;

        card.querySelector('[data-action="approve"]').onclick = async function(){
            if(!confirm(`Approve ${application.full_name} as Tehsil Admin for ${application.tehsil_name}?`)) return;

            try {
                await dbApproveAdminApplication(application);
                await renderSuperAdminApp();
            } catch(err) {
                console.error(err);
                alert(err.message || "Could not approve this application.");
            }
        };

        card.querySelector('[data-action="reject"]').onclick = async function(){
            if(!confirm(`Reject ${application.full_name}'s application?`)) return;

            try {
                await dbRejectAdminApplication(application.id);
                await renderSuperAdminApp();
            } catch(err) {
                console.error(err);
                alert(err.message || "Could not reject this application.");
            }
        };

        container.appendChild(card);
    });
}

function renderTehsilsList(tehsils){

    const container = document.getElementById("tehsilsList");

    if(!tehsils || tehsils.length === 0){
        container.innerHTML = `<div class="adminEmpty">No tehsils yet. They're created automatically when you approve an admin application.</div>`;
        return;
    }

    container.innerHTML = "";

    tehsils.forEach(tehsil => {

        const card = document.createElement("div");
        card.className = "adminCard";

        let actionsHtml = "";

        if(tehsil.status === "ready_for_review"){
            actionsHtml = `<button class="adminBtn approve" data-action="open">Approve & Open</button>`;
        }else if(tehsil.status === "open"){
            actionsHtml = `<button class="adminBtn neutral" data-action="pause">Pause</button>`;
        }else if(tehsil.status === "paused" || tehsil.status === "suspended"){
            actionsHtml = `<button class="adminBtn approve" data-action="open">Reopen</button>`;
        }

        card.innerHTML = `
            <div class="adminRow">
                <div>
                    <strong>${tehsil.name}</strong> ${tehsil.district ? `— ${tehsil.district}` : ""}
                    <div style="margin-top:6px;">
                        <span class="adminBadge ${tehsil.status}">${tehsil.status.replace(/_/g, " ")}</span>
                    </div>
                </div>
                <div class="adminActions">${actionsHtml}</div>
            </div>
        `;

        const openBtn = card.querySelector('[data-action="open"]');
        if(openBtn){
            openBtn.onclick = async function(){
                if(!confirm(`Make "${tehsil.name}" publicly open?`)) return;
                try {
                    await dbSetTehsilStatus(tehsil.id, "open");
                    await renderSuperAdminApp();
                } catch(err) {
                    console.error(err);
                    alert(err.message || "Could not update tehsil status.");
                }
            };
        }

        const pauseBtn = card.querySelector('[data-action="pause"]');
        if(pauseBtn){
            pauseBtn.onclick = async function(){
                if(!confirm(`Pause "${tehsil.name}"? It will stop showing publicly.`)) return;
                try {
                    await dbSetTehsilStatus(tehsil.id, "paused");
                    await renderSuperAdminApp();
                } catch(err) {
                    console.error(err);
                    alert(err.message || "Could not update tehsil status.");
                }
            };
        }

        container.appendChild(card);
    });
}

function renderAuditList(logs){

    const container = document.getElementById("auditList");

    if(!logs || logs.length === 0){
        container.innerHTML = `<div class="adminEmpty">No activity recorded yet.</div>`;
        return;
    }

    container.innerHTML = "";

    logs.forEach(log => {

        const row = document.createElement("div");
        row.className = "adminCard";
        row.innerHTML = `
            <div style="font-size:13px; color:#555;">
                <strong>${log.action.replace(/_/g, " ")}</strong>
                ${log.target_table ? ` · ${log.target_table}#${log.target_id}` : ""}
                <div style="color:#999; margin-top:4px;">${new Date(log.created_at).toLocaleString()}</div>
            </div>
        `;
        container.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", initSuperAdmin);
