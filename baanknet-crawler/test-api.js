const { chromium } = require("playwright");

(async () => {
    const browser = await chromium.launch({
        headless: false
    });

    const context = await browser.newContext();

    const page = await context.newPage();

    try {

        const response = await page.request.post(
            "https://baanknet.com/api/v1/property/detail/property-filter",
            {
                data: {
                    search: {
                        stateId: 36,
                        cityId: 7391,
                        propTypeOfActionId: []
                    },

                    range: {},

                    sort: {
                        type: "mostrecent",
                        postedSince: ""
                    },

                    page: 1,
                    limit: 10
                }
            }
        );

        console.log("STATUS:", response.status());

        const data = await response.json();

        console.log(
            JSON.stringify(data, null, 2)
        );

    } catch (error) {

        console.error("ERROR:");
        console.error(error);

    } finally {

        await browser.close();

    }
})();