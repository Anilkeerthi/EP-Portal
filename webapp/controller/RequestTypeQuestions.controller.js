sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
function (Controller) {
    "use strict";

    return Controller.extend("com.sce.epportal.enterpriseprocurementportal.controller.RequestTypeQuestions", {
        onInit: function () {

            var data=  this.getOwnerComponent().getModel("requestData");
            this.getView().setModel(data,"JSONModel")
            console.log(data)

        }
    });
});
