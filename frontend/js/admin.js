async function fetchLeads() {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/admin/leads");
        if (!response.ok) throw new Error("Network response was not ok");
        
        const leads = await response.json();
        const tableBody = document.getElementById("leads-table-body");
        
        // Update Stats
        document.getElementById("total-leads").innerText = leads.length;
        
        // Clear loading message
        tableBody.innerHTML = "";

        if (leads.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #888;">No leads captured yet.</td></tr>`;
            return;
        }

        // Loop through leads and create table rows
        leads.forEach(lead => {
            // Format date nicely
            const dateObj = new Date(lead.created_at);
            const formattedDate = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            const row = document.createElement("tr");
            
            row.innerHTML = `
                <td style="color: #aaa; font-size: 0.9rem;">${formattedDate}</td>
                <td><span class="profile-badge">${lead.business_profile.toUpperCase()}</span></td>
                <td style="font-weight: 600;">${lead.name}</td>
                <td style="color: #dfbc73;"><i class="fa-solid fa-phone" style="font-size:0.8rem; margin-right:5px;"></i> ${lead.phone}</td>
                <td>${lead.purpose}</td>
            `;
            
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error fetching leads:", error);
        document.getElementById("leads-table-body").innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #ff4444;">Error connecting to the backend database. Make sure FastAPI is running.</td>
            </tr>
        `;
    }
}

// Load leads when page opens
document.addEventListener("DOMContentLoaded", fetchLeads);