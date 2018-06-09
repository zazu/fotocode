// global namespace
var fc = fc || {};
fc.camera =  {
    getPicture: function( success, fail, fotoconf, sourceType ) {
    	var cam = navigator.camera;
    	if ( cam ) {
            navigator.camera.getPicture(
                function(imageUri) {
                    var title = imageUri.replace(/^.*[\\\/]/, '');
                    FileIO.moveMediaFile(
                        decodeURI( imageUri ),
                        function(fileEntry) {
                            //fc.camera.resizeFoto(fotoconf,fileEntry, function(fileEntry) {
                                fileEntry.file(function (file) {
                                    success({
                                        uri: fileEntry.nativeURL,
                                        title: title,
                                        size: file.size,
                                        bemerkung: ""
                                    });
                                });
                            //});
                        });
                },
                function(error) {
                    console.log('getPicture error');
                    console.log(error);
                    fail(error);
                },
                {
                    //allowEdit: true,
                    //correctOrientation: true,
                    quality: fotoconf.qual,
                    destinationType: Camera.DestinationType.FILE_URI
                    ,sourceType:sourceType
                    ,saveToPhotoAlbum: false
                    ,allowEdit: false
                });
        }
        else {
            success( { size: 123, uri: 'test.jpg', title: 'title', bemerkung: 'Bild ' + _.now() }  );
        }
    },

    resizeFoto: function(fotoconf, fileEntryTo, success) {
        var reader = new FileReader();
        reader.onload = function (readerEvent) {
            var image = new Image();
            image.onload = function (imageEvent) {
                var canvas = document.createElement('canvas'),
                    width = image.width,
                    height = image.height;

                var r = width / height;
                var wa = Math.sqrt( fotoconf.jpgsiz * 1e6 * r );
                var ha = Math.sqrt( fotoconf.jpgsiz * 1e6 / r );
                var max_size = Math.max(wa,ha);

                if (width > height) {
                    if (width > max_size) {
                        height *= max_size / width;
                        width = max_size;
                    }
                } else {
                    if (height > max_size) {
                        width *= max_size / height;
                        height = max_size;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(image, 0, 0, width, height);

                fileEntryTo.createWriter(function(writer){
                    writer.onwriteend = function(evt) {
                        success(fileEntryTo);
                    };
                    canvas.toBlob( function(blob){
                        writer.truncate(0);
                        writer.write(blob);
                    } );

                }, function(e) {
                    var msg = '';
                    msg = e.code;
                    myApp.alert('CreateWriter-Fehler: ' + msg);
                });
            }
            image.src = readerEvent.target.result;
        }
        reader.readAsDataURL(fileEntryTo);
    },

    captureBarcode: function( success, fail, format ) {
        var cloudSky = cloudSky || false;
        if (cloudSky && cloudSky.zBar && format === 'ITF')
            this.captureBarcodeZBar( success, fail, format );
        else
            this.captureBarcodeCordova( success, fail, format );
    },

    captureBarcodeCordova: function( success, fail, format ) {
    	var cam = navigator.camera;
    	if ( cam ) {
            var orientation = (window.orientation && (window.orientation == -90 || window.orientation == 90)) ? "landscape": "portrait";
            var lockori = window.cfg.lockorientation && (window.cfg.device.platform !== "Android");
            if (lockori) window.screen.lockOrientation(window.screen.orientation);
            cordova.plugins.barcodeScanner.scan(
                function(result) {
                    if (lockori)window.screen.unlockOrientation();
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
                    if (lockori)window.screen.unlockOrientation();
                    fail( error );
                },{
                    "preferFrontCamera" : false, // iOS and Android
                    "showFlipCameraButton" : true, // iOS and Android
                    "showTorchButton" : true, // iOS and Android
                    "disableAnimations" : true, // iOS
                    "prompt" : "Barcode im Bereich platzieren." // supported on Android only
//                    ,"formats": format // default: all but PDF_417 and RSS_EXPANDED
                    ,"orientation" : orientation // Android only (portrait|landscape), default unset so it rotates with the device
                });
    	}
        else {
            success( { 'text':'1234567890123','format':'EAN_13' } );
        }
    },

    captureBarcodeZBar: function( success, fail, format ) {
        var cam = navigator.camera;
        if (cam) {
            cloudSky.zBar.scan({
                text_title: 'Scan QR Code', // Android only
                text_instructions: "Barcode im Bereich platzieren." // Android only
            }, function(result) {
                if ( result.length ) {
                    success( { 'text': result,'format': format } );
                }
                else if (result.cancelled )  {
                    fail( 'cancel' );
                }
                else {
                    fail( 'Kein Ergebnis: ' + JSON.stringify(result) );
                }
            }, function(error) {
                fail( error );
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
