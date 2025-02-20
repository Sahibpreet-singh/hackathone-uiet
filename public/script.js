document.addEventListener("DOMContentLoaded", () => {
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const eventForm = document.getElementById("eventForm");
    const eventsContainer = document.querySelector(".grid");

    // **SIGN-UP**
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("username").value;
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("http://localhost:3000/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();
                alert(data.message);
                if (response.ok) window.location.href = "login.html";
            } catch (error) {
                console.error("Error signing up:", error);
            }
        });
    }

    // **LOGIN**
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            try {
                const response = await fetch("http://localhost:3000/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                alert(data.message);
                if (response.ok) {
                    if (data.status === "approved") window.location.href = "teacher.html";
                    else window.location.href = "student.html";
                }
            } catch (error) {
                console.error("Error logging in:", error);
            }
        });
    }

    // **CREATE EVENT**
    if (eventForm) {
        eventForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.getElementById("event-name").value;
            const date = document.getElementById("event-date").value;
            const time = document.getElementById("event-time").value;
            const place = document.getElementById("event-place").value;

            try {
                const response = await fetch("http://localhost:3000/create-event", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, date, time, place })
                });

                const data = await response.json();
                alert(data.message);
                if (response.ok) eventForm.reset();
            } catch (error) {
                console.error("Error creating event:", error);
            }
        });
    }

    
    
});




        document.querySelectorAll(".join-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                const eventId = e.target.getAttribute("data-id");
                try {
                    const response = await fetch("http://localhost:3000/join-event", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ eventId })
                    });

                    const data = await response.json();
                    alert(data.message);
                } catch (error) {
                    console.error("Error joining event:", error);
                }
            });
        });
        
        document.addEventListener("DOMContentLoaded", () => {
            const eventForm = document.getElementById("eventForm");
            const eventsContainer = document.getElementById("events-container");
        
            // Create Event
            if (eventForm) {
                eventForm.addEventListener("submit", async (e) => {
                    e.preventDefault();
        
                    const eventData = {
                        name: document.getElementById("event-name").value,
                        date: document.getElementById("event-date").value,
                        time: document.getElementById("event-time").value,
                        place: document.getElementById("event-place").value
                    };
        
                    try {
                        const response = await fetch("http://localhost:3000/create-event", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(eventData)
                        });
        
                        const data = await response.json();
                        alert(data.message);
                        eventForm.reset();
                    } catch (error) {
                        console.error("Error creating event:", error);
                        alert("❌ Failed to create event.");
                    }
                });
            }
        
            // Fetch and Display Events
            if (eventsContainer) {
                const fetchEvents = async () => {
                    try {
                        const response = await fetch("http://localhost:3000/get-events");
                        const events = await response.json();
        
                        eventsContainer.innerHTML = "";
        
                        if (events.length === 0) {
                            eventsContainer.innerHTML = "<p class='text-center text-gray-500'>No events available.</p>";
                            return;
                        }
        
                        events.forEach(event => {
                            const eventCard = document.createElement("div");
                            eventCard.className = "bg-white p-4 rounded-lg shadow-md";
        
                            eventCard.innerHTML = `
                                <h3 class="text-xl font-bold text-gray-900">${event.name}</h3>
                                <p class="text-gray-700">${event.date} at ${event.time}</p>
                                <p class="text-gray-600">Location: ${event.place}</p>
                                <a href="joinform.html"><button class='join-btn bg-blue-500 text-white px-3 py-2 mt-2 rounded' data-id='${event._id}'>Join Event</button></a>
                                <a href="feedback">feedbacks</a>

                                `;
                   
                            eventsContainer.appendChild(eventCard);
                        });
                    } catch (error) {
                        console.error("Error fetching events:", error);
                        eventsContainer.innerHTML = "<p class='text-center text-red-500'>Failed to load events.</p>";
                    }
                };
        
                fetchEvents();
            }
        });
        
// 
document.getElementById("resourceForm").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent form from reloading the page

    const materialName = document.getElementById("event-material").value;
    const quantity = document.getElementById("quantity").value;
    const evt = document.getElementById("evt-name").value;

    const resourceData = { materialName, quantity,evt };

    try {
        const response = await fetch("http://localhost:3000/resources", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resourceData),
        });

        const result = await response.json();
        if (response.ok) {
            alert("Resource added successfully!");
            document.getElementById("resourceForm").reset(); // Clear form after submission
        } else {
            alert("Error: " + result.error);
        }
    } catch (error) {
        alert("Failed to connect to the server");
    }
});

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("verifyForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        
        const uniqueNumber = document.getElementById("uniqueNumber").value.trim();

        if (!uniqueNumber) {
            document.getElementById("verifyResult").innerText = "Please enter a unique number.";
            return;
        }

        const response = await fetch("/verify-student", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uniqueNumber })
        });

        const data = await response.json();
        document.getElementById("verifyResult").innerText = data.message;
    });
});


