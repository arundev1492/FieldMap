var routerApp = angular.module('routerApp', ['ui.router','ngFileUpload']);

routerApp.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/');
    
    $stateProvider
        
        // HOME STATES AND NESTED VIEWS ========================================
        .state('home', {
            url: '/',
            templateUrl: 'vendorbeta/partials/import.html',
            controller: 'ImportCSVController'
        })
        
        // nested FieldMap with custom controller
        .state('FieldMap', {
            url: '/FieldMap',
            templateUrl: 'vendorbeta/partials/field_map_form.html'
        })

        
        .state('Detail', {
            url: '/Detail',
            templateUrl: 'vendorbeta/partials/table-data.html',
            controller: 'ProductDetailController'
        })
        
});
routerApp.run(['$rootScope', 'appInfo', '$location', '$state', '$q', function($rootScope, appInfo, $location, $state, $q){
    $rootScope.validateUpload=function(f){
        var ext = f.name.split(".");
        if(ext[1] != 'csv'){
          alert("Please select only CSV file");
          return false;
        }
        return true;
    }

}]);
routerApp.factory('appInfo', ['$q','$rootScope','$http','$location','Upload','$timeout',function ($q,$rootScope,$http,$location,Upload,$timeout) {
    return {
        serviceUrl: $location.$$protocol+'://'+$location.$$host+'/Demo/index.php/api/example/',
        getServerData : function(reqData){
            var deferred = $q.defer();
            var url=Object.keys(reqData)[0];
            if($rootScope.EmulatedMode){
                reqData[url].EmulationData=$rootScope.EmulatedMode;
            }
            $http.post(this.serviceUrl+url,reqData,{
                headers: {
                    'X_HTTP_METHOD_OVERRIDE':'POST',
                    'LOADED-COMPANY-DATE':($rootScope.CompanyPreferences?$rootScope.CompanyPreferences.ModifiedDate:false)
                }
            }).success(function (data) {
                deferred.resolve(data[url]);
            }).error(function(data){
                console.log(url+' service failed');
                deferred.reject({'ResponseCode':500,'Message':'Internal Error Retry Later'});
            });
            return deferred.promise;
        },
        uploadFile : function(reqData){
            var deferred = $q.defer();
            var wrapper=Object.keys(reqData)[0];
            var url=this.serviceUrl+wrapper;
            
            var initUpload=function(){
                $rootScope.uploading=true;
                var uploadObject={
                    "url" : url,
                    headers: {'X_HTTP_METHOD_OVERRIDE':'POST'},
                    file: reqData.UploadFile.File,
                    sendFieldsAs: "json"
                };
                delete reqData.UploadFile.File;
                uploadObject['fields']=reqData;
                Upload.upload(uploadObject).success(function (data) {
                    deferred.resolve(data[wrapper]);
                    delete $rootScope.uploading;
                }).error(function(data){
                    console.log(wrapper+' service failed');
                    deferred.reject({'ResponseCode':500,'Message':'Internal Error Retry Later'});
                    delete $rootScope.uploading;
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    deferred.notify(progressPercentage+'%');
                });
            };
            initUpload();
            return deferred.promise;
        }    
    };
}]);
routerApp.controller('ImportCSVController', function($scope,$rootScope,appInfo,$state) {
   
    $scope.uploadLeads=function(e){
        if(e.target.files && e.target.files.length){
            var reqData={
                "UploadFile": {
                    "File": e.target.files[0],
                }
            };
            appInfo.uploadFile(reqData).then(function(response){
                if(response.ResponseCode==200){
                    $rootScope.UploadedData=response.Data;
                    $state.go('FieldMap');
                }
            },function(){
                $scope.uploadProgress='100%';
            },function(progress){
                $scope.uploadProgress=progress;
            });
        }
    }
});

routerApp.controller('FieldMapController', function($scope,$rootScope,appInfo,$state) {
    
    $scope.save_data =function(fileItem){
        var reqData = {
          "SaveData":{
            MapData:this.mapdata
          }
        }
        console.log(this.mapdata);
        appInfo.getServerData(reqData).then(function (response) {
            $state.go('Detail');
        });
    }
});
routerApp.controller('ProductDetailController', function($scope,$rootScope,appInfo,$state) {
    
    $scope.get_products =function(fileItem){
        var reqData = {
          "GetProductlist":{}
        }
        console.log(this.mapdata);
        appInfo.getServerData(reqData).then(function (response) {
            $scope.Data = response.Data;
        });
    }
    $scope.get_products();
});