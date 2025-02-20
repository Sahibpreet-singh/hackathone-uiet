
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

