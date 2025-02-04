sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";


    return Controller.extend("com.kt.sap.project2.controller.Details", {
        onInit: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("Details").attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function (oEvent) {
            var sData = oEvent.getParameter("arguments").data;

            if (!sData) {
                console.error("No data received in Detail view.");
                return;
            }

            try {
                var oData = JSON.parse(decodeURIComponent(sData));

                if (!oData || Object.keys(oData).length === 0) {
                    console.error("Parsed data is empty or invalid.");
                    return;
                }

                console.log("Received data in Detail view:", oData);

                // Set data to model
                var oModel = new sap.ui.model.json.JSONModel(oData);
                this.getView().setModel(oModel, "detailModel");

                // If this is a new entry, set edit mode
                if (oData.isNew) {
                    this.getView().getModel("detailModel").setProperty("/isEditable", true);
                    this.getView().byId("idEdit").setText("Save");
                } else {
                    this.getView().getModel("detailModel").setProperty("/isEditable", false);
                    this.getView().byId("idEdit").setText("Edit");
                }
            } catch (error) {
                console.error("Error parsing JSON:", error);
            }
        },




        handleEditPress: function () {
            var oModel = this.getView().getModel("detailModel");
            var bEditable = oModel.getProperty("/isEditable");

            if (bEditable) {
                // Save Data and Update Table
                this._saveUpdatedData();
                this.getView().byId("idEdit").setText("Edit");
            } else {
                // Enable Editing
                this.getView().byId("idEdit").setText("Save");
            }

            oModel.setProperty("/isEditable", !bEditable);
        },

        
            _saveUpdatedData: function () {
                var oDetailModel = this.getView().getModel("detailModel");
                var oUpdatedData = oDetailModel.getData();
    
                var oTableModel = this.getOwnerComponent().getModel("localModel");
                var aData = oTableModel.getProperty("/items") || [];
    
                if (oUpdatedData.isNew) {
                    // Add new data to table
                    delete oUpdatedData.isNew; 
                    aData.push(oUpdatedData);
                } else {
                    // Update existing data in table
                    for (var i = 0; i < aData.length; i++) {
                        if (aData[i].Model === oUpdatedData.Model) {
                            aData[i] = oUpdatedData;
                            break;
                        }
                    }
                }
    
                // Update table model
                oTableModel.setProperty("/items", aData);
    
                // Navigate back to table view
                var oRouter = this.getOwnerComponent().getRouter();
                oRouter.navTo("RouteView1");
    
            
            }
        



    });
});
