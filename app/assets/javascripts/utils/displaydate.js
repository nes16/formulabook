define(['require', 'pjs', 'i18n'], function(require) {
    var P = require('pjs');
    var i18n = require('i18n');

	var DisplayDate = P(function(date) {
	});

    DisplayDate.compute = function(created) {
      var now = Date.now();
      var seconds = (now - created)/1000;
      var minutes = seconds/60;
      var hours = minutes/60;
      var days = hours/24;
      var weeks = days/7;
      var monthNames = [
        i18n.t('Jan'),
        i18n.t('Feb'),
        i18n.t('Mar'),
        i18n.t('Apr'),
        i18n.t('May'),
        i18n.t('Jun'),
        i18n.t('Jul'),
        i18n.t('Aug'),
        i18n.t('Sep'),
        i18n.t('Oct'),
        i18n.t('Nov'),
        i18n.t('Dec')
      ];

      if (weeks >= 5) {
        return i18n.t('on __month__ __day__, __year__', {
          month: monthNames[created.getMonth()],
          day: created.getDate(),
          year: created.getFullYear()
        });
      }
      if (weeks >= 2) return i18n.t('__number__ weeks ago', {number: String(Math.floor(weeks))});
      if (days >= 7) return i18n.t('last week');
      if (days >= 2) return i18n.t('__number__ days ago', {number: String(Math.floor(days))});
      if (hours >= 24) return i18n.t('yesterday');
      if (hours >= 2) return i18n.t('__number__ hours ago', {number: String(Math.floor(hours))});
      if (minutes >= 60) return i18n.t('one hour ago');
      if (minutes >= 2) return i18n.t('__number__ minutes ago', {number: String(Math.floor(minutes))});
      if (seconds >= 60) return i18n.t('one minute ago');
      return i18n.t('just now');
    }
    
    return DisplayDate;
});
