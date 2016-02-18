(function (module) {
    var host='http://localhost:3000'; //TODO : Get it from environment variables
    module.factory('apiServices', ['$http', '$q', function ($http, $q) {
         function searchTenant(searchParameters){
                var deferred = $q.defer();
                $http.post(host+"/api/Tenant/Search",JSON.stringify(searchParameters))
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
                 var promise =fn(unit);
                 promises.push(promise);
                 promise.then(function (result) {
                     unit = _.merge(unit, result.data);
                 });
             });
             $q.all(promises).then(function () {
                 deferred.resolve();
             }, function () {
                 deferred.reject();
             });
             return deferred.promise;
         }

         function proccessReservation(TenantID, MoveInDate, Units) {
             return _processUnits(Units, function (unit) {
                 return $http.post(host + "/api/Reservation", JSON.stringify({ TenantID: TenantID, UnitID: unit.UnitID, MoveInDate: MoveInDate, Rate: unit.Price }));
             });
         }

         function proccessCosts(MoveInDate, Units) {
             return _processUnits(Units, function (unit) {
                 return $http.get('/api/MoveIn/costs/' + unit.UnitID + '/' + unit.WaitingID + '/' + moveInDate);
             });
         }

         //function proccessReservation(TenantID, MoveInDate, Units) {
         //    var deferred = $q.defer();
         //    var promises = [];
         //    var hasError = false;
         //    Units.forEach(function (unit) {
         //        var promise = $http.post(host + "/api/Reservation", JSON.stringify({ TenantID: TenantID, UnitID: unit.UnitID, MoveInDate: MoveInDate, Rate: unit.Price }));
         //        promises.push(promise);
         //        promise.then(function (result) {
         //            unit=_.merge(unit, result.data);
         //        });
         //    });
         //    $q.all(promises).then(function () {
         //        deferred.resolve();
         //    }, function () {
         //        deferred.reject();
         //    });
         //    return deferred.promise;
         //}

         function getCosts() {
             var deferred = $q.defer();
             $http.get('/api/MoveIn/costs/' + item.UnitID + '/' + item.WaitingID + '/' + moveInDate).then(function (r) {
                 deferred.resolve(_.merge(item, r.data));
             }, function () {
                 deferred.reject();
             });
             return deferred.promise;
         }
         
         function getLedgers(tenantId){
                var deferred = $q.defer();
                $http.get(host+"/api/Tenant/"+tenantId+"/ledgers")
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
                $http.get(host+"/api/Unit/Vacant")
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
                $http.get(host+"/api/Reservation")
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
             ProccessReservation: proccessReservation
         }
    }]);   
})(angular.module('multimoveinapp'));