// global namespace
var fc = fc || {};

fc.camera =  {

    getPicture: function( success, fail ) {
        //console.log('getPicture');
    	var cam = navigator.camera;
    	if ( cam ) {
            navigator.camera.getPicture(
                function(imageUri) {
                    //console.log(imageUri);
                    var title = imageUri.replace(/^.*[\\\/]/, '');
                    success( { uri: imageUri, title: title, bemerkung:"" }  );
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
            success( { uri: 'test.jpg', title: 'title', bemerkung: 'Bild ' + _.now() }  );
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
    },

    captureVideo: function(success, fail ) {

        if (navigator.camera) {
            navigator.device.capture.captureVideo(
                function (mediaFiles) {
                    var i, len;
                    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
                        var title = mediaFiles[i].name.replace(/^.*[\\\/]/, '');
                        success({uri: mediaFiles[i].fullPath,
                            title: title,
                            size: mediaFiles[i].size,
                            type: mediaFiles[i].type,
                            date: mediaFiles[i].lastModifiedDate
                        } );
                    }
                },
                function (error) {
                    fail(error);
                },
                {
                    limit: 1,
                    quality: 0
                });
        }
        else {
            success({uri: "fullPath", title: "title", size: 12345, type:"vid",date:"01.03.2016"} );
        }
    }

};
