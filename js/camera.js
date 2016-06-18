// global namespace
var fc = fc || {};
fc.camera =  {
    getPicture: function( success, fail ) {
    	var cam = navigator.camera;
    	if ( cam ) {
            navigator.camera.getPicture(
                function(imageUri) {
                    var title = imageUri.replace(/^.*[\\\/]/, '');
                    FileIO.moveMediaFile(
                        decodeURI( imageUri ),
                        function(fileEntry) {
                            fileEntry.file( function(file){
                                success({
                                    uri: fileEntry.nativeURL,
                                    title: title,
                                    size: file.size,
                                    bemerkung:""
                                });
                            });
                        });
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
            success( { size: 123, uri: 'test.jpg', title: 'title', bemerkung: 'Bild ' + _.now() }  );
        }
    },

    captureBarcode: function( success, fail ) {
    	var cam = navigator.camera;
    	if ( cam ) {
            cordova.plugins.barcodeScanner.scan(
                function(result) {
                    if ( result.format.length && result.text.length) {
                        success( result );
                    }
                    else if (result.cancelled )  {
                        fail( 'cancel' );
                    }
                    else {
                        fail( 'Kein Ergebnis: ' + JSON.stringify(result) );
                    }
                },
                function(error) {
                    fail( error );
                },
                {
                    "preferFrontCamera" : false, // iOS and Android
                    "showFlipCameraButton" : true, // iOS and Android
                    "prompt" : "Barcode im Bereich platzieren." // supported on Android only
                    //,"formats" : "" // default: all but PDF_417 and RSS_EXPANDED
                    //,"orientation" : "portrait" // Android only (portrait|landscape), default unset so it rotates with the device
                });
    	}
        else {
            success( { 'text':'1234567890123','format':'EAN_13' } );
        }
    },

    moveMediaFile: function(vid,success) {
        FileIO.moveMediaFile(
            vid.uri,
            function(fileEntry) {
                //vid.uri = fileEntry.fullPath;
                vid.uri = fileEntry.nativeURL;
                success(vid);
        });
    },

    captureVideo: function(success, fail ) {
        var me=this;
        if (navigator.camera) {
            navigator.device.capture.captureVideo(
                function (mediaFiles) {
                    var i, len, vid, title;
                    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
                        title = mediaFiles[i].name.replace(/^.*[\\\/]/, '');
                        vid = {
                            uri: decodeURI(
                                (device.platform === "Android")?mediaFiles[i].fullPath:mediaFiles[i].localURL
                            ),
                            title: title,
                            size: mediaFiles[i].size,
                            type: mediaFiles[i].type,
                            date: mediaFiles[i].lastModifiedDate
                        };
                        me.moveMediaFile(vid,success);
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
            success({uri: "fullPath", title: "video.mp4", size: 12345, type:"mp4",date:"01.03.2016"} );
        }
    },

    captureAudio: function(success, fail ) {
        var me=this;
        if (navigator.camera) {
            navigator.device.capture.captureAudio(
                function(mediaFiles) {
                    var i, len;
                    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
                        var title = mediaFiles[i].name.replace(/^.*[\\\/]/, '');
                        var vid = {
                            uri: decodeURI(
                                (device.platform === "Android")?mediaFiles[i].fullPath:mediaFiles[i].localURL
                            ),
                            title: title,
                            size: mediaFiles[i].size,
                            type: mediaFiles[i].type,
                            date: mediaFiles[i].lastModifiedDate
                        };
                        me.moveMediaFile(vid,success);

                    }
                },
                function (error) {
                    fail(error);
                },
                {limit: 1});
        }
        else {
            success({uri: "fullPath", title: "audio.mp3", size: 12345, type:"mp3",date:"01.03.2016"} );
        }
    }

};
