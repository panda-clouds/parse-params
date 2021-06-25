const PCParseRunner = require('@panda-clouds/parse-runner');

let Parse;

describe('the PCParamsUtil.js class', () => {
	const parseRunner = new PCParseRunner();

	parseRunner.helperClass('./PCParseParams.js');
	parseRunner.projectDir(__dirname + '/..');
	parseRunner.injectCode(`
		Parse.Cloud.define('setEnv', request => {
			process.env[request.params.key] = request.params.value;
		});
		`);

	beforeAll(async () => {
		Parse = await parseRunner.startParseServer();
	}, 1000 * 60 * 2);

	afterAll(async () => {
		await parseRunner.cleanUp();
	});

	it('should return true if all the params are defined', async () => {
		expect.assertions(1);

		const json_obj = { param1: 'value', param2: 123 };

		const result = await parseRunner.callHelper('areParamsDefined', [json_obj, ['param1', 'param2']]);

		expect(result).toBe(true);
	});

	it('should return false if not all the params are defined', async () => {
		expect.assertions(1);

		const json_obj = { param1: 'value' };

		const result = await parseRunner.callHelper('areParamsDefined', [json_obj, ['param1', 'param2']]);

		expect(result).toBe(false);
	});

	describe('paramTypeCheck', () => {
		it('should handle empty requirements', async () => {
			expect.assertions(1);

			const params = { param1: 'value' };
			const req = {};

			const result = await parseRunner.callHelper('paramTypeCheck', [params, req]);

			expect(result).toBe(true);
		});

		it('should handle strings', async () => {
			expect.assertions(1);

			const params = { param1: 'value' };
			const req = { param1: 'string' };

			const result = await parseRunner.callHelper('paramTypeCheck', [params, req]);

			expect(result).toBe(true);
		});

		it('should handle numbers', async () => {
			expect.assertions(1);

			const params = { param1: 69 };
			const req = { param1: 'number' };

			const result = await parseRunner.callHelper('paramTypeCheck', [params, req]);

			expect(result).toBe(true);
		});

		it('should handle bool', async () => {
			expect.assertions(1);

			const params = { param1: true };
			const req = { param1: 'boolean' };

			const result = await parseRunner.callHelper('paramTypeCheck', [params, req]);

			expect(result).toBe(true);
		});

		it('should handle objects', async () => {
			expect.assertions(1);

			const params = { param1: { nested: null } };
			const req = { param1: 'object' };

			const result = await parseRunner.callHelper('paramTypeCheck', [params, req]);

			expect(result).toBe(true);
		});

		it('should be able to ignore type checking when told to', async () => {
			expect.assertions(1);

			const params = { param1: 'value' };
			const req = { param1: 'na' };

			const result = await parseRunner.callHelper('paramTypeCheck', [params, req]);

			expect(result).toBe(true);
		});

		it('should error if a param is missing.', async () => {
			expect.assertions(1);

			const params = {};
			const req = { param1: 'string' };

			await expect(parseRunner.callHelper('paramTypeCheck', [params, req])).rejects.toThrow('500 internal server error: insufficient data');
		});

		it('should error if a param is of the wrong type.', async () => {
			expect.assertions(1);

			const params = { param1: 69 };
			const req = { param1: 'string' };

			await expect(parseRunner.callHelper('paramTypeCheck', [params, req])).rejects.toThrow('500 internal server error: incompatable data');
		});

		it('should error verbose missing param', async () => {
			expect.assertions(1);

			const params = {};
			const req = { param1: 'string' };

			await expect(parseRunner.callHelper('paramTypeCheck', [params, req, 1])).rejects.toThrow('Param not defined');
		});

		it('should error very verbose missing param', async () => {
			expect.assertions(1);

			const params = {};
			const req = { param1: 'string' };

			await expect(parseRunner.callHelper('paramTypeCheck', [params, req, 3])).rejects.toThrow('Param not defined (param1)');
		});

		it('should error verbose type mismatch', async () => {
			expect.assertions(1);

			const params = { param1: 69 };
			const req = { param1: 'string' };

			await expect(parseRunner.callHelper('paramTypeCheck', [params, req, 2])).rejects.toThrow('Type mismatch (param1: number, string)');
		});

		it('should error very verbose type mismatch', async () => {
			expect.assertions(1);

			const params = { param1: 69 };
			const req = { param1: 'string' };

			await expect(parseRunner.callHelper('paramTypeCheck', [params, req, 3])).rejects.toThrow('Type mismatch (param1: number, string)');
		});

		it('should show the default message(mismatch)', async () => {
			expect.assertions(1);

			const params = { param1: 69 };
			const req = { param1: 'string' };

			await expect(parseRunner.callHelper('paramTypeCheck', [params, req, 0])).rejects.toThrow('500 internal server error: incompatable data');
		});

		it('should show the default message(undefined)', async () => {
			expect.assertions(1);

			const params = {};
			const req = { param1: 'string' };

			await expect(parseRunner.callHelper('paramTypeCheck', [params, req, 0])).rejects.toThrow('500 internal server error: insufficient data');
		});

		it('should show custom message(mismatch)', async () => {
			expect.assertions(1);

			const params = { param1: 69 };
			const req = { param1: 'string' };

			await Parse.Cloud.run('setEnv', { key: 'PARAM_MISMATCH_MSG', value: 'Custom mismatch' });

			await expect(parseRunner.callHelper('paramTypeCheck', [params, req, 0])).rejects.toThrow('Custom mismatch');
		});

		it('should show custom message(undefined)', async () => {
			expect.assertions(1);

			const params = {};
			const req = { param1: 'string' };

			await Parse.Cloud.run('setEnv', { key: 'PARAM_NOT_DEFINED_MSG', value: 'Custom undefined' });

			await expect(parseRunner.callHelper('paramTypeCheck', [params, req, 0])).rejects.toThrow('Custom undefined');
		});
	});

	describe('boundsCheck', () => {
		it('should do nothing if there isnt anything to do', async () => {
			expect.assertions(1);

			const result = await parseRunner.callHelper('boundsCheck', [1, {}]);

			expect(result).toBe(true);
		});

		it('should fail on lower limit', async () => {
			expect.assertions(1);

			await expect(parseRunner.callHelper('boundsCheck', [1, { lower: 10 }])).rejects.toThrow('Value out of bounds');
		});

		it('should fail on upper limit', async () => {
			expect.assertions(1);

			await expect(parseRunner.callHelper('boundsCheck', [1, { upper: 0 }])).rejects.toThrow('Value out of bounds');
		});

		it('should pass when the value is in bounds', async () => {
			expect.assertions(1);

			const result = await parseRunner.callHelper('boundsCheck', [1, { lower: 0, upper: 10 }]);

			expect(result).toBe(true);
		});
	});

	describe('paramIsDefined', () => {
		it('should return true if the param is defined', async () => {
			expect.assertions(1);

			const result = await parseRunner.callHelper('paramIsDefined', [{ key: 'value' }, 'key']);

			expect(result).toBe(true);
		});

		it('should return false if the param is not defined', async () => {
			expect.assertions(1);

			const result = await parseRunner.callHelper('paramIsDefined', [{ key: 'value' }, 'value']);

			expect(result).toBe(false);
		});

		it('should return false if there are no params', async () => {
			expect.assertions(1);

			const result = await parseRunner.callHelper('paramIsDefined', [{}, 'key']);

			expect(result).toBe(false);
		});
	});

	describe('paramsNotEmpty', () => {
		it('should return true', async () => {
			expect.assertions(1);

			const result = await parseRunner.callHelper('paramsNotEmpty', [{ one: 'one', two: 'two' }, ['one', 'two']]);

			expect(result).toBe(true);
		});

		it('should return false', async () => {
			expect.assertions(1);

			const result = await parseRunner.callHelper('paramsNotEmpty', [{ one: 'one', two: '' }, ['one', 'two']]);

			expect(result).toBe(false);
		});
	});

	describe('mustNotBeEmpty', () => {
		it('should return true', async () => {
			expect.assertions(1);

			const result = await parseRunner.callHelper('mustNotBeEmpty', [{ one: 'one', two: 'two' }, ['one', 'two']]);

			expect(result).toBe(true);
		});

		it('should error', async () => {
			expect.assertions(1);

			await expect(parseRunner.callHelper('mustNotBeEmpty', [{ one: 'one', two: '' }, ['one', 'two']])).rejects.toThrow('Value not defined');
		});

		it('should custom error', async () => {
			expect.assertions(1);

			await expect(parseRunner.callHelper('mustNotBeEmpty', [{ one: 'one', two: '' }, ['one', 'two'], 'custom message'])).rejects.toThrow('custom message');
		});
	});
});
