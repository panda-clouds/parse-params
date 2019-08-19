
const <> = require('../src/<>.js');
const PCParseRunner = require('@panda-clouds/parse-runner');

describe('the <>.js class', () => {
	const parseRunner = new PCParseRunner();

	parseRunner.helperClass('./<>.js');
	parseRunner.projectDir(__dirname + '/..');

	beforeAll(async () => {
		await parseRunner.startParseServer();
	}, 1000 * 60 * 2);

	afterAll(async () => {
		await parseRunner.cleanUp();
	});

	it('should <>', async () => {
		expect.assertions(1);

		const json_obj = { param1: 'value', param2: 123 };

		const result = await parseRunner.callHelper('areParamsDefined', [json_obj, ['param1', 'param2']]);

		expect(result).toBe(true);
	});
});
