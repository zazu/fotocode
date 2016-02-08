// global namespace
var fc = fc || {};

fc.updater =  {

    checkVersion: function( serveruri, version ) {
        try {
            myApp.showPreloader('Updateprüfung');
            $$.ajax({
                url: serveruri + 'app/version?' + _.now(),
                method: 'GET',
                data: { version:version },
                success: function (data) {
                    myApp.hidePreloader();
                    data = JSON.parse(data);
                    var alt = updater.version( version);
                    var neu = updater.version(data.version);
                    if ( neu > alt ) {
                        var msg = 'Ein Update auf die Version ' + result.version +
                                ' ist verfügbar. Soll das Update jetzt geladen werden?&nbsp;&nbsp;' +
                                data.msg;
                        myApp.confirm(msg, function () {
                            fc.updater.updateApp( data.url, function(){}, function(){} );
                        });
                    }
                },
                error: function() {
                    myApp.hidePreloader();
                    myApp.addNotification({
                        title: 'Update',
                        message: 'Bei der Updatepürfung ist ein Fehler aufgetreten.',
                        hold: 0
                    });
                }
            });
        }
        catch(e){
            myApp.addNotification({
                title: 'Update',
                message: 'Bei der Updatepürfung ist ein Fehler aufgetreten.',
                hold: 0
            });
        }
    },

    version: function( vs ) {
        var v = 0;
        var vers = vs.split(".");
        _.each( vers, function( num , idx ) {
            if( idx < 3 ) {
                num = parseInt( num, 10 );
                if ( ! isNaN(num) )
                    v = v + num * Math.pow( 10, 6 - (2*idx)) ;
            }
        });
        return v;
    },

    updateApp: function( androidUrl, onSuccess, onError  ) {
        var fileTransfer = new FileTransfer();
        fileTransfer.download(encodeURI(androidUrl),
            "cdvfile://localhost/temporary/app.apk",
            function (entry) {
                window.plugins.webintent.startActivity({
                    action: window.plugins.webintent.ACTION_VIEW,
                    url: entry.toURL(),
                    type: 'application/vnd.android.package-archive'
                }, function () {
                    onSuccess();
                }, function () {
                    onError("Failed to open URL via Android Intent. URL: " + entry.fullPath);
                });
            }, function (error) {
                onError(
                    "error source " + error.source +
                    ", error target " + error.target +
                    ", error code" + error.code);
            }, true);
    }

};