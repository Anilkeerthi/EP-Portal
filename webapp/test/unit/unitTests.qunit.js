/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comsceepportal/enterprise_procurement_portal/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
