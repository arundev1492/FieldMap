/*	Service(s)
===================================*/

vendor.factory('appInfo', ['$q','$rootScope','$http','$location','$timeout',function ($q,$rootScope,$http,$location,$timeout) {
	return {
		siteUrl:      $location.$$protocol+'://'+$location.$$host+'/', 
		appDocumentUploadUrl: $location.$$protocol+'://'+$location.$$host+'/company/DocumentsUpload_Submit',
		appDocumentDownloadUrl: $location.$$protocol+'://'+$location.$$host+'/company/DownloadMediaRequest',
		appDocumentsZipDownloadUrl: $location.$$protocol+'://'+$location.$$host+'/deals/DownloadDocumentsZip',
		CompanyDocumentsZipDownloadUrl: $location.$$protocol+'://'+$location.$$host+'/company/DownloadDocumentsZip',
		applicationDocumentsZipDownloadUrl: $location.$$protocol+'://'+$location.$$host+'/applications/DownloadDocumentsZip',
		serviceUrl: $location.$$protocol+'://'+$location.$$host+'/api/',
		socketConn:false,
		retryConnectionAttempt:0,
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
				if(_.isUndefined(data[url])){
					deferred.reject({'ResponseCode':500,'Message':'Error reading response.'});
				}
				else if(data[url].ResponseCode==535){
					// var EmuData=Storage.getEmulationData();
					// if(EmuData && _.isObject(EmuData.emulate)){
					// 	location.href='/backToAdmin';
					// } else
					// 	$location.path('/SignOut');
					$rootScope.showFlashMessage('error',data[url].Message);
					deferred.reject(data[url]);
				}
				else if(data[url].ResponseCode==302){
					$rootScope.showFlashMessage('error',data[url].Message);
					$location.path('/SignOut');
					// setTimeout(function(){
					// 	Storage.clear();
					// 	location.reload();
					// },100);
				} else 
					deferred.resolve(data[url]);
			}).error(function(data){
				// $rootScope.showFlashMessage('error','Internal Error Retry Later');
				console.log(url+' service failed');
				deferred.reject({'ResponseCode':500,'Message':'Internal Error Retry Later'});
			});
			return deferred.promise;
		}
	};
}]);