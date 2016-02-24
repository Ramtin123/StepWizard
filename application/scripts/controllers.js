(function (module) {
    module.controller('maincontroller', ['$scope', 'apiServices', function ($scope, apiServices) {
        var formStates = {
            Search: 'Search',
            CreateTenant: 'CreateTenant',
            Tenantlist: 'Tenantlist',
            TenantDetails: 'TenantDetails',
            MoveinWizard: 'MoveinWizard',
            MoveoutWizard: 'MoveoutWizard'
        };

        $scope.Loading = {
            Search: false,
            Reservations: false,
            CreatingTenant: false
        }

        $scope.Error = {
            Message: '',
            Searching: false,
            CreatingTenant: false,
            TenantNotSelected: false,
            ReservationsLoading: false,
            ReservationNotSelected: false,
            Reset: function () {
                this.Message = '';
                this.Searching = false;
                this.TenantNotSelected = false;
                this.ReservationsLoading = false;
                this.ReservationNotSelected = false;
                this.CreatingTenant = false;
            }
        }

        $scope.tenantSearchGridOptions = {
            enableRowSelection: true,
            multiSelect: false
        };

        function GridRegistrHandler(cb) {
            return function (gridApi) {
                cb(gridApi);
                gridApi.selection.on.rowSelectionChanged($scope, function () {
                    $scope.Error.Reset();
                });
            }
        };

        $scope.tenantSearchGridOptions.onRegisterApi = GridRegistrHandler(function (gridApi) {
            $scope.gridApi = gridApi;
        });

        $scope.reservationsGridOptions = {
            enableRowSelection: true,
            multiSelect: false,
            columnDefs: [
                { name: 'WaitingID', displayName: 'Waiting ID', width: 100 },
                { name: 'TenantID', displayName: 'Tenant ID', width: 100 },
                { name: 'Firstname', width: 150 },
                { name: 'Lastname', width: 150 },
                { name: 'Phone', width: 150 },
                { name: 'Email', width: 250 },
                { name: 'Address1', displayName: 'Address', width: 350 },
                { name: 'CreatedAt', cellFilter: 'date:\'dd-MM-yyyy , hh:mm a\'', width: 200 },
                { name: 'ExpireAt', cellFilter: 'date:\'dd-MM-yyyy , hh:mm a\'', width: 200 }

            ]
        };

        $scope.reservationsGridOptions.onRegisterApi = GridRegistrHandler(function (gridApi) {
            $scope.reservationsGridApi = gridApi;
        });

        $scope.LoadReservations = function () {
            if ($scope.reservationsGridOptions.data && $scope.reservationsGridOptions.data.length > 0) {
                return;
            }
            $scope.Loading.Reservations = true;
            apiServices.GetReservations().then(function (result) {
                $scope.reservationsGridOptions.data = result;
            }, function (error) {
                $scope.Error.Message = 'There is an error in the system.Please try searching later!!!';
                $scope.Error.ReservationsLoading = true;
            }).finally(function () {
                $scope.Loading.Reservations = false;
            });
        };

        $scope.formState = formStates.Search;
        $scope.buttontype = '';

        $scope.formStates = formStates;

        $scope.searchParameters = {};

        $scope.Tenant = {};

        $scope.search = function () {
            $scope.Error.Reset();
            $scope.Loading.Search = true;
            apiServices.SearchTenant($scope.searchParameters).then(function (result) {
                if (result && result.length) {
                    $scope.tenantSearchGridOptions.data = result;
                    $scope.buttontype = 'back';
                    $scope.formState = formStates.Tenantlist;

                }
                else {
                    $scope.Error.Message = 'No result has been found!!!';
                    $scope.Error.Searching = true;
                }

            }, function (err) {
                $scope.Error.Message = 'There is an error in the system.Please try searching later!!!';
                $scope.Error.Searching = true;
            }).finally(function () {
                $scope.Loading.Search = false;
            });
        };

        $scope.CreateTenant = function () {
            $scope.formState = formStates.CreateTenant;
        };

        $scope.closeTenantsList = function () {
            $scope.buttontype = '';
            $scope.formState = formStates.Search;
        };

        $scope.ApplyTenant = function () {
            if ($scope.gridApi.selection.getSelectedRows().length > 0) {
                $scope.Tenant = $scope.gridApi.selection.getSelectedRows()[0];
                $scope.formState = formStates.TenantDetails;
                $scope.closeTenantDetails = function () {
                    $scope.buttontype = 'back';
                    $scope.formState = formStates.Tenantlist;
                };
            }
            else {
                $scope.Error.Message = 'Please select a tenant from the list first then click on apply button again';
                $scope.Error.TenantNotSelected = true;
            }
        };

        $scope.ApplyReservation = function () {
            if ($scope.reservationsGridApi.selection.getSelectedRows().length > 0) {
                $scope.Tenant = $scope.reservationsGridApi.selection.getSelectedRows()[0];
                $scope.formState = formStates.TenantDetails;
                $scope.closeTenantDetails = function () {
                    $scope.buttontype = '';
                    $scope.formState = formStates.Search;
                };
            }
            else {
                $scope.Error.Message = 'Please select a reservation from the list first then click on apply button again';
                $scope.Error.ReservationNotSelected = true;
            }
        };

        $scope.clear = function () {
            $scope.searchParameters = {};
            $scope.Error.Reset();
        };

        $scope.ChangeStatus = function (status) {
            $scope.formState = status;
        };

        $scope.CloseWizard = function () {
            $scope.formState = formStates.TenantDetails;
        };

    }]);

    module.controller('moveinWizardController', ['$scope', 'apiServices', 'wizardService', 'uiGridConstants', function ($scope, apiServices, wizardService, uiGridConstants) {
        var wizard = wizardService.RegisterWizard('MoveInsWizard');

        var moveInDate = new Date().toISOString();

        $scope.Error = {
            NoUnitSelected: false,
            creditCardInfoInvalid: false,
            creditCardRejected: false,
            ServerError: false,
            Message: '',
            Reset: function () {
                $scope.Error.NoUnitSelected = false;
                $scope.Error.creditCardInfoInvalid = false;
                $scope.Error.creditCardRejected = false;
                $scope.Error.ServerError = false;
                $scope.Error.Message = '';
            }
        };
        $scope.vacantUnitsGridOptions = {
            enableRowSelection: true,
            multiSelect: true,
            columnDefs: [
                { name: 'UnitID', displayName: 'Unit ID', width: 100, enableCellEdit: false },
                { name: 'UnitName', displayName: 'Unit Name', width: 150, enableCellEdit: false },
                { name: 'UnitType', width: 150, enableCellEdit: false },
                { name: 'Price', width: 100, enableCellEdit: true, type: 'number' }
            ]
        };

        $scope.selectedUnitsGridOptions = {
            showColumnFooter: true,
            columnDefs: [
                { name: 'WaitingID', displayName: 'Waiting ID', width: 100 },
                { name: 'UnitID', displayName: 'Unit ID', width: 100 },
                { name: 'UnitName', displayName: 'Unit Name', width: 150 },
                { name: 'UnitType', width: 150 },
                { name: 'FirstMonthlyRentFee', width: 200, type: 'number', aggregationType: uiGridConstants.aggregationTypes.sum },
                { name: 'SecurityDeposit', width: 200, type: 'number', aggregationType: uiGridConstants.aggregationTypes.sum },
                { name: 'AdministrativeFee', width: 200, type: 'number', aggregationType: uiGridConstants.aggregationTypes.sum }
            ]
        };

        $scope.creditCard = {};
        var creditCardForm = {};
        $scope.creditcardChanged = function (form) {
            $scope.Error.Reset();
            creditCardForm = form;
        }

        $scope.creditCardValidator = function () {
            if (creditCardForm.$invalid === true) {
                $scope.Error.creditCardInfoInvalid = true;
                return false
            }
            return true;
        }

        $scope.vacantUnitsGridOptions.onRegisterApi = function (gridApi) {
            $scope.vacantUnitsApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function () {
                $scope.Error.Reset();
            });
        }

        $scope.selectedUnitsGridOptions.onRegisterApi = function (gridApi) {
            $scope.selectedUnitsApi = gridApi;
            if (!gridApi.selection) return;
            gridApi.selection.on.rowSelectionChanged($scope, function () {
                $scope.Error.Reset();
            });
        }

        $scope.getVacantUnits = function () {
            if ($scope.vacantUnitsGridOptions.data && $scope.vacantUnitsGridOptions.data.length > 0) return;
            wizard.ShowWaiting();
            apiServices.GetVacantUnits().then(function (data) {
                $scope.vacantUnitsGridOptions.data = data;
                wizard.HideWaiting();
            }, function (error) {
                wizard.WaitingEndsWithError(function () {
                    $scope.Error.ServerError = true;
                });
            });
        }

        $scope.ProccessSelectedUnits = function () {
            wizard.ShowWaiting();
            apiServices.ProccessReservation($scope.tenant.TenantID, moveInDate, $scope.vacantUnitsApi.selection.getSelectedRows()).then(function (result) {
                apiServices.ProccessCosts(moveInDate, $scope.vacantUnitsApi.selection.getSelectedRows()).then(function () {
                    $scope.selectedUnitsGridOptions.data = $scope.vacantUnitsApi.selection.getSelectedRows();
                    wizard.HideWaiting();
                });
            }, function (error) {
                wizard.WaitingEndsWithError(function () {
                    $scope.Error.ServerError = true;
                });
            });
        }

        $scope.ProccessMoveinConfirm = function () {
            $scope.Error.creditCardInfoInvalid = false;
            $scope.Error.creditCardRejected = false;
            $scope.Error.Message = '';
            wizard.ShowWaiting();
            apiServices.ProccessMoveinConfirm($scope.tenant.TenantID, moveInDate, $scope.creditCard, $scope.vacantUnitsApi.selection.getSelectedRows()).then(function (result) {
                wizard.HideWaiting();
                $scope.ShowSummaryList = true;
            }, function (error) {
                wizard.WaitingEndsWithError(function () {
                    $scope.Error.Message = error.data;
                    $scope.Error.creditCardRejected = true;
                });
            });
        }

        $scope.getTotalPrice = function () {
            var sum = 0;
            $scope.vacantUnitsApi.selection.getSelectedRows().forEach(function (item) {
                sum += Number(item.Price);
            });
            return sum.toFixed(2);
        }

        $scope.checkIfAnyUnitSelected = function () {
            if ($scope.vacantUnitsApi.selection.getSelectedRows().length > 0) return true;
            $scope.Error.NoUnitSelected = true;
            return false;
        }

    }]);


    module.controller('moveoutWizardController', ['$scope', 'apiServices', 'wizardService', 'uiGridConstants', function ($scope, apiServices, wizardService, uiGridConstants) {
        var wizard = wizardService.RegisterWizard('MoveoutsWizard');

        $scope.Status = {
            Confirmed: false
        };

        $scope.Error = {
            NoUnitSelected: false,
            ServerError: false,
            NotConfirmed: false,
            NoLedger: false,
            Message: '',
            Reset: function () {
                this.NoUnitSelected = false;
                this.ServerError = false;
                this.NotConfirmed = false;
                this.NoLedger = false;
                this.Message = '';
            }
        };

        $scope.ledgersGridOptions = {
            enableRowSelection: true,
            multiSelect: true,
            columnDefs: [
                { name: 'UnitID', displayName: 'Unit ID', width: 100 },
                { name: 'UnitName', displayName: 'Unit Name', width: 150 },
                { name: 'MovedInDate', width: 150 },
                { name: 'Rent', width: 150 },
                { name: 'TotalDue', displayName: 'Total Due', width: 150 }
            ]
        };

        $scope.ledgersGridOptions.onRegisterApi = function (gridApi) {
            $scope.ledgersApi = gridApi;
            if (gridApi.selection) {
                gridApi.selection.on.rowSelectionChanged($scope, function () {
                    $scope.Error.NoUnitSelected = false;
                });
            }
        }


        $scope.$watch('Status.Confirmed', function (newval, oldval) {
            if (newval === true && oldval === false) {
                $scope.Error.NotConfirmed = false;
            }
        });

        $scope.getLedgers = function () {
            wizard.ShowWaiting();
            apiServices.GetLedgers($scope.tenant.TenantID).then(function (data) {
                $scope.ledgersGridOptions.data = data;
                wizard.HideWaiting();
            }, function (error) {
                wizard.WaitingEndsWithError(function () {
                    $scope.Error.Message = error.data;
                    if (error.status === 500) {
                        $scope.Error.ServerError = true;
                    }
                    else {
                        $scope.Error.NoLedger = true;
                    }
                });
            });
        }

        $scope.ConfirmMoveOut = function () {
            $scope.Error.Reset();
            wizard.ShowWaiting();
            apiServices.ProccessMoveoutConfirm($scope.tenant.TenantID, $scope.ledgersApi.selection.getSelectedRows()).then(function (result) {
                wizard.HideWaiting();
                $scope.ledgersGridOptions.data = $scope.ledgersApi.selection.getSelectedRows();
                $scope.ShowSummaryList = true;
            }, function (error) {
                wizard.WaitingEndsWithError(function () {
                    $scope.Error.ServerError = true;
                    $scope.Error.Message = error.data;
                });
            });
        }

        $scope.checkValidation = function () {
            var haserror = false;
            if ($scope.ledgersApi.selection.getSelectedRows().length <= 0) {
                haserror = true;
                $scope.Error.NoUnitSelected = true;
            }
            if ($scope.Status.Confirmed !== true) {
                haserror = true;
                $scope.Error.NotConfirmed = true;
            }
            return !haserror;
        }

    }]);



})(angular.module('multimoveinapp'));