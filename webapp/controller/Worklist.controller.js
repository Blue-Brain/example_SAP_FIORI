/*Написал функцию вывода количества нулей в результате рассчета факториала введенного пользователем числа и функцию сравнения двух версий*/
sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
	"use strict";
	return BaseController.extend("mycompany.myapp.MyWorklistApp.controller.Worklist", {
		formatter: formatter,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			var oViewModel, iOriginalBusyDelay, oTable = this.byId("table");
			// Put down worklist table's original value for busy indicator delay,
			// so it can be restored later on. Busy handling on the table is
			// taken care of by the table itself.
			iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
			// keeps the search state
			this._aTableSearchState = [];
			// Model used to manipulate control states
			oViewModel = new JSONModel({
				worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
				shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
				shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
				shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
				tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
				tableBusyDelay: 0
			});
			this.setModel(oViewModel, "worklistView");
			// Make sure, busy indication is showing immediately so there is no
			// break after the busy indication for loading the view's meta data is
			// ended (see promise 'oWhenMetadataIsLoaded' in AppController)
			oTable.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for worklist's table
				oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
			});
		},
		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */
		/**
		 * Triggered by the table's 'updateFinished' event: after new table
		 * data is available, this handler method updates the table counter.
		 * This should only happen if the update was successful, which is
		 * why this handler is attached to 'updateFinished' and not to the
		 * table's list binding's 'dataReceived' method.
		 * @param {sap.ui.base.Event} oEvent the update finished event
		 * @public
		 */
		onUpdateFinished: function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle, oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
		},
		/**
		 * Event handler when a table item gets pressed
		 * @param {sap.ui.base.Event} oEvent the table selectionChange event
		 * @public
		 */
		onPress: function (oEvent) {
			// The source is the list item that got pressed
			this._showObject(oEvent.getSource());
		},
		/**
		 * Event handler for navigating back.
		 * We navigate back in the browser history
		 * @public
		 */
		onNavBack: function () {
			// eslint-disable-next-line sap-no-history-manipulation
			history.go(-1);
		},
		onSearch: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				// Search field's 'refresh' button has been pressed.
				// This is visible if you select any master list item.
				// In this case no new search is triggered, we only
				// refresh the list binding.
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter("query");
				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("CompanyName", FilterOperator.Contains, sQuery)];
				}
				this._applySearch(aTableSearchState);
			}
		},
		/**
		 * Event handler for refresh event. Keeps filter, sort
		 * and group settings and refreshes the list binding.
		 * @public
		 */
		onRefresh: function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},
		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */
		/**
		 * Shows the selected item on the object page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showObject: function (oItem) {
			this.getRouter().navTo("object", {
				objectId: oItem.getBindingContext().getProperty("CustomerID")
			});
		},
		/**
		 * Internal helper method to apply both filter and search state together on the list binding
		 * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
		 * @private
		 */
		_applySearch: function (aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			// changes the noDataText of the list in case there are no filter results
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},
		onNewWindows: function (oEvent) {
			window.open(this.getResourceBundle().getText("URLGoogle"), "Google window", "width=600,height=400"); // The source is the list item that got pressed
		},
		/**
		 *@memberOf mycompany.myapp.MyWorklistApp.controller.Worklist
		 */
		factorialN: function (oEvent) {
			var functionN = function factorial(a) {
				return (a != 1) ? a * factorial(a - 1) : 1;
			};
			var n = this.getView().byId("inputFactorial").getValue();
			var returnFunction = functionN(n);
			var objectRegEx = String(returnFunction).match(/0*$/);
			var stringIncludeNull = String(objectRegEx[0]).length;
			sap.m.MessageToast.show(
				"количество нулей в конце числа от " + n + "!" + " = " + stringIncludeNull); 
		},
		/**
		 *@memberOf mycompany.myapp.MyWorklistApp.controller.Worklist
		 */
		onCompareVersion: function (oEvent) {
			var version1 = this.getView().byId("inputVersionUp").getValue();
			var version2 = this.getView().byId("inputVersionDown").getValue();
			var arrVersion1 = version1.split(".");
			var arrVersion2 = version2.split(".");
			var regExForVersion1 = /^\d+\.\d+\.\d+\.\d+$/.test(version1);
			var regExForVersion2 = /^\d+\.\d+\.\d+\.\d+$/.test(version2);
			function pattern () {
				if (arrVersion1.length !== 4 || arrVersion2.length !== 4) return true;
				else if (regExForVersion1 === false || regExForVersion2 === false) return true;
				else return false;
			}
			var compare = pattern();
			if (compare === true ) {
				sap.m.MessageToast.show("Введите версию в формате х.х.х.х");	
			}
			else {
				if (
					arrVersion1[0]===arrVersion2[0] && 
					arrVersion1[1]===arrVersion2[1] && 
					arrVersion1[2]===arrVersion2[2] && 
					arrVersion1[3]===arrVersion2[3]
				) {
					sap.m.MessageToast.show("Версия " + version1 + " и " + version2 + " равны"); 
				}
				else {
					var i=0;
					while (i<4){
						var number1 = parseInt(arrVersion1[i],10);
						var number2 = parseInt(arrVersion2[i],10);
						if (number1 < number2 ) {
							sap.m.MessageToast.show("Более свежая версия: " + version2); 
							break;
						}
						else if (number1 > number2) {
							sap.m.MessageToast.show("Более свежая версия: " + version1); 
							break;
						}
						else i++;
					}
				}
			}
		}
	});
});
