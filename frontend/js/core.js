let isVoiceInteraction = false;

// ⭐ GLOBAL SPA View Switcher
window.switchView = function(viewId) {
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.remove('active-view');
    });
    document.getElementById(viewId).classList.add('active-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ⭐ Quick Action Trigger
window.triggerQuickAction = function(message) {
    const inputField = document.getElementById("user-input");
    inputField.value = message;
    
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer.classList.contains("hidden")) {
        toggleChat();
    }
    
    isVoiceInteraction = false; 
    sendMessage();
}

// UI Toggles
window.toggleChat = function() {
    const chatContainer = document.getElementById("chat-container");
    chatContainer.classList.toggle("hidden");
    if (!chatContainer.classList.contains("hidden")) {
        setTimeout(() => document.getElementById("user-input").focus(), 100);
    }
}

function appendMessage(text, sender) {
    const chatBox = document.getElementById("chat-box");
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message");
    msgDiv.classList.add(sender === "user" ? "user-message" : "bot-message");
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    msgDiv.innerHTML = formattedText;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

window.handleKeyPress = function(event) {
    if (event.key === "Enter") {
        isVoiceInteraction = false; 
        sendMessage();
    }
}

window.sendMessage = async function() {
    const inputField = document.getElementById("user-input");
    const message = inputField.value.trim();
    if (message === "") return;

    appendMessage(message, "user");
    inputField.value = "";
    
    const chatBox = document.getElementById("chat-box");
    const thinkingDiv = document.createElement("div");
    thinkingDiv.classList.add("message", "bot-message");
    thinkingDiv.id = "thinking-anim";
    thinkingDiv.innerText = "Analyzing intent...";
    chatBox.appendChild(thinkingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch("https://ai-receptionist-backend-v88j.onrender.com", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: message, profile_name: CURRENT_PROFILE }) 
        });

        const data = await response.json();
        document.getElementById("thinking-anim").remove();
        appendMessage(data.reply, "bot");

        if (isVoiceInteraction) {
            speakText(data.reply);
            isVoiceInteraction = false;
        }
    } catch (error) {
        if(document.getElementById("thinking-anim")) document.getElementById("thinking-anim").remove();
        appendMessage("System offline. Please check backend connection.", "bot");
    }
}

// 🎙️ VOICE ENGINE (Microphone & Speaker)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN';

    recognition.onstart = function() {
        const micBtn = document.getElementById("mic-btn");
        micBtn.style.background = "#dfbc73"; 
        micBtn.style.color = "#111";
        micBtn.innerHTML = '<i class="fa-solid fa-microphone-lines"></i>'; 
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        document.getElementById("user-input").value = transcript;
        isVoiceInteraction = true; 
        sendMessage(); 
    };

    recognition.onend = function() {
        const micBtn = document.getElementById("mic-btn");
        micBtn.style.background = "#333";
        micBtn.style.color = "#fff";
        micBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
    };
}

window.startVoiceInput = function() {
    if (recognition) {
        recognition.start();
    } else {
        alert("Voice input is not supported in your browser.");
    }
}

window.speakText = function(text) {
    if ('speechSynthesis' in window) {
        const cleanText = text.replace(/[*#]/g, ''); 
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-IN';
        window.speechSynthesis.speak(utterance);
    }
}
// ==========================================
// 🔒 ADMIN DASHBOARD LOGIC (DEMO SECURITY)
// ==========================================

const DEMO_PASSWORD = "admin123";

window.verifyAdmin = function() {
    const passInput = document.getElementById("admin-password").value;
    if (passInput === DEMO_PASSWORD) {
        // Password sahi hai -> Login box chupao, Dashboard dikhao
        document.getElementById("login-error").style.display = "none";
        document.getElementById("admin-login-section").style.display = "none";
        document.getElementById("admin-dashboard-section").style.display = "block";
        document.getElementById("admin-password").value = ""; // clear password
        
        // Leads Fetch karo
        fetchLeadsFromBackend();
    } else {
        // Password galat hai
        document.getElementById("login-error").style.display = "block";
    }
}

window.logoutAdmin = function() {
    document.getElementById("admin-dashboard-section").style.display = "none";
    document.getElementById("admin-login-section").style.display = "block";
}

async function fetchLeadsFromBackend() {
    try {
        const response = await fetch("https://ai-receptionist-backend-v88j.onrender.com");
        if (!response.ok) throw new Error("Network response was not ok");
        
        const leads = await response.json();
        const tableBody = document.getElementById("leads-table-body");
        
        document.getElementById("total-leads-count").innerText = leads.length;
        tableBody.innerHTML = "";

        if (leads.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #888;">No leads captured yet. Start chatting to generate leads!</td></tr>`;
            return;
        }

        leads.forEach(lead => {
            const dateObj = new Date(lead.created_at);
            const formattedDate = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

            const row = document.createElement("tr");
            row.innerHTML = `
                <td style="color: #aaa; font-size: 0.9rem;">${formattedDate}</td>
                <td><span class="profile-badge">${lead.business_profile.toUpperCase()}</span></td>
                <td style="font-weight: 600; color: #fff;">${lead.name}</td>
                <td style="color: #dfbc73;"><i class="fa-solid fa-phone" style="font-size:0.8rem; margin-right:5px;"></i> ${lead.phone}</td>
                <td style="color: #aaa;">${lead.purpose}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching leads:", error);
        document.getElementById("leads-table-body").innerHTML = `
            <tr><td colspan="5" style="text-align: center; color: #ff4444;">Database Connection Error. Is FastAPI running?</td></tr>`;
    }
}