sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet"
],
function (Controller, JSONModel , exportLibrary, Spreadsheet) {
    "use strict";

    return Controller.extend("com.sce.epportal.enterpriseprocurementportal.controller.RequestType", {
        onInit: function () {
           
         var model = this.getOwnerComponent().getModel("datamodel");
         this.getView().setModel(model, "dataModel");
         console.log(model);
 
            var oViewModel = new JSONModel({
                isEditMode: false // Default mode is non-editable
            });
            this.getView().setModel(oViewModel, "viewModel");
 
        },
 
        onAdd: function () {
            // Check if fragment exists; if not, create it
            if (!this.fragment) {
                this.fragment = sap.ui.xmlfragment("com.sce.epportal.enterpriseprocurementportal.view.RequestType", this);
                this.getView().addDependent(this.fragment);
            }
            // Open the fragment
            this.fragment.open();
        },
         
        onCancel:function(oEvent){
            if(this.fragment){
              this.fragment.close();
              this.fragment.destroy();
              this.fragment = null
            }
          },
 
 
        formatBoolean: function (sValue) {
            return sValue === "true";
        },
        handleUpload: function (oEvent) {
            var that = this;
            var files = oEvent.getParameter("files");
            if (files.length > 0) {
                var reader = new FileReader();
 
                reader.onload = function (e) {
                    var data = e.target.result;
                    var workbook = XLSX.read(data, {
                        type: "binary"
                    });
 
                    var tableData = [];
                    workbook.SheetNames.forEach(sheetName => {
                        var xl_row_data = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                        tableData = [...tableData, ...xl_row_data];
                    });
 
                    // Bind data to JSON model for display in the table
                    var jModel = new JSONModel({ Object: tableData });
                    that.getView().setModel(jModel, "dataModel");
 
                   
                };
 
                reader.onerror = function (ex) {
                    console.log(ex);
                };
 
                reader.readAsBinaryString(files[0]);
            }
        },
 
        onExport: function () {
            // Get reference to the table
            var oTable = this.byId("reuestTypeTable");
       
            // Get the binding of the table's rows (assumes data is bound to rows)
            var oBinding = oTable.getBinding("rows");
            var aTableData = oBinding.getModel().getProperty(oBinding.getPath());
       
            // Prepare the export data
            var aExportData = [];
            aTableData.forEach(function (oData) {
                aExportData.push({
                    "KEY": oData.KEY,
                    "IntakeRequestType": oData.IntakeRequestType,
                    "ACTIVE": oData.ACTIVE,
                    "HelpText": oData.HelpText,
                });
            });
       
            // Define column structure for export
            var aCols = [
                { label: "KEY", property: "KEY" },
                { label: "IntakeRequestType", property: "IntakeRequestType" },
                { label: "ACTIVE", property: "ACTIVE" },
                { label: "HelpText", property: "HelpText" }
            ];
       
            // Create export settings
            var oSettings = {
                workbook: { columns: aCols },
                dataSource: aExportData,
                fileName: "ExportedData.xlsx",
                worker: false // Disable worker due to CSP restrictions in some environments
            };
       
            // Create a new Spreadsheet and start the export
            var oSpreadsheet = new Spreadsheet(oSettings);
            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },
 
     
onEdit: function () {
    // Get the ViewModel
    var oViewModel = this.getView().getModel("viewModel");
 
    // Toggle the edit mode
    var bIsEditMode = oViewModel.getProperty("/isEditMode");
    oViewModel.setProperty("/isEditMode", !bIsEditMode);
 
    // If entering edit mode, change the button text to "Save"
    if (!bIsEditMode) {
        sap.m.MessageToast.show("Edit mode activated");
    }
},
 
onAdd: function () {
    // Check if fragment exists; if not, create it
    if (!this.fragment) {
        this.fragment = sap.ui.xmlfragment("com.sce.epportal.enterpriseprocurementportal.view.RequestType", this);
        this.getView().addDependent(this.fragment);
    }
    // Open the fragment
    this.fragment.open();
},
 
  onClose:function(oEvent){
    if(this.fragment){
      this.fragment.close();
      this.fragment.destroy();
      this.fragment = null
    }
  },
 
  onSubmit: function () {
    // Retrieve values from dialog inputs
    var sIntakeRequestType = sap.ui.getCore().byId("inputIntakeRequestType").getValue();
   // var bActive = sap.ui.getCore().byId("checkBoxActive").getSelected();
    var sHelpText = sap.ui.getCore().byId("inputHelpText").getValue();
 
    // Generate a unique key
    var sKey = "KEY_" + new Date().getTime();
 
    // Get model and existing data
    var oModel = this.getView().getModel("dataModel");
    var aData = oModel.getProperty("/Object") || [];
 
    // Add new entry to the data array
    aData.push({
        KEY: sKey,
        IntakeRequestType: sIntakeRequestType,
        //ACTIVE: bActive,
        HelpText: sHelpText
    });
 
    // Update model
    oModel.setProperty("/Object", aData);
 
    // Close and destroy the fragment
    this.onCancel();
},
 
onsave: function () {
    var oViewModel = this.getView().getModel("viewModel");
 
    // Set edit mode to false after saving
    oViewModel.setProperty("/isEditMode", false);
 
    // Implement any additional logic for saving data to the backend if needed
    sap.m.MessageToast.show("Changes have been saved.");
},
 
 
onCustomFieldChange: function() {
    var oTable = this.byId("reuestTypeTable");
    var oBinding = oTable.getBinding("rows");
 
    // Get selected keys from the MultiComboBox elements
    var aServiceNameFilter = this.byId("multiComboBox").getSelectedKeys();
    var aActiveFilter = this.byId("multiComboBoxActive").getSelectedKeys();
    var aHelpTextFilter = this.byId("multiComboBoxHelpText").getSelectedKeys();
 
    // Initialize an array to store filters
    var aFilters = [];
 
    // Service Name filter
    if (aServiceNameFilter.length > 0) {
        var aServiceFilters = aServiceNameFilter.map(function(sKey) {
            return new sap.ui.model.Filter("IntakeRequestType", sap.ui.model.FilterOperator.EQ, sKey);
        });
        aFilters.push(new sap.ui.model.Filter({ filters: aServiceFilters, and: false }));
    }
 
    // Active filter
    if (aActiveFilter.length > 0) {
        var aActiveFilters = aActiveFilter.map(function(sKey) {
            return new sap.ui.model.Filter("ACTIVE", sap.ui.model.FilterOperator.EQ, sKey);
        });
        aFilters.push(new sap.ui.model.Filter({ filters: aActiveFilters, and: false }));
    }
 
    // HelpText filter
    if (aHelpTextFilter.length > 0) {
        var aHelpTextFilters = aHelpTextFilter.map(function(sKey) {
            return new sap.ui.model.Filter("HelpText", sap.ui.model.FilterOperator.EQ, sKey);
        });
        aFilters.push(new sap.ui.model.Filter({ filters: aHelpTextFilters, and: false }));
    }
 
    // Apply filters to the table's binding
    if (aFilters.length > 0) {
        oBinding.filter(new sap.ui.model.Filter({ filters: aFilters, and: false }));
    } else {
        oBinding.filter([]);  // Clear filters if no selections are made
    }
}
    });
});
