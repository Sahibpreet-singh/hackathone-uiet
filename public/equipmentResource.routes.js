const express = require("express");
const router = express.Router();
const EquipmentResource = require("../models/equipmentResource.model");

// 📌 GET resources by Event ID
router.get("/event/:eventId", async (req, res) => {
    try {
        const { eventId } = req.params;
        const resources = await EquipmentResource.find({ eventId });

        if (!resources.length) {
            return res.status(404).json({ error: "No resources found for this event" });
        }

        res.json(resources);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
