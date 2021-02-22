const { isApplicableMessage, buildPayload } = require('./pubsub');
const messageFixture1 = {
	worker: 'ripper'
};
const messageFixture2 = {
	worker: 'transcoder'
}


describe('pubsub', () => {
	describe('isApplicableMessage', () => {
		test('pattern matching', () => {
			const outcome1 = isApplicableMessage(messageFixture1, 'ripper');
			const outcome2 = isApplicableMessage(messageFixture1, 'taco');
			const outcome3 = isApplicableMessage(messageFixture2, 'transcoder');
			const outcome4 = isApplicableMessage(messageFixture2, 'transcoder|builder');
			expect(outcome1).toBeTruthy();
			expect(outcome2).toBeFalsy();
			expect(outcome3).toBeTruthy();
			expect(outcome4).toBeTruthy();
		})
	});

	describe('buildPayload', () => {
		test('payload building', () => {
			const outcome = buildPayload('ripper', '123abc');
			expect(outcome).toStrictEqual({
				worker: 'ripper',
				payload: '123abc'
			})
		})
	})
})