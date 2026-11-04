const test = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");
const register = require("./fresh-properties");

function setup(overrides = {}) {
    const routes = {};
    let schema;
    const model = { ...overrides };
    const guard = () => {};
    const app = Object.fromEntries(["get", "post", "put", "delete"].map(method => [method, (path, ...handlers) => { routes[`${method} ${path}`] = handlers; }]));
    register(app, { Schema: mongoose.Schema, model: (name, definition) => { schema = definition; return model; } }, guard);
    const res = { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    return { routes, guard, schema, res };
}

test("public listings only query published properties; every admin route requires the guard", async () => {
    let filter;
    const { routes, guard, res } = setup({ find(query) { filter = query; return { sort: () => ({ lean: async () => [] }) }; } });
    await routes["get /api/fresh-properties"][0]({}, res);
    assert.deepEqual(filter, { isPublished: true });
    assert.equal(res.body.success, true);
    for (const [route, handlers] of Object.entries(routes)) {
        if (route.includes("/admin/")) assert.equal(handlers[0], guard, route);
    }
});

test("new listings default to draft and reject invalid price, photo URL and fractional bedrooms", () => {
    const { schema } = setup();
    const Model = mongoose.models.FreshPropertyValidationTest || mongoose.model("FreshPropertyValidationTest", schema);
    const valid = { title: "Apartment", price: 5000000, propertyType: "Apartment", address: "Main Road", city: "Kolkata", state: "West Bengal", features: ["Parking"] };
    const property = new Model(valid);
    assert.equal(property.isPublished, false);
    assert.equal(property.validateSync(), undefined);
    assert.equal(new Model({ ...valid, bedrooms: null, bathrooms: null, area: null }).validateSync(), undefined);
    for (const invalid of [{ price: -1 }, { title: " " }, { photos: ["javascript:alert(1)"] }, { bedrooms: 1.5 }]) {
        assert.ok(new Model({ ...valid, ...invalid }).validateSync());
    }
});

test("create allows only listing fields and returns the saved property", async () => {
    let saved;
    const { routes, res } = setup({ create: async data => { saved = data; return { _id: "fresh-id", ...data }; } });
    await routes["post /api/admin/fresh-properties"][1]({ body: { title: "House", price: 100, isPublished: true, _id: "injected", createdAt: "injected" } }, res);
    assert.deepEqual(saved, { title: "House", price: 100, isPublished: true });
    assert.equal(res.code, 201);
    assert.equal(res.body.data._id, "fresh-id");
});

test("updates run validation and missing listings return 404", async () => {
    let options;
    const { routes, res } = setup({ findByIdAndUpdate: async (id, data, opts) => { options = opts; return null; }, findByIdAndDelete: async () => null });
    await routes["put /api/admin/fresh-properties/:id"][1]({ params: { id: "missing" }, body: { price: 500 } }, res);
    assert.equal(options.runValidators, true);
    assert.equal(res.code, 404);
    await routes["delete /api/admin/fresh-properties/:id"][1]({ params: { id: "missing" } }, res);
    assert.equal(res.code, 404);
});
