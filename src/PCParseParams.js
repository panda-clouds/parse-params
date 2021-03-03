class PCParseParams {
	static areParamsDefined(params, req_list) {
		for (let i = 0; i < req_list.length; ++i) {
			if (!Object.prototype.hasOwnProperty.call(params, req_list[i])) {
				return false;
			}
		}

		return true;
	}

	static paramTypeCheck(params, req_list, verbosity = 0) {
		for (const [key, value] of Object.entries(req_list)) {
			// is the param defined?
			if (!Object.prototype.hasOwnProperty.call(params, key)) {
				let err_str = 'Param not defined';

				if (verbosity > 0) {
					err_str += ' (' + key + ')';
				}

				if (verbosity > 1) {
					err_str += ' (' + JSON.stringify(params, null, 2) + ')';
				}

				throw Error(err_str);
			}

			// is it the correct type?
			const type = typeof(params[key]);

			if ((type !== value) && (value !== 'na')) {
				let err_str = 'Type mismatch';

				if (verbosity > 0) {
					err_str += ' (' + key + ': ' + type + ', ' + value + ')';
				}

				if (verbosity > 1) {
					err_str += ' (' + JSON.stringify(params, null, 2) + ')';
				}

				throw Error(err_str);
			}
		}

		return true;
	}

	static boundsCheck(value, bounds) {
		if (Object.prototype.hasOwnProperty.call(bounds, 'lower')) {
			if (value < bounds.lower) {
				throw Error('Value out of bounds');
			}
		}

		if (Object.prototype.hasOwnProperty.call(bounds, 'upper')) {
			if (value > bounds.upper) {
				throw Error('Value out of bounds');
			}
		}

		return true;
	}

	static paramIsDefined(params, key) {
		return Object.prototype.hasOwnProperty.call(params, key);
	}

	static paramsNotEmpty(params, keys) {
		for (const key of keys) {
			if (params[key] === null || params[key] === '') {
				return false;
			}
		}

		return true;
	}

	static mustNotBeEmpty(params, keys, msg = 'Value not defined') {
		if (!PCParseParams.paramsNotEmpty(params, keys)) {
			throw new Error(msg);
		}

		return true;
	}
}

module.exports = PCParseParams;
