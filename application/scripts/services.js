(function (module) {
    module.factory('apiServices', ['$http', '$q', function ($http, $q) {
         function searchTenant(searchParameters){
                var deferred = $q.defer();
                $http.post("/api/Tenant/Search",JSON.stringify(searchParameters))
                .then(function (result) {
                    deferred.resolve(result.data);
                },
                function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
         }

         function _processUnits(Units, fn) {
             var deferred = $q.defer();
             var promises = [];
             var hasError = false;
             Units.forEach(function (unit) {
                 unit.status = 2;
                 var promise =fn(unit);
                 promises.push(promise);
                 promise.then(function (result) {
                     unit.status = 1;
                     unit = _.merge(unit, result.data);
                 }, function (error) {
                     unit.status = error.data;
                 });
             });
             $q.all(promises).then(function () {
                 deferred.resolve();
             }, function (error) {
                 deferred.reject(error);
             });
             return deferred.promise;
         }

         function proccessReservation(TenantID, MoveInDate, Units) {
             return _processUnits(Units, function (unit) {
                 return $http.post("/api/Reservation", JSON.stringify({ TenantID: TenantID, UnitID: unit.UnitID, MoveInDate: MoveInDate, Rate: unit.Price }));
             });
         }

         function proccessCosts(MoveInDate, Units) {
             return _processUnits(Units, function (unit) {
                 return $http.get('/api/MoveIn/costs/' + unit.UnitID + '/' + unit.WaitingID + '/' + MoveInDate);
             });
         }

         function proccessMoveinConfirm(TenantID,MoveInDate, creditcard, Units) {
             return _processUnits(Units, function (unit) {
                 creditcard.amount = Number(unit.FirstMonthlyRentFee) + Number(unit.SecurityDeposit) + Number(unit.AdministrativeFee);
                 creditcard.cardexpiry = new Date('20'+creditcard.cardexpiryyy, creditcard.cardexpirymm,0).toISOString();
                 return $http.post( "/api/MoveIn/confirm", JSON.stringify(_.merge({ TenantID: TenantID, UnitID: unit.UnitID, moveInDate: MoveInDate, WaitingID: unit.WaitingID }, creditcard)));
             });
         }

         function proccessMoveoutConfirm(TenantID, Units) {
             return _processUnits(Units, function (unit) {
                 return $http.post( "/api/MoveOut/confirm", JSON.stringify({ TenantID: TenantID, UnitID: unit.UnitID}));
             });
         }
         
         function getLedgers(tenantId){
                var deferred = $q.defer();
                $http.get("/api/Tenant/"+tenantId+"/ledgers")
                .then(function (result) {
                    deferred.resolve(result.data);
                },
                function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
         }
         
         function getVacantUnits(){
                var deferred = $q.defer();
                $http.get("/api/Unit/Vacant")
                .then(function (result) {
                    deferred.resolve(result.data);
                },
                function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
         }
         
         function getReservations(){
                var deferred = $q.defer();
                $http.get("/api/Reservation")
                .then(function (result) {
                    deferred.resolve(result.data);
                },
                function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
         }
         
         return {
             SearchTenant:searchTenant,
             GetLedgers:getLedgers,
             GetReservations:getReservations,
             GetVacantUnits: getVacantUnits,
             ProccessReservation: proccessReservation,
             ProccessCosts: proccessCosts,
             ProccessMoveinConfirm: proccessMoveinConfirm,
             ProccessMoveoutConfirm: proccessMoveoutConfirm
         }
    }]);   
})(angular.module('multimoveinapp'));