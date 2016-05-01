/*
As of v1.2.0, URLs to important file-system directories are provided.
Each URL is in the form file:///path/to/spot/, and can be converted to a
DirectoryEntry using window.resolveLocalFileSystemURL().

cordova.file.dataDirectory -
Persistent and private data storage within the application's sandbox using internal memory
(on Android, if you need to use external memory, use .externalDataDirectory).
On iOS, this directory is not synced with iCloud (use .syncedDataDirectory).
(iOS, Android, BlackBerry 10)
*/



// global namespace
var fc = fc || {};

var FileIO = {

    // Medium in das app-data-Verzeichnis verschieben
    moveMediaFile: function(imageURI, success) {
        var extension = imageURI.substr(-3);
        window.resolveLocalFileSystemURL(imageURI,
                function(fileEntryFrom) {
                    window.resolveLocalFileSystemURL( cordova.file.externalDataDirectory, function(dirEntry){
                        var now = new Date();
                        var newName = "appg_" + (now.getTime()).toString() + "." + extension;
                        fileEntryFrom.moveTo(dirEntry, newName,
                            function(fileEntryTo) {
                                success(fileEntryTo);
                            },
                            FileIO.errorHandler);
                    }, FileIO.errorHandler )
                },
                FileIO.errorHandler);
        },


    // get a new file entry for the moved image when the user hits the delete button
    // pass the file entry to removeFile()
     removeDeletedImage : function(imageURI){
         if ( navigator.camera ) {
            window.resolveLocalFileSystemURL(imageURI, FileIO.removeFile, FileIO.errorHandler);
         }
     },

    // delete the file
     removeFile : function(fileEntry){
         fileEntry.remove(function(){
         }, FileIO.errorHandler);
     },

    // simple error handler
    /**
     1	NOT_FOUND_ERR
     2	SECURITY_ERR
     3	ABORT_ERR
     4	NOT_READABLE_ERR
     5	ENCODING_ERR
     6	NO_MODIFICATION_ALLOWED_ERR
     7	INVALID_STATE_ERR
     8	SYNTAX_ERR
     9	INVALID_MODIFICATION_ERR
     10	QUOTA_EXCEEDED_ERR
     11	TYPE_MISMATCH_ERR
     12	PATH_EXISTS_ERR
     */
     errorHandler : function(e) {
           var msg = '';
           msg = e.code;
           myApp.alert('FileIO-Fehler: ' + msg);
     }
};

fc.file =  {
   options:{},
    fotocount: 0,
    fotototal: 0,
    group:null,

    init: function() {
        this.options = {};
        this.fotocount= 0;
        this.fotototal = 0;
        this.group=null;
    },

    setOptions: function( options  ){
        this.options = options;
        this.fotototal = 0;
    },

    getguid: function() {
    	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    	    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    	    return v.toString(16);
    	});
    },

    uploadGroup: function( group, success, fail ) {
        var me = this;
        var options = me.options;
		var groups = [];
		var barcodes = [];

        var d = new Date();

        var grp = {
            idx:group.idx,
            gid: this.getguid(),
            dateCreated: group.dateCreated,
            title: group.name,
            prefix: group.bereich,
            formdata: JSON.stringify(group.formdata),
            code: group.code,
            format:group.format,
            numf:group.fotos.length
        }
        me.group = grp;
        groups.push( grp );
        barcodes.push( { code: group.code, format: group.format } );

        var params = {
            authautologin: vm.user.token,
            groups: JSON.stringify(groups),
            barcodes: JSON.stringify(barcodes)
        };

        $$.post(vm.baseuri +'app/uploaddata', params, function (data) {
            var result = JSON.parse(data);
		    if ( result.message.length ) {
                myApp.alert('', result.message );
		    }
		    if ( result.success ) {
                me.uploadMedia( group, success, fail );
		    }
            else {
                fail('Die Daten konnten nicht gesendet werden.');
            }
        });
    },

    // bilder inkl. name und kommentar hochladen
    uploadMedia: function( group, success, fail ) {
    	var me = this;
        me.fotocount = 0;
        me.uploadFoto( group.fotos, 0, function(){
            me.fotocount = 0;
            me.uploadFoto( group.videos, 0, function(){
                me.fotocount = 0;
                me.uploadFoto( group.audios, 0, function(){
                    me.sendUploadDone(success);
                }, fail, "Sende Audio ..." );
            }, fail, "Sende Video ..." );
        }, fail, "Sende Foto ..." );
    },

    // bilder inkl. name und kommentar hochladen
    uploadFoto: function( fotos, idx, success, fail, msg ) {
    	var me = this;
    	var fotostore = fotos;
    	if ( idx < fotostore.length ) {
	    	var foto = fotostore[idx];
	    	me.fotocount++;
            me.fotototal++;
            myApp.showPreloader(msg + "<br>Gesendete Medien:" +  me.fotototal);
		    var fileURI = foto.uri;
		    var serverURI = vm.baseuri + 'app/upload' ;
            if ( navigator.camera ) {
                try {
                    var options = new FileUploadOptions();
                    options.fileKey="file";
                    options.fileName=fileURI.substr(fileURI.lastIndexOf('/')+1);
                    options.mimeType="text/plain";
                    options.chunkedMode = false;
                    options.params = {
                        guid: me.group.gid,
                        index: idx,
                        title: foto.title,
                        bemerkung: _.isUndefined(foto.bemerkung)?"":foto.bemerkung,
                        authautologin: vm.user.token
                    };
                    var ft = new FileTransfer();
                    ft.upload(fileURI, encodeURI(serverURI),
                        function(r) {
                            myApp.hidePreloader();
                            //alert("Code = " + r.responseCode);
                            //alert("Response = " + r.response);
                            //alert("Sent = " + r.bytesSent);
                            var res = JSON.parse( r.response );
                            try {
                                if ( res.success ) {
                                    vm.sets[ me.group.idx ].sended = true;
                                    me.uploadFoto( fotos, idx + 1, success, fail, msg );
                                }
                                else {
                                    if ( res.message && res.message.length )
                                        fail( res.message );
                                    else
                                        fail('Upload failed');
                                }
                            }
                            catch(e) {
                                //appgeordnet.app.log( "Upload: " + e.message );
                                fail( "Upload: " + e.message );
                            }
                        },
                        function(error) {
                            myApp.hidePreloader();
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
                            //appgeordnet.app.log( "Upload Failed: " + msg );
                            fail( "Fehler beim Upload: " + msg );
                        },
                        options);
                }
                catch(e) {
                    myApp.hidePreloader();
                    //appgeordnet.app.log( "Upload Fehler: " + e.message );
                    fail( e.message );
                }
            }
            else {
                myApp.hidePreloader();
                me.uploadFoto( fotos, idx + 1, success, fail, msg );
            }
	    }
		else {
            success();
		}
    },

    sendUploadDone: function(success) {
        var me = this;
        var serverURI = vm.baseuri + 'app/uploaddone';
        var groups = [];
        var stats = {
            version: window.cfg.version,
            name: window.cfg.device.model,
            platform: window.cfg.device.platform,
            uuid: window.cfg.device.uuid,
            devversion: window.cfg.device.version,
            numfotos: -1
        };
        groups.push( me.group.gid );
        $$.post( serverURI, {
                authautologin: vm.user.token,
                groups:JSON.stringify(groups),
                stats: JSON.stringify(stats)
            },
            function(response, opts ) {
                vm.sets[ me.group.idx ].sended = true;
                success();
            }
        );
    },

    removeFotoFromFileSystem: function( fileuri ) {
        if ( navigator.camera ) {
            if ( fileuri.length ) {
                FileIO.removeDeletedImage(fileuri);
            }
        }
    },

	faillocal: function(evt) {
		//appgeordnet.app.log( "Fehler beim Anfordern des Filesystems: " + Ext.encode(evt) );
  	},

    // Foto in (neues) Verzeichnis appgeordnet verschieben
    moveTo: function( uri, success ) {
        var me = this;
        var fileName = uri.substr(uri.lastIndexOf('/')+1);
        window.resolveLocalFileSystemURI( uri,
            function(entry){
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
                    function(fileSys) {
                        fileSys.root.getDirectory("appgeordnet", {create: true, exclusive: false},
                            function(directory) {
                                entry.moveTo(directory, fileName, success, me.faillocal );
                            }, me.faillocal );
                    }, me.faillocal );
            },
            me.faillocal );
    }
};
