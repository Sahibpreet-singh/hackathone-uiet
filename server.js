const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// MongoDB Connection
mongoose.connect("mongodb+srv://pranavuchiha98:zR3Mh2lf2fE7jBHZ@cluster0.p3rfq.mongodb.net/createevent?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ MongoDB Error:", err));

// 🟢 User Schema
const userSchema = new mongoose.Schema({
    username: String,
    email: { type: String, unique: true },
    password: String,
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
    eventsJoined: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }]
});

const User = mongoose.model("User", userSchema);

// 🟢 Event Schema
const eventSchema = new mongoose.Schema({
    name: String,
    date: String,
    time: String,
    place: String
});
const Event = mongoose.model("Event", eventSchema);

// 🟢 Resource Schema
const resourceSchema = new mongoose.Schema({
    materialName: { type: String, required: true },
    quantity: { type: Number, required: true }
});
const Resource = mongoose.model("Resource", resourceSchema);

// **SIGN-UP API**
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "⚠ Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });

        await newUser.save();
        res.status(201).json({ message: "✅ Account created, pending approval" });
    } catch (error) {
        res.status(500).json({ message: "❌ Server error" });
    }
});

// **LOGIN API**
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "⚠ User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "⚠ Invalid password" });

        res.status(200).json({ message: "✅ Login successful", status: user.status });
    } catch (error) {
        res.status(500).json({ message: "❌ Server error" });
    }
});

// **CREATE EVENT API**
app.post("/create-event", async (req, res) => {
    try {
        const { name, date, time, place } = req.body;
        const newEvent = new Event({ name, date, time, place });
        await newEvent.save();
        res.status(201).json({ message: "✅ Event created successfully" });
    } catch (error) {
        res.status(500).json({ message: "❌ Failed to create event" });
    }
});

// **GET EVENTS API**
app.get("/get-events", async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: "❌ Failed to fetch events" });
    }
});

// 🟢 Student Schema for Attendance
const studentSchema = new mongoose.Schema({
    name: String,
    email: String,
    uniqueNumber: String,
    attendance: { type: Number, default: 0 }
});
const Student = mongoose.model("Student", studentSchema);

// **JOIN EVENT API**
// Function to generate a unique 6-digit number
const generateUniqueNumber = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// **JOIN EVENT API (Updated)**
app.post("/join-event", async (req, res) => {
    try {
        const { name, email } = req.body;

        // Generate a unique number (random 6-digit)
        const uniqueNumber = Math.floor(100000 + Math.random() * 900000).toString();

        // Check if user already exists
        let student = await Student.findOne({ email });
        if (!student) {
            student = new Student({ name, email, uniqueNumber, attendance: 0 });
            await student.save();
        }

        res.status(201).json({ message: "✅ Successfully joined event!", uniqueNumber });
    } catch (error) {
        res.status(500).json({ message: "❌ Server error" });
    }
});




// **VERIFY STUDENT API**


// 🟢 ADD RESOURCE API
app.post("/resources", async (req, res) => {
    try {
        const { materialName, quantity } = req.body;
        const resource = new Resource({ materialName, quantity });
        await resource.save();
        res.status(201).json({ message: "✅ Resource added successfully", resource });
    } catch (error) {
        res.status(500).json({ error: "❌ Failed to add resource" });
    }
});

// 🟢 GET ALL RESOURCES API
app.get("/resources", async (req, res) => {
    try {
        const resources = await Resource.find();
        res.status(200).json(resources);
    } catch (error) {
        res.status(500).json({ error: "❌ Failed to fetch resources" });
    }
});

app.post("/verify-student", async (req, res) => {
    try {
        const { uniqueNumber } = req.body;

        // Find the student in the database
        const student = await Student.findOne({ uniqueNumber });

        if (!student) {
            return res.status(404).json({ message: "⚠ Student not found!" });
        }

        // Increment attendance if student exists
        student.attendance += 1;
        await student.save();

        res.status(200).json({ 
            message: `✅ Verified: ${student.name} (${student.email})`, 
            attendance: student.attendance 
        });
    } catch (error) {
        res.status(500).json({ message: "❌ Server error" });
    }
});

app.get("/my-events", async (req, res) => {
    try {
        const userEmail = req.query.email;

        // Find user based on email
        const user = await User.findOne({ email: userEmail }).populate("eventsJoined");

        if (!user) {
            return res.status(404).json({ message: "⚠ User not found" });
        }

        res.status(200).json(user.eventsJoined);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "❌ Internal Server Error" });
    }
});



app.get("/api/user-profile", async (req, res) => {
    try {
        const userId = req.query.id; // Get user ID from query parameters
        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(userId).select("name email");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
app.get("/students", async (req, res) => {
    try {
        const students = await Student.find(); // Fetch all students
        res.status(200).json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "❌ Failed to fetch students" });
    }
});

const feedbackSchema = new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    date: { type: Date, default: Date.now }
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

app.post("/submit-feedback", async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const newFeedback = new Feedback({ name, email, message });

        await newFeedback.save();
        res.status(201).json({ message: "✅ Feedback submitted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "❌ Failed to submit feedback." });
    }
});

app.get("/attendance-analysis", async (req, res) => {
    try {
        const students = await Student.find().sort({ attendance: -1 }); // Sort by highest attendance
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: "❌ Server error" });
    }
});

app.get("/api/resources/event/:eventId", async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const resources = await Equipment.find({ eventId });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ error: "Error fetching resources" });
    }
});



const EquipmentSchema = new mongoose.Schema({
    eventId: {
        type: String,
        required: true,
    },
    itemName: {
        type: String,
        required: true,
    },
    totalQuantity: {
        type: Number,
        required: true,
    },
    usedQuantity: {
        type: Number,
        default: 0,
    },
    costPerItem: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model("Equipment", EquipmentSchema);


// Add new equipment
app.post("/api/resources", async (req, res) => {
    try {
        const { eventId, itemName, totalQuantity, costPerItem } = req.body;
        const newEquipment = new Equipment({
            eventId,
            itemName,
            totalQuantity,
            usedQuantity: 0,
            costPerItem,
        });
        await newEquipment.save();
        res.status(201).json(newEquipment);
    } catch (error) {
        res.status(500).json({ error: "Error adding equipment" });
    }
});

// Apply usage of equipment in real-time
app.put("/api/resources/apply/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const equipment = await Equipment.findById(id);
        if (!equipment) {
            return res.status(404).json({ error: "Equipment not found" });
        }
        if (equipment.usedQuantity < equipment.totalQuantity) {
            equipment.usedQuantity += 1;
            await equipment.save();
            res.json(equipment);
        } else {
            res.status(400).json({ error: "No more items available to use" });
        }
    } catch (error) {
        res.status(500).json({ error: "Error applying equipment usage" });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// **Serve HTML Files for Frontend**
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "sign.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "public", "login.html")));
app.get("/teacher", (req, res) => res.sendFile(path.join(__dirname, "public", "teacher.html")));
app.get("/student", (req, res) => res.sendFile(path.join(__dirname, "public", "student.html")));
app.get("/events", (req, res) => res.sendFile(path.join(__dirname, "public", "past-event.html")));
app.get("/verify", (req, res) => res.sendFile(path.join(__dirname, "public", "verify.html"))); // Added Verify Page
app.get("/feedback", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "feedback.html"));
});
app.get("/attendance", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "attendance.html"));
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
