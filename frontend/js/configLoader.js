const CURRENT_PROFILE = "hotel"; // 'hotel' ya 'chachakota_tours'

async function loadBusinessProfile() {
    try {
        const response = await fetch(`https://ai-receptionist-backend-v88j.onrender.com/api/profile/${CURRENT_PROFILE}`);
        if (!response.ok) throw new Error("Backend not responding");
        
        const data = await response.json();

        // ONLY Update the Services View (Dynamic part)
        document.getElementById('ui-service-sub').innerText = `${data.business_type.toUpperCase()} CAPABILITIES`;
        document.getElementById('ui-service-title').innerText = `${data.business_name} AI Modules`;

        // Update AI Chat Names
        document.getElementById('chat-btn-name').innerText = `${data.business_name} AI`;
        document.getElementById('chat-header-name').innerText = `${data.business_name} Assistant`;
        document.getElementById('ui-chat-greeting').innerText = data.greeting_message;

        // Dynamically Generate Quick Action Buttons
        const actionsContainer = document.getElementById('ui-quick-actions');
        
        if (CURRENT_PROFILE === "hotel") {
            actionsContainer.innerHTML = `
                <div class="quick-action-btn" onclick="triggerQuickAction('I want to book a room.')">
                    <i class="fa-solid fa-bed"></i>
                    <h4>Room Booking</h4>
                    <p>Check availability and book suites directly.</p>
                </div>
                <div class="quick-action-btn" onclick="triggerQuickAction('I need room service. Show me the menu.')">
                    <i class="fa-solid fa-utensils"></i>
                    <h4>Room Service</h4>
                    <p>Order food or request cleaning services.</p>
                </div>
            `;
        } else if (CURRENT_PROFILE === "chachakota_tours") {
            actionsContainer.innerHTML = `
                <div class="quick-action-btn" onclick="triggerQuickAction('I want a Banswara travel itinerary.')">
                    <i class="fa-solid fa-map-location-dot"></i>
                    <h4>Custom Itinerary</h4>
                    <p>Plan a complete trip to Banswara and its islands.</p>
                </div>
                <div class="quick-action-btn" onclick="triggerQuickAction('Tell me about rainy season greenery at Chachakota.')">
                    <i class="fa-solid fa-cloud-showers-water"></i>
                    <h4>Rainy Season Tours</h4>
                    <p>Explore the lush green realism of the islands.</p>
                </div>
            `;
        }

    } catch (error) {
        console.error("Error loading profile:", error);
        // Error handling if backend is off
        document.getElementById('ui-service-title').innerText = "Backend Offline";
        document.getElementById('ui-quick-actions').innerHTML = "<p style='color:red;'>Please start the FastAPI backend server first.</p>";
        document.getElementById('ui-chat-greeting').innerText = "System offline. Please check backend connection.";
    }
}

document.addEventListener("DOMContentLoaded", loadBusinessProfile);