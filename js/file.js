// global namespace
var fc = fc || {};

// set some globals
var gImageURI = '';
var gFileSystem = {};

var FileIO = {

// sets the filesystem to the global var gFileSystem
 gotFS : function(fileSystem) {
      gFileSystem = fileSystem;
 },

// pickup the URI from the Camera edit and assign it to the global var gImageURI
// create a filesystem object called a 'file entry' based on the image URI
// pass that file entry over to gotImageURI()
updateCameraImages : function(imageURI, success) {
        gImageURI = imageURI;
        window.resolveLocalFileSystemURL(imageURI,
                function(fileEntryFrom) {
                    window.resolveLocalFileSystemURL( cordova.file.externalDataDirectory, function(dirEntry){
                        //console.log('DestDir');
                        //console.log(dirEntry);
                        var now = new Date();
                        var newName = "appg_" + (now.getTime()).toString() + ".jpg";
                        fileEntryFrom.moveTo(dirEntry, newName,
                            function(fileEntryTo) {
                                success(fileEntryTo);
                            },
                            FileIO.errorHandler);
                    }, FileIO.errorHandler )
                },
                FileIO.errorHandler);
    },

// pickup the file entry, rename it, and move the file to the app's root directory.
// on success run the movedImageSuccess() method
 gotImageURI : function(fileEntry) {
    var now = new Date();
    var newName = "appg_" + (now.getTime()).toString() + ".jpg";
    fileEntry.moveTo(gFileSystem.root, newName, FileIO.movedImageSuccess, FileIO.errorHandler);
 },

// send the full URI of the moved image to the updateImageSrc() method which does some DOM manipulation
 movedImageSuccess : function(fileEntry) {
      updateImageSrc(fileEntry.fullPath);
 },

// get a new file entry for the moved image when the user hits the delete button
// pass the file entry to removeFile()
 removeDeletedImage : function(imageURI){
     //console.log('removeDeletedImage');
     //console.log(imageURI);
     window.resolveLocalFileSystemURL(imageURI, FileIO.removeFile, FileIO.errorHandler);
 },

// delete the file
 removeFile : function(fileEntry){
     //console.log('removeFile');
     //console.log(fileEntry);
     fileEntry.remove();
 },

// simple error handler
 errorHandler : function(e) {
       var msg = '';
       msg = e.code;
       appgeordnet.app.log('FileIO-Fehler: ' + msg);
 }
}

fc.file =  {
   options:{},
    fotocount: 0,
    fotototal: 0,
    group:null,

    setOptions: function( options  ){
        this.options = options;
        this.fotototal = 0;
    },

    uploadGroup: function( group, success, fail ) {
        var me = this;
        var options = me.options;
        me.group = group;
		var groups = [];
		var barcodes = [];
        groups.push( {
            gid: group.data.gid,
            dateCreated: group.data.dateCreated,
            title: group.data.title,
            prefix: group.data.prefix,
            formdata: group.data.formdata,
            code: group.data.code,
            format:group.data.format,
            numf:group.data.numf
        } );
        barcodes.push( { code: group.data.code, format: group.data.format } );
		Ext.Ajax.request( {
		    url: options.serveruri + 'app/uploaddata',
		    params: {
                authautologin: options.authautologin,
                groups: Ext.encode(groups),
                barcodes: Ext.encode(barcodes)
            },
		    success: function(response, opts ) {
		        var result = Ext.decode(response.responseText);
		        if ( result.message.length ) {
		        	Ext.Msg.alert('', result.message );
		        }
		        if ( result.success ) {
                    me.uploadFotos( group.fotos(), success, fail );
		        }
		    },
		    failure: function(){
                fail();
		    }
		});
    },

    // bilder inkl. name und kommentar hochladen
    uploadFotos: function( fotos, success, fail ) {
    	var me = this;
        me.fotocount = 0,
        me.uploadFoto( fotos, 0, success, fail );
    },

    // bilder inkl. name und kommentar hochladen
    uploadFoto: function( fotos, idx, success, fail ) {
    	var me = this;
    	var fotostore = fotos;
    	if ( idx < fotostore.getCount() ) {
	    	var foto = fotostore.getAt( idx );
	    	me.fotocount++;
            me.fotototal++;
		    Ext.Viewport.setMasked({xtype:'loadmask',message:'Sende Bild ' + me.fotototal } );
		    var fileURI = foto.get('uri');
		    var serverURI = me.options.serveruri + 'app/upload' ;
            if ( navigator.camera ) {
                try {
                    var options = new FileUploadOptions();
                    options.fileKey="file";
                    options.fileName=fileURI.substr(fileURI.lastIndexOf('/')+1);
                    options.mimeType="text/plain";
                    options.chunkedMode = false;
                    options.params = {
                        guid: me.group.data.gid,
                        index: idx,
                        title: foto.data.title,
                        bemerkung: foto.data.bemerkung,
                        authautologin: me.options.authautologin
                    };
                    var ft = new FileTransfer();
                    ft.upload(fileURI, encodeURI(serverURI),
                        function(r) {
                            //alert("Code = " + r.responseCode);
                            //alert("Response = " + r.response);
                            //alert("Sent = " + r.bytesSent);
                            var res = Ext.decode( r.response );
                            try {
                                if ( res.success ) {
                                    me.uploadFoto( fotos, idx + 1, success, fail );
                                }
                                else {
                                    if ( res.message && res.message.length )
                                        fail( res.message );
                                    else
                                        fail();
                                }
                            }
                            catch(e) {
                                appgeordnet.app.log( "Upload: " + e.message );
                                fail( "Upload: " + e.message );
                            }
                        },
                        function(error) {
                            Ext.Viewport.setMasked(false);
                            var msg= "Code = " + error.code ;
                            if ( error.code == FileTransferError.FILE_NOT_FOUND_ERR)
                                msg='Die Datei wurde nicht gefunden! - ' + options.fileName;
                            else if ( error.code == FileTransferError.INVALID_URL_ERR)
                                msg='Ungültige URL!';
                            else if ( error.code == FileTransferError.CONNECTION_ERR)
                                msg='Verbindungsfehler!';
                            else if ( error.code == FileTransferError.ABORT_ERR)
                                msg='Der Transfer wurde abgebrochen!';
                            //alert("upload error source " + error.source);
                            //alert("upload error target " + error.target);
                            appgeordnet.app.log( "Upload Failed: " + msg );
                            fail( "Fehler beim Upload: " + msg );
                        },
                        options);
                }
                catch(e) {
                  appgeordnet.app.log( "Upload Fehler: " + e.message );
                  fail( e.message );
                }
            }
            else {
                me.uploadFoto( fotos, idx + 1, success, fail );
            }
	    }
		else {
            var serverURI = me.options.serveruri + 'app/uploaddone';
            var groups = [];
            var stats = {
                version: appgeordnet.app.version,
                name: device.name,
                platform: device.platform,
                uuid: device.uuid,
                devversion: device.version,
                numfotos: fotostore.getCount()
            };
            groups.push( me.group.data.gid );
            Ext.Ajax.request( {
                url: serverURI,
                params: { authautologin: me.options.authautologin, groups:Ext.encode(groups), stats: Ext.encode(stats)  },
                success: function(response, opts ) {
                    fotostore.each( function( foto ) {
                        me.removeFotoFromFileSystem( foto.data.uri );
                    });
                    success();
                },
                failure: function(){
                    fail('Upload Done failed' );
                }
            });
		}
    },

    removeFotoFromFileSystem: function( fileuri ) {
        if ( navigator.camera ) {
            var me = this;
            if ( fileuri.length ) {
                FileIO.removeDeletedImage(fileuri);
            }
        }
    },

	faillocal: function(evt) {
		appgeordnet.app.log( "Fehler beim Anfordern des Filesystems: " + Ext.encode(evt) );
  	},

    // Foto in (neues) Verzeichnis appgeordnet verschieben
    moveTo: function( uri, success ) {
        var me = this;
        var fileName = uri.substr(uri.lastIndexOf('/')+1);
        window.resolveLocalFileSystemURI( uri, resOnSuccess, me.faillocal );
        function resOnSuccess(entry){
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                function(fileSys) {
                    fileSys.root.getDirectory("appgeordnet", {create: true, exclusive: false},
                        function(directory) {
                            entry.moveTo(directory, fileName, success, me.faillocal );
                        }, me.faillocal );
                }, me.faillocal );
        }
    }
};
