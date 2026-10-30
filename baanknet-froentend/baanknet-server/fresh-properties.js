module.exports = function registerFreshProperties(app, mongoose, requireAdmin) {
    // Photos: a public image URL, or an image uploaded from the admin's device (compressed data URL, max ~3 MB)
    const isValidPhoto = (value) =>
        /^https?:\/\/\S+$/i.test(value) || (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value) && value.length < 3 * 1024 * 1024);

    // Ensure MongoDB is connected before querying
    const ensureConnected = async () => {
        if (mongoose.connection && mongoose.connection.readyState === 0 && process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 15000,
                tlsAllowInvalidCertificates: true
            });
        }
    };

    const schema = new mongoose.Schema({
        title: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, trim: true, maxlength: 10000 },
        price: { type: Number, required: true, min: 1 },
        propertyType: { type: String, required: true, enum: ["Apartment", "House", "Plot", "Commercial", "Industrial", "Other"] },
        address: { type: String, required: true, trim: true, maxlength: 500 },
        city: { type: String, required: true, trim: true, maxlength: 100 },
        state: { type: String, required: true, trim: true, maxlength: 100 },
        pincode: { type: String, trim: true, maxlength: 20 },
        latitude: { type: Number, min: -90, max: 90 },
        longitude: { type: Number, min: -180, max: 180 },
        area: { type: Number, min: 0 },
        bedrooms: { type: Number, min: 0, validate: value => value == null || Number.isInteger(value) },
        bathrooms: { type: Number, min: 0, validate: value => value == null || Number.isInteger(value) },
        features: [{ type: String, trim: true, maxlength: 150 }],
        photos: {
            type: [{ type: String, validate: { validator: isValidPhoto, message: "Each photo must be an http(s) image URL or an uploaded JPG/PNG/WEBP image." } }],
            validate: { validator: (list) => list.length <= 15, message: "A maximum of 15 photos is allowed." }
        },
        videos: [
            {
                url: { type: String, required: true, trim: true, maxlength: 1000 },
                source: { type: String, enum: ["upload", "youtube", "vimeo", "link"], default: "link" },
                title: { type: String, trim: true, maxlength: 120, default: "" }
            }
        ],
        // Optional direct contact shown to buyers (Call / WhatsApp). Enquiries always reach the admin Inquiries page.
        contactPhone: { type: String, trim: true, maxlength: 20, match: [/^$|^\+?[0-9 ]{8,18}$/, "Enter a valid contact phone number."] },
        isPublished: { type: Boolean, default: false }
    }, { timestamps: true });
    const FreshProperty = mongoose.model("FreshProperty", schema);
    const fields = ["title", "description", "price", "propertyType", "address", "city", "state", "pincode", "latitude", "longitude", "area", "bedrooms", "bathrooms", "features", "photos", "videos", "contactPhone", "isPublished"];
    const payload = body => Object.fromEntries(fields.filter(key => Object.hasOwn(body, key)).map(key => [key, body[key]]));
    const handleError = (res, error) => {
        const invalid = ["ValidationError", "CastError"].includes(error.name);
        res.status(invalid ? 400 : 500).json({ success: false, message: invalid ? error.message : "Unable to save or load fresh properties. Please try again." });
    };
    app.get("/api/fresh-properties", async (req, res) => {
        try {
            await ensureConnected();
            const data = await FreshProperty.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
            res.json({ success: true, data });
        } catch (error) { handleError(res, error); }
    });
    app.get("/api/admin/fresh-properties", requireAdmin, async (req, res) => {
        try {
            await ensureConnected();
            const data = await FreshProperty.find().sort({ createdAt: -1 }).lean();
            res.json({ success: true, data });
        } catch (error) { handleError(res, error); }
    });
    app.post("/api/admin/fresh-properties", requireAdmin, async (req, res) => {
        try {
            await ensureConnected();
            const data = await FreshProperty.create(payload(req.body));
            res.status(201).json({ success: true, data });
        } catch (error) { handleError(res, error); }
    });
    app.put("/api/admin/fresh-properties/:id", requireAdmin, async (req, res) => {
        try {
            const data = await FreshProperty.findByIdAndUpdate(req.params.id, { $set: payload(req.body) }, { new: true, runValidators: true });
            if (!data) return res.status(404).json({ success: false, message: "Fresh property not found." });
            res.json({ success: true, data });
        } catch (error) { handleError(res, error); }
    });
    app.delete("/api/admin/fresh-properties/:id", requireAdmin, async (req, res) => {
        try {
            const data = await FreshProperty.findByIdAndDelete(req.params.id);
            if (!data) return res.status(404).json({ success: false, message: "Fresh property not found." });
            res.json({ success: true });
        } catch (error) { handleError(res, error); }
    });
};
