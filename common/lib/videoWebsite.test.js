const { getDateFromTitle } = require('./videoWebsite');
const { DateTime } = require('luxon');

describe('index', () => {
  describe('getDateFromTitle', () => {
    test('should handle a title created by youtube-dl', () => {
      const date = getDateFromTitle('projektmelody 2020-12-21 21_00-projektmelody');
      expect(date).toBe('2020-12-21');
    })
    test('should insert todays date when there is none in the title', () => {
      const today = DateTime.local().toFormat('yyyy-MM-dd');
      const date = getDateFromTitle('projektmelody stream is a cool strim');
      expect(date).toBe(today);
    })
  })
})
