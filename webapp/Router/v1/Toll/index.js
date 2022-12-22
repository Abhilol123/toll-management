const Express = require("express");
const tollHelper = require("./TollHelper");

const tollRouter = Express.Router();

/**
 * Post for a perticular car with number
 */
tollRouter.post("/", async (req, res, next) => {
	try {
		if (!req.body?.vehicleNumber || !(/^[0-9A-Z]+$/).test(req.body.vehicleNumber)) {
			return res.status(400).send({ status: "BAD_REQUEST", errorMessage: "Please enter a valid vehicle number" });
		};
		if (!req.body?.vehicleType || !(/^[1-2]+$/).test(req.body.vehicleType)) {
			return res.status(400).send({ status: "BAD_REQUEST", errorMessage: "Please enter a valid vehicle type" });
		};
		if (!req.body?.direction || !(/^[1-2]+$/).test(req.body.direction)) {
			return res.status(400).send({ status: "BAD_REQUEST", errorMessage: "Please enter a valid direction" });
		};
		if (!req.body?.tollBooth || !(/^[0-9]+$/).test(req.body.tollBooth)) {
			return res.status(400).send({ status: "BAD_REQUEST", errorMessage: "Please enter a valid tollBooth" });
		};

		// Check for whether the tool booth exists
		const tollBoothDetails = await tollHelper.checkForTollBooth(req.body.tollBooth);
		switch (tollBoothDetails.status) {
			case "SUCCESS":
				break;
			case "NOT_FOUND":
				return res.status(400).send({ status: "BAD_REQUEST", errorMessage: "Please enter a valid tollBooth" });
			default:
				return res.status(500).send({ status: "INTERNAL_SERVER_ERROR", errorMessage: "Something went wrong. Please try again later." });
		};

		// Check for whether the vehicle exists if not add
		const checkForVehicleIfNotAddResult = await tollHelper.checkForVehicleIfNotAdd(req.body.vehicleNumber, req.body.vehicleType);
		switch (checkForVehicleIfNotAddResult.status) {
			case "SUCCESS":
				break;
			default:
				return res.status(500).send({ status: "INTERNAL_SERVER_ERROR", errorMessage: "Something went wrong. Please try again later." });
		}

		// Get any pass if exists
		const passDetails = tollHelper.getValidPassDetails(req.body.vehicleNumber, req.body.tollBooth, req.body.direction);
		switch (passDetails.status) {
			case "SUCCESS":
				// If pass exists, modify pass if nesaccery
				if (passDetails.data[0].pass_type === 2) {
					const updateReturnPassResult = await tollHelper.updateReturnPass(passDetails.data[0].id);
					switch (updateReturnPassResult.status) {
						case "SUCCESS":
							break;
						default:
							return res.status(500).send({ status: "INTERNAL_SERVER_ERROR", errorMessage: "Something went wrong. Please try again later." });
					}
				}

				// Track vehicle and amount details
				const trackVehicleDetailsResult = await tollHelper.trackVehicleDetails(req.body.tollBooth, req.body.planType, req.body.vehicleNumber, req.body.direction, req.body.amountPaid);
				switch (trackVehicleDetailsResult.status) {
					case "SUCCESS":
						break;
					default:
						return res.status(500).send({ status: "INTERNAL_SERVER_ERROR", errorMessage: "Something went wrong. Please try again later." });
				}
				return res.status(200).send({ status: "SUCCESS" });
			case "NOT_FOUND":
				// If pass does not exist, send back pass cost details
				return res.status(404).send({ status: "NOT_FOUND", costDetails: tollBoothDetails.data });
			default:
				return res.status(500).send({ status: "INTERNAL_SERVER_ERROR", errorMessage: "Something went wrong. Please try again later." });
		}
	} catch (err) {
		console.error("Error: Queries. failed with error: ", err);
		return res.status(500).send({ status: "INTERNAL_SERVER_ERROR", errorMessage: "Something went wrong. Please try again later." });
	}
});

/**
 * Post for a perticular car with number
 */
tollRouter.post("/order", async (req, res, next) => {
	try {
		if (!req.body?.vehicleNumber || !(/^[0-9A-Z]+$/).test(req.body.vehicleNumber)) {
			return res.status(400).send({ status: "BAD_REQUEST", errorMessage: "Please enter a valid vehicle number" });
		};
		if (!req.body?.vehicleType || !(/^[1-2]+$/).test(req.body.vehicleType)) {
			return res.status(400).send({ status: "BAD_REQUEST", errorMessage: "Please enter a valid vehicle type" });
		};
		if (!req.body?.direction || !(/^[1-2]+$/).test(req.body.direction)) {
			return res.status(400).send({ status: "BAD_REQUEST", errorMessage: "Please enter a valid direction" });
		};
		if (!req.body?.tollBooth || !(/^[0-9]+$/).test(req.body.tollBooth)) {
			return res.status(400).send({ status: "BAD_REQUEST", errorMessage: "Please enter a valid tollBooth" });
		};
		if (!req.body?.planType || !(/^[1-3]+$/).test(req.body.planType)) {
			return res.status(400).send({ status: "BAD_REQUEST", errorMessage: "Please enter a valid planType" });
		};
		if (!req.body?.amountPaid || !(/^[0-9]+.[0-9]+$/).test(req.body.amountPaid)) {
			return res.status(400).send({ status: "BAD_REQUEST", errorMessage: "Please enter a valid amountPaid" });
		};
		// Check for whether the tool booth exists
		const tollBoothDetails = await tollHelper.checkForTollBooth(req.body.tollBooth);
		switch (tollBoothDetails.status) {
			case "SUCCESS":
				break;
			case "NOT_FOUND":
				return res.status(400).send({ status: "BAD_REQUEST", errorMessage: "Please enter a valid tollBooth" });
			default:
				return res.status(500).send({ status: "INTERNAL_SERVER_ERROR", errorMessage: "Something went wrong. Please try again later." });
		};

		// Check for whether the vehicle exists if not add
		const checkForVehicleIfNotAddResult = await tollHelper.checkForVehicleIfNotAdd(req.body.vehicleNumber, req.body.vehicleType);
		switch (checkForVehicleIfNotAddResult.status) {
			case "SUCCESS":
				break;
			default:
				return res.status(500).send({ status: "INTERNAL_SERVER_ERROR", errorMessage: "Something went wrong. Please try again later." });
		}

		// Create new pass if needed.
		if (req.body.planType > 1) {
			const createNewPassResult = await tollHelper.createNewPass(req.body.tollBooth, req.body.planType === 2 ? (req.body.direction === 1 ? 2 : 1) : 3, req.body.vehicleNumber, req.body.direction === 1 ? 2 : 1, req.body.planType === 2 ? "CURRENT_TIMESTAMP + INTERVAL '24 HOURS'" : "CURRENT_TIMESTAMP + INTERVAL '7 DAYS'");
			switch (createNewPassResult.status) {
				case "SUCCESS":
					break;
				default:
					return res.status(500).send({ status: "INTERNAL_SERVER_ERROR", errorMessage: "Something went wrong. Please try again later." });
			}
		}

		// Track vehicle and amount details
		const trackVehicleDetailsResult = await tollHelper.trackVehicleDetails(req.body.tollBooth, req.body.planType, req.body.vehicleNumber, req.body.direction, req.body.amountPaid);
		switch (trackVehicleDetailsResult.status) {
			case "SUCCESS":
				break;
			default:
				return res.status(500).send({ status: "INTERNAL_SERVER_ERROR", errorMessage: "Something went wrong. Please try again later." });
		}

		return res.status(200).send({ status: "SUCCESS" });
	} catch (err) {
		console.error("Error: Queries. failed with error: ", err);
		return res.status(500).send({ status: "INTERNAL_SERVER_ERROR", errorMessage: "Something went wrong. Please try again later." });
	}
});

/**
 * Get the metric dashboard
 */
tollRouter.get("/", async (req, res, next) => {
	try {
		const tollMetricsResult = await tollHelper.getTollMetrics();
		switch (tollMetricsResult.status) {
			case "SUCCESS":
				break;
			default:
				return res.status(500).send({ status: "INTERNAL_SERVER_ERROR", errorMessage: "Something went wrong. Please try again later." });
		}
		res.status(200).send({ status: "SUCCESS", data: tollMetricsResult.data });
	} catch (err) {
		console.error("Error: Queries. failed with error: ", err);
		return res.status(500).send({ status: "INTERNAL_SERVER_ERROR", errorMessage: "Something went wrong. Please try again later." });
	}
});

module.exports = tollRouter;
