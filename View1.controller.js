sap.ui.define([
    "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
   
    
    
], (Controller,MessageToast) => {
    "use strict";

    return Controller.extend("com.kt.sap.project2.controller.View1", {

        onInit: function () {
            this.localModel = new sap.ui.model.json.JSONModel({
                items: [] // Store table data
            });
            this.getOwnerComponent().setModel(this.localModel, "localModel");

            // this._fetchUpdatedData(); // Load existing data on startup
        },

        onUpload: function (e) {
            this._import(e.getParameter("files") && e.getParameter("files")[0]);
        },

        _import: function (file) {
            var that = this;
            var excelData = [];

            if (file && window.FileReader) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    var workbook = XLSX.read(data, { type: 'binary' });

                    workbook.SheetNames.forEach(function (sheetName) {
                        excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                    });

                    console.log("Excel Data:", excelData); // Debugging

                    // Send data to backend and update table
                    that.onDialogUpload(excelData);
                };

                reader.onerror = function (ex) {
                    console.log("File Read Error:", ex);
                };

                reader.readAsBinaryString(file);
            }
        },
        // _sendDataToBackend: function (excelData) {
           
        // },

        _fetchUpdatedData: function () {
            var that = this;
            var oModel = that.getOwnerComponent().getModel("localModel"); // Use the existing model
               //reset the model
               oModel.setData({ items: [] });
               oModel.refresh(true);

            $.ajax({
                url: "https://rest.shahportal.in/QuotationScheme",
                type: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "name": "Admin",
                    "password": "Admin"
                },
                success: function (data) {
                    console.log("Fetched Data:", data);
        
                    // If the response is an array, set it directly
                    if (Array.isArray(data)) {
                        oModel.setData({ items: data });
                    } 
                    // If the response is an object with a key containing the array, adjust accordingly
                    else if (data.results) {
                        oModel.setData({ items: data.results });
                    } 
                    else {
                        console.error("Unexpected response format:", data);
                        sap.m.MessageToast.show("Unexpected response format!");
                        return;
                    }
        
                    oModel.refresh(true);
                    // sap.m.MessageToast.show("Data refreshed successfully!");
                },
                error: function (xhr, status, error) {
                    console.error("Error fetching data:", xhr.responseText || error);
                    sap.m.MessageToast.show("Failed to fetch data.");
                }
            });
        },


        onItemPress: function (oEvent) {
            var oSelectedContext = oEvent.getSource().getBindingContext("localModel");
            if (!oSelectedContext) {
                console.error("No context found for selected item.");
                return;
            }

            var oData = oSelectedContext.getObject();
            if (!oData) {
                console.error("No data found for selected item.");
                return;
            }
            oData.isEditable = false;

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("Details", { data: encodeURIComponent(JSON.stringify(oData)) });
        },

        onCreateform: function () {
            var oRouter = this.getOwnerComponent().getRouter();

            // Create an empty data object for new entry
            var oEmptyData = {
                isNew: true, // Indicate new entry
                isEditable: true, // Fields should be editable
                Company: "",
                Variant: "",
                Model: "",
                Transmission: "",
                Color: "",
                Fuel: "",
                BoardPlate: "",
                "Ex-showroom": "",
                "TCS  1%": "",
                "ROAD TAX": "",
                "Regular Insurance": "",
                "Add On Insurance": "",
                "Temp Charges": "",
                "RegHypCHARGE": "",
                "Shield of trust 4YR45K": "",
                "EXTD Warranty FOR 4YR80K": "",
                "STD Fittings": "",
                "FAST TAG": "",
                "VAS": "",
                "Discountoffers": "",
                "Model Mfg Code": ""
            };

            // Pass an empty JSON object as the 'data' parameter
            oRouter.navTo("Details", {
                data: encodeURIComponent(JSON.stringify(oEmptyData))
            });
        },
        onUploadpress:function(){
            var that = this;
    
   
    if (!this.oDialog) {
        this.oDialog = sap.ui.xmlfragment("com.kt.sap.project2.fragment.Create", this);
        this.getView().addDependent(this.oDialog);
    }

    this.oDialog.open();
        },
        onDialogOK: function () {
            var oComboBox = sap.ui.getCore().byId("idComboBox");
            var selectedBrand = oComboBox.getSelectedKey();
        
            if (!selectedBrand) {
                sap.m.MessageToast.show("Please select a brand!");
                return;
            }
        
            sap.m.MessageToast.show("Selected Brand: " + selectedBrand);
        
            // Close the dialog
            this.oDialog.close();
        },
        onDialogCancel:function(){
            this.oDialog.close();
        },

        onDialogUpload: function (excelData) {
            var oComboBox = sap.ui.getCore().byId("idComboBox");
            var selectedBrand = oComboBox.getSelectedKey();
            var oFileUploader = sap.ui.getCore().byId("idFileUploader");
            var that = this;
        
            if (!selectedBrand) {
                sap.m.MessageToast.show("Please select a brand!");
                return;
            }
        
            if (!oFileUploader.getValue()) {
                sap.m.MessageToast.show("Please select a file to upload!");
                return;
            }
        
            // Show warning dialog
            sap.m.MessageBox.warning("All existing data will be permanently deleted. Are you sure?", {
                title: "Warning",
                actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                emphasizedAction: sap.m.MessageBox.Action.OK,
                onClose: function (oAction) {
                    if (oAction === sap.m.MessageBox.Action.OK) {
                        // Delete existing data first
                        $.ajax({
                            url: "https://rest.shahportal.in/QuotationScheme/'*'",
                            type: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                                "name": "Admin",
                                "password": "Admin"
                            },
                            success: function (deleteResponse) {
                                console.log("Data deleted successfully:", deleteResponse);
        
                                // Format the new data and save it
                                var formattedData = excelData.map(row => ({
                                    "Company ": row["Company "] || "",
                                    "Variant": row["Variant"] || "",
                                    "Model": row["Model"] || "",
                                    "Transmission": row["Transmission"] || "",
                                    "Color": row["Color"] || "",
                                    "Fuel": row["Fuel"] || "",
                                    "BoardPlate": row["BoardPlate"] || "",
                                    "ExShowroom": row["Ex-showroom"] || "",
                                    "TCS1Perc": row["TCS  1%"] || "",
                                    "ROADTAX": row["ROAD TAX"] || "",
                                    "RegularInsurance": row["Regular Insurance"] || "",
                                    "AddOnInsurance": row["Add On Insurance"] || "",
                                    "TempCharges": row["Temp Charges"] || "",
                                    "RegHypCharge": row["RegHypCHARGE"] || "",
                                    "ShieldOfTrust4YR45K": row["Shield of trust 4YR45K"] || "",
                                    "EXTDWarrantyFOR4YR80K": row["EXTD Warranty FOR 4YR80K"] || "",
                                    "STDFittings": row["STD Fittings"] || "",
                                    "FastTag": row["FAST TAG"] || "",
                                    "VAS": row["VAS"] || "",
                                    "DiscountOffers": row["Discountoffers"] || "",
                                    "ModelMfgCode": row["Model Mfg Code"] || ""
                                   
                                }));
        
                                console.log("Formatted Data to Send:", formattedData);
        
                                // Send the new data to the backend
                                $.ajax({
                                    url: "https://rest.shahportal.in/QuotationScheme",
                                    type: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        "name": "Admin",
                                        "password": "Admin"
                                    },
                                    data: JSON.stringify(formattedData),
                                    success: function (postResponse) {
                                        console.log("Data saved successfully:", postResponse);
                                        sap.m.MessageToast.show("Data saved successfully!");
        
                                        // Refresh the table with updated data
                                        that._fetchUpdatedData();
        
                                       
                                        oComboBox.setSelectedKey(""); 
                                        oFileUploader.clear();
                                    },
                                    error: function (error) {
                                        console.error("Error saving data:", error);
                                        sap.m.MessageToast.show("Error saving data!");
                                    }
                                });
                            },
                            error: function (deleteError) {
                                console.log("Error deleting data:", deleteError);
                                sap.m.MessageToast.show("Failed to delete existing data.");
                            }
                        });
        
                        // Close the dialog after confirming
                        that.oDialog.close();
                    } else if (oAction === sap.m.MessageBox.Action.CANCEL) {
                        console.log("Delete operation canceled");
        
                        oComboBox.setSelectedKey(""); 
                        oFileUploader.clear();
        
                        sap.m.MessageToast.show("Delete operation was canceled.");
                    }
                }

            });
        
        

 


    // Close the dialog after uploading
    this.oDialog.close();
        },



        
        //delete the row
        onDeletepress:function(){
            var oTable = this.getView().byId("idQuotationtable");
    var oModel = this.getOwnerComponent().getModel("localModel");
    var aSelectedItems = oTable.getSelectedItems(); // Get selected rows

    if (aSelectedItems.length === 0) {
        sap.m.MessageToast.show("Please select at least one row to delete.");
        return;
    }

    sap.m.MessageBox.confirm("Are you sure you want to delete the selected rows?", {
        title: "Confirm Deletion",
        onClose: function (oAction) {
            if (oAction === sap.m.MessageBox.Action.OK) {
                var aData = oModel.getProperty("/items"); // Get current table data

                // Remove selected rows
                aSelectedItems.forEach(function (oItem) {
                    var oItemData = oItem.getBindingContext("localModel").getObject();
                    var iIndex = aData.indexOf(oItemData);
                    if (iIndex !== -1) {
                        aData.splice(iIndex, 1);
                    }
                });

                // Update model and refresh table
                oModel.setProperty("/items", aData);
                oTable.removeSelections(true);
                oModel.refresh(true);

                sap.m.MessageToast.show("Row deleted successfully!");
            }
        }
    });
}




    });
    
});
