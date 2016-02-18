(function (module) {
    module.controller('maincontroller', ['$scope','apiServices', function ($scope,apiServices) {
        var formStates={
                      Search:'Search',
                      CreateTenant:'CreateTenant',
                      Tenantlist:'Tenantlist' ,
                      TenantDetails:'TenantDetails',
                      MoveinWizard:'MoveinWizard'
                    };
                    
                    $scope.Loading={
                        Search:false,
                        Reservations:false,
                        CreatingTenant:false
                    }
                    
                    $scope.Error={
                        Message:'',
                        Searching:false,
                        CreatingTenant:false,
                        TenantNotSelected: false,
                        ReservationsLoading:false,
                        ReservationNotSelected:false,
                        Reset:function(){
                            this.Message='';
                            this.Searching=false;
                            this.TenantNotSelected = false;
                            this.ReservationsLoading = false;
                            this.ReservationNotSelected=false;
                            this.CreatingTenant=false;
                        }
                    }
                    
                    $scope.tenantSearchGridOptions = {
                        enableRowSelection: true,
                        multiSelect :false
                    };
                    
                    function GridRegistrHandler(cb) {
                        return function(gridApi){
                            cb(gridApi);
                            gridApi.selection.on.rowSelectionChanged($scope,function(){
                                $scope.Error.Reset();
                        });
                        }
                    };
                    
                    $scope.tenantSearchGridOptions.onRegisterApi=GridRegistrHandler(function(gridApi){
                        $scope.gridApi = gridApi;
                    });

                    $scope.reservationsGridOptions = {
                        enableRowSelection: true,
                        multiSelect: false,
                        columnDefs: [
                            { name: 'WaitingID',displayName: 'Waiting ID',width:100 },
                            { name: 'TenantID', displayName: 'Tenant ID' ,width:100},
                            { name: 'Firstname',width:150 },
                            { name: 'Lastname' ,width:150},
                            { name: 'Phone',width:150 },
                            { name: 'Email',width:250 },
                            { name: 'Address1',displayName: 'Address',width:350},
                            { name: 'CreatedAt' ,cellFilter: 'date:\'dd-MM-yyyy , hh:mm a\'' ,width:200},
                            { name: 'ExpireAt', cellFilter: 'date:\'dd-MM-yyyy , hh:mm a\'',width:200 }

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
                    
                    $scope.formState=formStates.Search;
                    $scope.buttontype='';
                    
                    $scope.formStates=formStates;
                    
                    $scope.searchParameters = {};
                    
                    $scope.Tenant={};

                    $scope.search = function () {
                        $scope.Error.Reset();
                        $scope.Loading.Search=true;
                        apiServices.SearchTenant($scope.searchParameters).then(function(result){
                            if(result && result.length){
                                $scope.tenantSearchGridOptions.data = result;
                                $scope.buttontype='back';
                                $scope.formState = formStates.Tenantlist;
                                
                            }
                            else{
                                 $scope.Error.Message='No result has been found!!!';
                                 $scope.Error.Searching=true;
                            }
                           
                        },function(err){
                            $scope.Error.Message='There is an error in the system.Please try searching later!!!';
                            $scope.Error.Searching=true;
                        }).finally(function(){
                            $scope.Loading.Search=false;
                        });
                    };
                    
                    $scope.CreateTenant=function(){
                         $scope.formState = formStates.CreateTenant;
                    };
                    
                    $scope.closeTenantsList=function(){
                        $scope.buttontype='';
                        $scope.formState=formStates.Search;
                    };
                    
                    $scope.ApplyTenant=function(){
                        if($scope.gridApi.selection.getSelectedRows().length>0){
                           $scope.Tenant=$scope.gridApi.selection.getSelectedRows()[0];
                           $scope.formState = formStates.TenantDetails;
                           $scope.closeTenantDetails = function () {
                               $scope.buttontype = 'back';
                               $scope.formState = formStates.Tenantlist;
                           };
                        }
                        else{
                           $scope.Error.Message='Please select a tenant from the list first then click on apply button again';
                           $scope.Error.TenantNotSelected=true;
                        }
                    };
                    
                    $scope.ApplyReservation=function(){
                        if($scope.reservationsGridApi.selection.getSelectedRows().length>0){
                           $scope.Tenant=$scope.reservationsGridApi.selection.getSelectedRows()[0];
                           $scope.formState = formStates.TenantDetails;
                           $scope.closeTenantDetails = function () {
                               $scope.buttontype = '';
                               $scope.formState = formStates.Search;
                           };
                        }
                        else{
                           $scope.Error.Message='Please select a reservation from the list first then click on apply button again';
                           $scope.Error.ReservationNotSelected=true;
                        }
                    };
                    
                    $scope.clear = function () {
                        $scope.searchParameters = {};
                        $scope.Error.Reset();
                    };
                    
                    $scope.ShowMoveInWizard=function(){
                        $scope.formState=formStates.MoveinWizard;
                    };
                    
                    $scope.CloseMoveInWizard=function(){
                        $scope.formState=formStates.TenantDetails;
                    };

    }]);
    
     module.controller('moveinWizardController', ['$scope','apiServices','wizardService', function ($scope,apiServices,wizardService) {
            var wizard = wizardService.RegisterWizard('MoveInsWizard');
            $scope.Error = {
                NoUnitSelected: false,
                ServerError:false
            };
            $scope.vacantUnitsGridOptions = {
                enableRowSelection: true,
                multiSelect: true,
                columnDefs: [
                        { name: 'UnitID', displayName: 'Unit ID', width: 100, enableCellEdit: false },
                        { name: 'UnitName', displayName: 'Unit Name', width: 150, enableCellEdit: false },
                        { name: 'UnitType', width: 150, enableCellEdit: false },
                        { name: 'Price', width: 100, enableCellEdit: true, type: 'number' },
                        { name: 'Rented', width: 100, enableCellEdit: false }
                    ]
            };
            
            $scope.vacantUnitsGridOptions.onRegisterApi = function (gridApi) {
                $scope.vacantUnitsApi = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope, function () {
                    $scope.Error.NoUnitSelected=false;
                });
            };
            
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
                var moveInDate = new Date().toISOString();
                apiServices.ProccessReservation($scope.tenant.TenantID, moveInDate, $scope.vacantUnitsApi.selection.getSelectedRows()).then(function (result) {
                    wizard.HideWaiting();
                }, function (error) {
                    wizard.WaitingEndsWithError(function () {
                        $scope.Error.ServerError = true;
                    });
                });
            }

            $scope.getTotalPrice = function () {
                var sum = 0;
                $scope.vacantUnitsApi.selection.getSelectedRows().forEach(function (item) {
                    sum += Number(item.Price);
                });
                return sum;
            }
            
            $scope.checkIfAnyUnitSelected = function () {
                if ($scope.vacantUnitsApi.selection.getSelectedRows().length > 0) return true;
                $scope.Error.NoUnitSelected = true;
                return false;
            }
         
     }]);
})(angular.module('multimoveinapp'));