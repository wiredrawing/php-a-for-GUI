<?php 
$f = function () {
	return get_class($this);
};


try {
	
	echo $f;

} catch(Throwable $e) {
	echo $e->getMessage();
}



 ?>