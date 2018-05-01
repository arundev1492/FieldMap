<?php
	$includeCount=null;
	function includeJS($dependencyArray,$assetsFolder='vendorbeta'){
		global $includeCount;
		$CI=& get_instance();
		$ReleaseVersion=$CI->config->item('ReleaseVersion');
		// if(FORCE_MINIFIER_REFRESH){
			foreach($dependencyArray as $jsFile){
				echo "<script type='text/javascript' src='".site_url("$ReleaseVersion/$assetsFolder/js/$jsFile")."'></script>";
			}
		// } else {
		// 	$CI->minify->assets_dir=$CI->minify->js_dir='$assetsFolder/js';
		// 	$CI->minify->js($dependencyArray);
		// 	echo $CI->minify->deploy_js(false,'minvendorbeta'.$includeCount.'.js?v='.$ReleaseVersion);
		// 	$includeCount++;
		// }
	}

?>