const Queries = require("APIhelper/Queries");

const tollHelper = {};

tollHelper.checkForTollBooth = async (boothId) => {
	const tollBoothDetails = await Queries.getTollBoothById(boothId);
	if (!tollBoothDetails) {
		return { status: "ERROR" };
	}
	if (tollBoothDetails.length < 1 || !tollBoothDetails[0]) {
		return { status: "NOT_FOUND" };
	}
	return { status: "SUCCESS", data: tollBoothDetails };
}

tollHelper.checkForVehicleIfNotAdd = async (vehicleNumber, vehicleType) => {
	const vehicleDetails = await Queries.getVehicleByNumber(vehicleNumber);
	if (!vehicleDetails) {
		return { status: "ERROR" };
	}
	if (vehicleDetails.length >= 1 && vehicleDetails[0]) {
		return { status: "SUCCESS", data: vehicleDetails };
	}
	const newVehicleDetails = await Queries.insertNewVehicleInDB(vehicleNumber, vehicleType);
	if (!newVehicleDetails || newVehicleDetails.length < 1 || !newVehicleDetails[0]) {
		return { status: "ERROR" };
	}
	return { status: "SUCCESS", data: newVehicleDetails };
}

tollHelper.getValidPassDetails = async (vehicleNumber, tollBoothId, direction) => {
	const passDetails = await Queries.getAllValidPassesForVehicleAndRoute(vehicleNumber, tollBoothId, direction);
	if (!passDetails) {
		return { status: "ERROR" };
	}
	if (!passDetails.length < 1 || !passDetails[0]) {
		return { status: "NOT_FOUND" };
	}
	return { status: "SUCCESS", data: passDetails };
}

tollHelper.updateReturnPass = async (passId) => {
	const updateReturnPassResult = Queries.updatePassDetails(passId);
	if (!updateReturnPassResult) {
		return { status: "ERROR" };
	}
	return { status: "SUCCESS" };
}

tollHelper.createNewPass = async (toll_booth, pass_type, vehicle_number, direction, expiry) => {
	const insertNewVehiclePassInDBResults = Queries.insertNewVehiclePassInDB({
		toll_booth,
		pass_type,
		vehicle_number,
		direction,
		expiry
	});
	if (!insertNewVehiclePassInDBResults || !insertNewVehiclePassInDBResults.length < 1 || !insertNewVehiclePassInDBResults[0]) {
		return { status: "ERROR" };
	}
	return { status: "SUCCESS", data: insertNewVehiclePassInDBResults };
}

tollHelper.trackVehicleDetails = async (toll_booth, pass_type, vehicle_number, direction, amount_paid) => {
	const insertVehiclePassMetricsResult = Queries.insertVehiclePassMetrics({
		toll_booth,
		pass_type,
		vehicle_number,
		direction,
		amount_paid
	});
	if (!insertVehiclePassMetricsResult || !insertVehiclePassMetricsResult.length < 1 || !insertVehiclePassMetricsResult[0]) {
		return { status: "ERROR" };
	}
	return { status: "SUCCESS", data: insertVehiclePassMetricsResult };
}

tollHelper.getTollMetrics = async () => {
	const boothMetricsResult = await Queries.getTollBoothMetrics();
	if (!boothMetricsResult) {
		return { status: "ERROR" };
	}
	return { status: "SUCCESS", data: boothMetricsResult };
}

module.exports = tollHelper;
