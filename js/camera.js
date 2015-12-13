// global namespace
var fc = fc || {};

fc.camera =  {

    getPicture: function( success, fail ) {
        console.log('getPicture');
    	var cam = navigator.camera;
    	if ( cam ) {
            navigator.camera.getPicture(
                function(imageUri) {
                    console.log(imageUri);
                    var title = imageUri.replace(/^.*[\\\/]/, '');
                    success( { uri: imageUri, title: title }  );
                },
                function(error) {
                    console.log('getPicture error');
                    console.log(error);
                    fail(error);
                },
                {
                    quality: 50,
                    destinationType: Camera.DestinationType.FILE_URI
    //                ,sourceType:Camera.PictureSourceType.CAMERA
                    ,saveToPhotoAlbum: false
                    ,allowEdit: false
                });
        }
        else {
            success( { uri: 'test.jpg', title: 'title' }  );
        }
    },

    captureBarcode: function( success, fail ) {
    	var cam = navigator.camera;
    	if ( cam ) {
            cordova.plugins.barcodeScanner.scan(
                function(result) {
                    if ( ! result.cancelled && result.format.length && result.text.length) {
                        success( result );
                    }
                    else {
                        fail( 'cancel' );
                    }
                },
                function(error) {
                    fail( error );
                });
    	}
        else {
            success( { 'text':'1234567890123','format':'EAN_13' } );
        }
    }


};
