const PGUtils = require("./PGUtils");

const Queries = {};

Queries.getTollBoothById = async (boothId) => {
	let getTollBoothByIdQueryText = `
		SELECT id, name, two_wheel_cost, four_wheel_cost
		FROM public.toll_booth
		WHERE id = '${boothId}'
	;`;

	let err, getTollBoothByIdResult = await PGUtils.readQuery({ text: getTollBoothByIdQueryText });
	if (err) {
		console.error("Error: Queries.getTollBoothById failed with error: ", err);
		return;
	}
	return getTollBoothByIdResult;
}

Queries.getVehicleByNumber = async (vehicleNumber) => {
	let getVehicleByNumberQueryText = `
		SELECT number, type
		FROM public.vehicle
		WHERE number = '${vehicleNumber}'
	;`;

	let err, getVehicleByNumberResult = await PGUtils.readQuery({ text: getVehicleByNumberQueryText });
	if (err) {
		console.error("Error: Queries.getVehicleByNumber failed with error: ", err);
		return;
	}
	return getVehicleByNumberResult;
}

Queries.insertNewVehicleInDB = async (vehicleNumber, vehicleType) => {
	let insertNewVehicleInDBQueryText = `
		INSERT INTO public.vehicle (number, type)
		VALUES ('${vehicleNumber}', ${vehicleType})
		RETURNING number, type
	;`;

	let err, insertNewVehicleInDBResult = await PGUtils.writeQuery({ text: insertNewVehicleInDBQueryText });
	if (err) {
		console.error("Error: Queries.insertNewVehicleInDB failed with error: ", err);
		return;
	}
	return insertNewVehicleInDBResult;
}

Queries.getAllValidPassesForVehicleAndRoute = async (vehicleNumber, tollBoothId, direction) => {
	let getAllValidPassesForVehicleAndRouteQueryText = `
		SELECT id, toll_booth, pass_type, vehicle_number, direction, expiry
		FROM public.toll_vehicle_pass
		WHERE isUsed = FALSE AND toll_booth = ${tollBoothId} AND (direction = ${direction} OR direction = 3) AND number = '${vehicleNumber}' AND expiry > CURRENT_TIMESTAMP
	;`;

	let err, getAllValidPassesForVehicleAndRouteResult = await PGUtils.readQuery({ text: getAllValidPassesForVehicleAndRouteQueryText });
	if (err) {
		console.error("Error: Queries.getAllValidPassesForVehicleAndRoute failed with error: ", err);
		return;
	}
	return getAllValidPassesForVehicleAndRouteResult;
}

Queries.updatePassDetails = async (passId) => {
	let updatePassDetailsQueryText = `
		UPDATE public.toll_vehicle_pass
		SET isUsed = TRUE
		WHERE id = ${passId}
		RETURNING id, toll_booth, pass_type, vehicle_number, direction, expiry
	;`;

	let err, updatePassDetailsResult = await PGUtils.writeQuery({ text: updatePassDetailsQueryText });
	if (err) {
		console.error("Error: Queries.updatePassDetails failed with error: ", err);
		return;
	}
	return updatePassDetailsResult;
}

Queries.insertNewVehiclePassInDB = async (passDetails) => {
	let insertNewVehiclePassInDBQueryText = `
		INSERT INTO public.vehicle (toll_booth, pass_type, vehicle_number, direction, expiry, isUsed)
		VALUES (${passDetails.toll_booth}, ${passDetails.pass_type}, ${passDetails.vehicle_number}, ${passDetails.direction}, ${passDetails.expiry}, FALSE)
		RETURNING id, toll_booth, pass_type, vehicle_number, direction, expiry
	;`;

	let err, insertNewVehiclePassInDBResult = await PGUtils.writeQuery({ text: insertNewVehiclePassInDBQueryText });
	if (err) {
		console.error("Error: Queries.insertNewVehiclePassInDB failed with error: ", err);
		return;
	}
	return insertNewVehiclePassInDBResult;
}

Queries.insertVehiclePassMetrics = async (metricDetails) => {
	let insertVehiclePassMetricsQueryText = `
		INSERT INTO public.toll_tracking (toll_booth, pass_type, vehicle_number, direction, amount_paid)
		VALUES(${metricDetails.toll_booth}, ${metricDetails.pass_type}, ${metricDetails.vehicle_number}, ${metricDetails.direction}, ${metricDetails.amount_paid})
	;`;

	let err, insertVehiclePassMetricsResult = await PGUtils.writeQuery({ text: insertVehiclePassMetricsQueryText });
	if (err) {
		console.error("Error: Queries.insertVehiclePassMetrics failed with error: ", err);
		return;
	}
	return insertVehiclePassMetricsResult;
}

Queries.getTollBoothMetrics = async () => {
	let getTollBoothMetricsQueryText = `
		SELECT toll_booth, COUNT(*) AS total_vehicles, SUM(amount_paid) AS total_revenue
		FROM public.toll_tracking
		GROUP BY toll_booth
	;`;

	let err, getTollBoothMetricsResult = await PGUtils.readQuery({ text: getTollBoothMetricsQueryText });
	if (err) {
		console.error("Error: Queries.getTollBoothMetrics failed with error: ", err);
		return;
	}
	return getTollBoothMetricsResult;
}

module.exports = Queries;
