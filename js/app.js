
Template7.global = {
    android: isAndroid,
    ios: isIos
};

window.onload = function () {
    var mobiledevice = (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/));
    window.cfg = {
        version: '2.1.33',
        uritest: mobiledevice ? "https://test.app-geordnet.de/":
                                'http://localhost:8080/app-geordnet/',
        uriproduction: mobiledevice ?
            "https://2018.app-geordnet.de/":
            'http://localhost:8080/app-geordnet/',
        device: {
            model: '',
            platform: '',
            uuid: '',
            version: ''
        }
    };
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/))
        document.addEventListener("deviceready", onDeviceReady, false);
    else
        onDeviceReady();
};

function onDeviceReady() {

    // Export selectors engine
    window.$$ = Dom7;

    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
        window.cfg.device = device;
        window.cfg.version = AppVersion.version;

//        window.addEventListener('native.keyboardshow', function(e){StatusBar.hide();});
//        window.addEventListener('native.keyboardhide', function(e){StatusBar.hide();});

        // fix keyboard hiding focused input texts
        // using native keyboard plugin and move.min.js
        // https://github.com/vitohe/ionic-plugins-keyboard/tree/f94842fec1bacf72107083d2e44735e417e8439d
        // http://visionmedia.github.io/move.js/
        // not tested on iOS so implementation is for Android only
        if (window.cfg.device.platform === "Android") {
            // device is running Android
            // attach showkeyboard event listener
            // which is triggered when the native keyboard is opened
            window.addEventListener('native.showkeyboard', function(e) {
                StatusBar.hide();
                /*
                // get viewport height
                var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                // get the maximum allowed height without the need to scroll the page up/down
                var scrollLimit = viewportHeight - (document.activeElement.offsetHeight + document.activeElement.offsetTop);
                // if the keyboard height is bigger than the maximum allowed height
                if (e.keyboardHeight > scrollLimit) {

                    $$('<div class="kbscrollhlp"></div>').attr('height', e.keyboardHeight+'px').appendTo($$('.view-main div.page-content'));

                    // calculate the Y distance
                    var scrollYDistance = document.activeElement.offsetHeight + (e.keyboardHeight - scrollLimit);
                    // animate using move.min.js (CSS3 animations)
                    //move(document.body).to(0, -scrollYDistance).duration('.2s').ease('in-out').end();
                    $$(document.body).scrollTo(0,scrollYDistance,200);
                }
                */
            });

            window.addEventListener('native.hidekeyboard', function() {
                StatusBar.hide();
                /*
                // remove focus from activeElement
                // which is naturally an input since the nativekeyboard is hiding
                document.activeElement.blur();
                // animate using move.min.js (CSS3 animations)
                //move(document.body).to(0, 0).duration('.2s').ease('in-out').end();
                //$$(document.body).scrollTo(0,0,200);
                $$('.view-main div.page-content').scrollTo(0,0,200);
                $$('.kbscrollhlp').remove();
                */
            });
        }
        // android update bleibt hängen
        //if ( cordova.InAppBrowser )window.open = cordova.InAppBrowser.open;
    }
/*
    else {
        window.keyboardShowHandler = function () {
            var keyboardHeight = 1500;

            $$('<div class="kbscrollhlp"></div>').attr('height',keyboardHeight+'px').appendTo($$('.view-main div.page-content'));

            // get viewport height
            var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            // get the maximum allowed height without the need to scroll the page up/down
            var scrollLimit = viewportHeight - (document.activeElement.offsetHeight + document.activeElement.offsetTop);
            // if the keyboard height is bigger than the maximum allowed height
            if (keyboardHeight > scrollLimit) {
                // calculate the Y distance
                var scrollYDistance = document.activeElement.offsetHeight + (keyboardHeight - scrollLimit);
                $$('.view-main div.page-content').scrollTo(0, scrollYDistance, 200);
            }
        }
    }
*/

    if (isAndroid) {
        // Change class
        //$$('.view.navbar-through').removeClass('navbar-through').addClass('navbar-fixed');
        // And move Navbar into Page
        //$$('.view .navbar').prependTo('.view .page');
        $$('body').addClass('android');
    }
    else {
        $$('body').addClass('ios');
    }

    // Initialize the app
    window.myApp = new Framework7({
        swipePanel: 'right',
        //  pushState:true,
        material: isAndroid ? true : false,
        template7Pages: false,
        notificationCloseButtonText: 'Schließen',
        smartSelectPopupCloseText:'Schließen',
        backLinkText:'Schließen',
        popupCloseText:'Schließen',
        toolbarCloseText:'Fertig',
        smartSelectPickerCloseText: 'Fertig',
        smartSelectBackText:'Zurück',
        notificationHold: 5000,
        modalTitle: 'appgeordnet',
        modalButtonCancel: 'Abbrechen',
        smartSelectOpenIn: isAndroid ? 'page': 'picker'
    });

    // Add view
    window.mainView = myApp.addView('.view-main', {
        domCache: true
        // Material doesn't support it but don't worry about it
        // F7 will ignore it for Material theme
        //,dynamicNavbar: true
    });

    //myApp.params.swipePanel = false;


    $$(document).on('pageInit', function (e) {
        var page = e.detail.page;
        if (page.name !== 'index')
            myApp.params.swipePanel = false;
        else
            myApp.params.swipePanel = 'right';

        if (page.name === 'quickscan') {
            vm.cleanset();
            vm.updateQuickscanCodeformat();
        }
        if (page.name === 'barcode') {
            vm.updateBarcodeCodeformat();
        }
    });

    $$(document).on('pageReinit', function (e) {
        var page = e.detail.page;
        if (page.name === 'quickscan') {
            if (page.fromPage.name === 'index' || page.fromPage.name === 'dash') {
                vm.cleanset();
                vm.updateQuickscanCodeformat();
                myApp.params.swipePanel = false;
            }
        }
        else if (page.name === 'index') {
            myApp.params.swipePanel = 'right';
        }
        else if (page.name === 'medien') {
            if (page.fromPage.name === 'barcode') {
                vm.cloneset();
            }
        }
        else if (page.name === 'barcode') {
            vm.updateBarcodeCodeformat();
        }
        else {
            myApp.params.swipePanel = false;
        }
    });

    Vue.config.debug = !navigator.camera;

    Vue.filter('notEmpty', function (values) {
        return values ? values.filter(function (val) {
            return (val+'').length;
        }) : [];
    });

    Vue.filter('astext', function (value) {
        return value+'';
    });


    Vue.filter('b2MB', function (value) {
        return (value / 1024 / 1024).toFixed(2);
    });

    window.vm = new Vue({
        el: '#app',
        myPhotoBrowser: null,
        selectedSet: null,
        numsent: 0,
        nextmedia:'foto',
        data: {
            isandroid: isAndroid,
            isios:isIos,
            useserver:'production',
            appversion: window.cfg.version,
            lastsent: '',
            bereich: 0,
            usecamera: true,
            showform: true,
            sets: [],
            set: {
                name: '',
                code: '',
                dateCreated: '',
                format: '',
                fotos: [],
                formdata: {name:''},
                bereich: 0,
                videos: [],
                audios: [],
                files:[]
            },
            login: {login: '', password: ''},
            user: {name: '', token: '', role:''},
            form: [],
            bereiche: {},
            codeformat: '',
            codeformats: [
                'EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'ITF', 'CODE_128', 'CODE_39', 'CODE_93',
                'CODABAR', 'QR_CODE', 'DATA_MATRIX', 'PDF417'
            ],
            fotoconf:{}
        },
        computed: {
            classtheme: function() {
                return {
                    'theme-red': this.colortheme == 'red',
                    'theme-blue': this.colortheme == 'blue',
                    'theme-teal': this.colortheme == 'teal'
                }
            },
            classbg: function() {
                return {
                    'bg-red': this.colortheme == 'red',
                    'bg-blue': this.colortheme == 'blue',
                    'bg-teal': this.colortheme == 'teal'
                }
            },
            classcolor: function() {
                return {
                    'color-red': this.colortheme == 'red',
                    'color-blue': this.colortheme == 'blue',
                    'color-teal': this.colortheme == 'teal'
                }
            },
            bigbuttoncolor: function(){
                return {
                    'button': true,
                    'button-fill': true,
                    'color-gray': this.numsets==0,
                    'color-orange':this.numsets>0
                }
            },
            colortheme: function() {
                return this.useserver==='test'?"red": (this.isios?"blue":"teal");
            },
            baseuri: function() {
                return this.useserver === "test"?window.cfg.uritest:window.cfg.uriproduction;
            },
            isadmin: function() {
                return this.user && this.user.role >=3;
            },
            numsets: function () {
                return this.sets.length;
            },
            numfotos: function () {
                var num = 0;
                for (var i = 0; i < this.sets.length; i++) {
                    num = num + this.sets[i].fotos.length;
                }
                return num;
            },
            numvideos: function () {
                var num = 0;
                for (var i = 0; i < this.sets.length; i++) {
                    num = num +  (!_.isUndefined(this.sets[i].videos)?this.sets[i].videos.length:0);
                }
                return num;
            },
            numaudios: function () {
                var num = 0;
                for (var i = 0; i < this.sets.length; i++) {
                    num = num + (!_.isUndefined(this.sets[i].audios)?this.sets[i].audios.length:0);
                }
                return num;
            },
            numfiles: function () {
                var num = 0;
                for (var i = 0; i < this.sets.length; i++) {
                    num = num + (!_.isUndefined(this.sets[i].files)?this.sets[i].files.length:0);
                }
                return num;
            },
            nummedia: function() {
                return this.numfotos + this.numvideos + this.numaudios + this.numfiles;
            },
            numcodes: function () {
                var num = 0;
                for (var i = 0; i < this.sets.length; i++) {
                    num = num + ((this.sets[i].code+'').length ? 1 : 0);
                }
                return num;
            },
            emptycode: function () {
                return (this.set.code+'').length == 0;
            },
            validlogin: function () {
                return this.login.login.length && this.login.password.length;
            },
            loggedin: function () {
                return this.user.token && this.user.token.length > 0;
            },
            validquickscan: function () {
                return this.validbarcode;
            },
            validbarcode: function () {
                // barcode muss definiert sein
                return (this.set.code+'').length || this.usecamera;
            },
            hasbereiche: function () {
                return !_.isEmpty(this.user) && this.form && this.form.length > 1;
            },
            bereichkurzname: function () {
                var me = this;
                return (me.bereich >= 0 && !_.isEmpty(me.user) &&
                    me.bereiche &&
                    me.bereiche.bereich[me.bereich].length
                ) ? me.bereiche.bereichshort[me.bereich]
                    : '';
            },
            bereichname: function () {
                var me = this;
                return (me.bereich > 0 && !_.isEmpty(me.user) &&
                    me.bereiche &&
                    me.bereiche.bereich[me.bereich].length
                ) ? me.bereiche.bereich[me.bereich]
                    : '';
            },
            bereichablage: function () {
                var me = this;
                return (me.bereich > 0 && !_.isEmpty(me.user) &&
                    me.bereiche &&
                    me.bereiche.bereich[me.bereich].length
                ) ? me.bereiche.ablage[me.bereich]
                    : '';
            },
            hasform: function () {
                var me = this;
                return me.bereich > 0 && me.bereiche.hasform[me.bereich] > 0;
            },
            fotoqual: function() {
                return this.fotoconf.qual ? this.fotoconf.qual : 80;
            },
            fotojpgsiz: function() {
                return this.fotoconf.jpgsiz ? this.fotoconf.jpgsiz : 5;
            }
        },
        created: function () {
            var me = this;
            _.forEach(Lockr.get('appg-sets', []), function(set){me.sets.push(set);});
            me.user = Lockr.get('appg-user', {});
            me.form = Lockr.get('appg-form', []);
            me.bereiche = Lockr.get('appg-bereiche', {});
            me.codeformat = Lockr.get('appg-codeformat', '');
            me.useserver = Lockr.get('appg-useserver', 'production');
            me.bereich = Lockr.get('appg-bereich', 0);
            me.usecamera = (Lockr.get('appg-usecamera', 'true') !== 'false');
            me.showform = (Lockr.get('appg-showform', 'true') !== 'false');
            me.lastsent = Lockr.get('appg-lastsent', '-');
            me.fotoconf = Lockr.get('appg-fotoconf', { qual:100, jpgsiz:10, vqual:0, dpi:96 });
            me.syncUserInfo();
            me.checkVersion();
        },
        methods: {
            deviceReady: function () {
                var me = this;
                document.addEventListener("backbutton", me.backButton, false);
            },
            ensureValidBereich: function() {
                var me = this;
                if (me.bereich > 0 && ( !me.hasbereiche ||
                    _.isEmpty(me.user) || !me.bereiche.bereich[me.bereich] || !me.bereiche.bereich[me.bereich].length ))
                    me.bereich = 0;
            },

            mediasize: function( idx ) {
                var i, j,size = 0;
                try {
                    var from = (idx == -1) ? 0 : idx;
                    var to = (idx == -1) ? this.sets.length : idx + 1;
                    for (i = from; i < to; i++) {
                        for (j = 0; j < this.sets[i].fotos.length; j++)
                            size = size + this.sets[i].fotos[j].size;
                        for (j = 0; j < this.sets[i].videos.length; j++)
                            size = size + this.sets[i].videos[j].size;
                        for (j = 0; j < this.sets[i].audios.length; j++)
                            size = size + this.sets[i].audios[j].size;
                        for (j = 0; j < this.sets[i].files.length; j++)
                            size = size + this.sets[i].files[j].size;
                    }
                }
                catch(e) {}
                return size;
            },

            menuButton: function () {
                var buttons = [{
                    text: 'appgeordnet beenden',
                    color: 'red',
                    bold: false,
                    onClick: function () {
                        navigator.app.exitApp();
                    }
                },
                    {
                        text: 'Abbrechen'
                    }];
                myApp.actions(buttons);
            },
            backButton: function () {
                var me = this;
                if (me.myPhotoBrowser)
                    me.myPhotoBrowser.close();
                else if ($$(".popup-comment").length)
                    myApp.closeModal(".popup-comment");
                else if (mainView.activePage.name !== "index") {
                    mainView.router.back({reload:true});
                }
                else if ( $$('.actions-modal.modal-in').length === 0 )
                    me.menuButton();
            },
            cloneset: function () {
                var me = this;
                //me.cleanset();
                me.set =  _.cloneDeep(me.sets[me.selectedSet]);
                /*
                me.set.fotos = _.clone(me.sets[me.selectedSet].fotos);
                me.set.name = me.sets[me.selectedSet].name;
                me.set.code = me.sets[me.selectedSet].code;
                me.set.format = me.sets[me.selectedSet].format;
                me.set.bereich = me.sets[me.selectedSet].bereich;
                me.set.dateCreated = me.sets[me.selectedSet].dateCreated;
                me.set.formdata = _.clone(me.sets[me.selectedSet].formdata);
                me.set.videos=_.clone(me.sets[me.selectedSet].videos);
                me.set.audios=_.clone(me.sets[me.selectedSet].audios);
                */
                me.codeformat = vm.sets[me.selectedSet].format;
            },
            cleanset: function () {
                var me = this;
                me.set.fotos = [];//me.set.fotos.splice(0, me.set.fotos.length);
                me.set.name = "";
                me.set.code = "";
                me.set.format = "";
                me.set.bereich = 0;
                me.set.dateCreated = '';
                me.set.formdata = {name:''};
                me.set.videos = [];//me.set.videos.splice(0, me.set.videos.length);;
                me.set.audios = [];//me.set.audios.splice(0, me.set.audios.length);;
                me.set.files = [];
            },
            // Weiter Button im Quickscan-Formular
            scanfoto: function (event) {
                var me = this;
                me.set.dateCreated = moment().format('YYYY-MM-DD HH:mm:ss');
                me.set.bereich = me.bereich;
                Lockr.set('appg-set', me.set);
                if (me.usecamera) {
                    vm.barcode(function () {
                        Vue.nextTick(function () {
                           vm.media(vm.usefotos);
                        });
                    });
                }
                else {
                    me.set.format = me.codeformat;
                    me.validateBarcode(function () {
                        vm.media(vm.usefotos);
                    });
                }
            },
            // Weiter Button im Barcodeformular
            scanbarcode: function (event) {
                var me = this;
                if (me.usecamera) {
                    vm.barcode(function () {
                        me.sets[me.selectedSet].code = me.set.code+'';
                        me.sets[me.selectedSet].format = me.set.format;
                        me.sets[me.selectedSet].name = me.set.name;
                        Lockr.set('appg-sets', me.sets);
                        mainView.router.back();
                    });
                }
                else {
                    me.set.format = me.codeformat;
                    me.validateBarcode(function () {
                        me.sets[me.selectedSet].code = me.set.code+'';
                        me.sets[me.selectedSet].format = me.set.format;
                        me.sets[me.selectedSet].name = me.set.name;
                        Lockr.set('appg-sets', me.sets);
                        mainView.router.back();
                    });
                }
            },
            validateBarcode: function (success) {
                var me = this;
                var msg = [];
                var compiled;
                var err = me.checkBarcode();
                if (err & 1) {
                    compiled = _.template('Die Barcodelänge (<%= ist %>) stimmt nicht mit der Vorgabe (<%= soll %>) überein!');
                    msg.push(compiled({'ist': (me.set.code+'').length, 'soll': me.bereiche.bclen[me.set.bereich]}));
                }
                if (err & 2) {
                    compiled = _.template('Der Barcodetyp (<%= ist %>) stimmt nicht mit der Vorgabe (<%= soll %>) überein!');
                    msg.push(compiled({'ist': me.set.format, 'soll': me.bereiche.bctyp[me.set.bereich]}));
                }
                if (err > 0) {
                    msg.push('');
                    msg.push('Sollen die Vorgaben ignoriert werden?');
                    myApp.confirm(msg.join('<br>'), function () {
                        success();
                    });
                }
                else
                    success();
                return err === 0;
            },
            checkBarcode: function () {
                var soll, err = 0;
                var me = this;
                var bereich = me.set.bereich;
                me.set.code = _.trim(me.set.code);
                if (bereich >= 0 && !_.isEmpty(me.bereiche)) {
                    if (me.bereiche.bclen[bereich].length) {
                        soll = _.parseInt(me.bereiche.bclen[bereich]);
                        if (soll > 0 && soll != (me.set.code+'').length)
                            err += 1;
                    }
                    if (me.bereiche.bctyp[bereich].length) {
                        soll = me.bereiche.bctyp[bereich];
                        if (soll != 'all' && soll != me.set.format)
                            err += 2;
                        // Wenn der Typ explizit vom User auf "leer" gesetzt wurde wird nichts geprüft
                        // Wenn der Typ in der nicht gesetzt wurde aber die Länge wird die Länge geprüft
                        if ( soll !== 'all' && me.set.format === "" )
                            err=0;
                    }
                }
                return err;
            },
            barcode: function (success) {
                var me = this;
                fc.camera.captureBarcode(function (result) {
                    if (!result.cancelled) {
                        me.set.code = result.text+'';
                        me.set.format = result.format;
                        me.validateBarcode(success);
                    }
                }, function (error) {
                        if ( error !== 'cancel' && error.indexOf('progress') === -1 )
                            myApp.alert("Fehler beim Erfassen des Barcodes: " + error);
                }, me.codeformat);
            },
            // Listenhandler Barcode ändern
            setbarcode: function (idx) {
                var me = this;
                if ( idx == -1 )
                    idx = me.selectedSet;
                me.selectedSet = idx;
                me.cleanset();
                me.set.bereich = me.sets[me.selectedSet].bereich;
                me.set.name = me.sets[me.selectedSet].name;
                me.set.code = me.sets[me.selectedSet].code+'';
                me.set.format = me.sets[me.selectedSet].format;
                me.codeformat = me.sets[me.selectedSet].format;
                mainView.router.load({pageName: 'barcode'});
            },

            media: function (success) {
                var me = this;
                if ( this.nextmedia === 'audio')
                    me.takeaudio(success);
                else if ( this.nextmedia === 'video')
                    me.takevideo(success);
                else if ( this.nextmedia === 'file')
                    me.takefile(success);
                else
                    me.takefoto(success);
            },

            foto: function (success) {
                var me = this;
                me.takefoto(success);
            },
            takefoto: function (success) {
                var me = this;
                fc.camera.getPicture(function (result) {
                    me.set.fotos.push(result);
                    if (navigator.camera || me.set.fotos.length < 2)
                        me.takefoto(success);
                    else
                        success();
                }, function () {
                    success();
                },
                me.fotoconf,navigator.camera?Camera.PictureSourceType.CAMERA:0);
            },
            takevideo: function (success) {
                var me = this;
                fc.camera.captureVideo(function (result) {
                    me.set.videos.push(result);
                    success();
                }, function () {
                    success();
                },
                me.fotoconf);
            },
            takefile: function(success) {
                var me = this;
                if (this.isios) {
                    fc.camera.getPicture(function (result) {
                          me.set.files.push(result);
                          success();
                      }, function () {
                          success();
                      },
                      me.fotoconf, Camera.PictureSourceType.PHOTOLIBRARY);
                }
                else {
                    window.plugins.mfilechooser.open(['.jpg', '.JPG', '.jpeg', '.JPEG','.mp4'], function (uri) {
                        FileIO.fileSize(uri, function (file) {
                            var result = {
                                uri: uri,
                                title: uri.substr(uri.lastIndexOf('/') + 1),
                                size: file.size
                            };
                            me.set.files.push(result);
                            success();
                        });
                    }, function (msg) {
                        alert(msg);
                        success();
                    });
                }
            },

            takeaudio: function (success) {
                var me = this;
                fc.camera.captureAudio(function (result) {
                    me.set.audios.push(result);
                    success();
                }, function () {
                    success();
                });
            },

            usefotos: function () {
                var me = this;
                // Vorgang auch ohne Fotos anlegen (me.set.fotos.length)
                var s = JSON.parse(JSON.stringify(me.set));
                s.formdata = {name: s.name};
                me.sets.push(s);
                me.cleanset();
                if (me.hasform && me.showform) {
                    mainView.router.back({animatePages: false});
                    me.showForm(me.sets.length - 1);
                }
                else {
                    mainView.router.back();
                }
            },
            addfotos: function (idx) {
                var me = this;
                if ( idx >=0 )
                    me.selectedSet = idx;
                me.cleanset();
                me.takefoto(
                    function () {
                        if (me.set.fotos.length) {
                            me.sets[me.selectedSet].fotos.push.apply(me.sets[me.selectedSet].fotos, me.set.fotos);
                            Lockr.set('appg-sets', me.sets);
                        }
                        if (idx >= 0)
                            me.cleanset();
                        else {
                            me.cloneset();
                        }
                    }
                );
            },

            addfiles: function (idx) {
                var me = this;
                if ( idx >=0 )
                    me.selectedSet = idx;
                me.cleanset();
                me.takefile(
                    function () {
                        if (me.set.files.length) {
                            me.sets[me.selectedSet].files.push.apply(me.sets[me.selectedSet].files, me.set.files);
                            Lockr.set('appg-sets', me.sets);
                        }
                        if (idx >= 0)
                            me.cleanset();
                        else {
                            me.cloneset();
                        }
                    }
                );
            },

            addvideo: function(idx) {
                var me = this;
                if ( idx >=0 )
                    me.selectedSet = idx;
                me.cleanset();
                me.takevideo(
                    function () {
                        if (me.set.videos.length) {
                            me.sets[me.selectedSet].videos.push.apply(me.sets[me.selectedSet].videos, me.set.videos);
                            Lockr.set('appg-sets', me.sets);
                        }
                        if (idx >= 0)
                            me.cleanset();
                        else {
                            me.cloneset();
                        }
                    }
                );
            },

            addaudio: function(idx) {
                var me = this;
                if ( idx >=0 )
                    me.selectedSet = idx;
                me.cleanset();
                me.takeaudio(
                    function () {
                        if (me.set.audios.length) {
                            me.sets[me.selectedSet].audios.push.apply(me.sets[me.selectedSet].audios, me.set.audios);
                            Lockr.set('appg-sets', me.sets);
                        }
                        if (idx >= 0)
                            me.cleanset();
                        else {
                            me.cloneset();
                        }
                    }
                );
            },

            addmedia: function(idx) {
                var me = this;
                var buttons = [
                    {text: 'Foto',onClick: function () {me.addfotos(idx);}},
                    {text: 'Video',onClick: function () {me.addvideo(idx);}},
                    {text: 'Audio',onClick: function () {me.addaudio(idx);}},
                    {text: 'Datei',onClick: function () {me.addfiles(idx);}},
                    {text: 'Abbrechen',color: 'red'},
                ];
                myApp.actions(buttons);
            },

            removeset: function (idx) {
                var me = this;
                var back = false;
                if ( idx == -1 ) {
                    idx = me.selectedSet;
                    back = true;
                }
                myApp.confirm(
                    "Bitte bestätigen Sie das endgültige Löschen des Vorgangs.",
                    "Löschen?",
                    function () {
                        me.sets.splice(idx, 1);
                        if ( back ) {
                            mainView.router.back();
                        }
                    }, function () {
                    }
                );
            },
            removeFoto: function () {
                var me = this;
                myApp.confirm(
                    "Bitte bestätigen Sie das endgültige Löschen des Fotos.",
                    "Löschen?",
                    function () {
                        var idx = me.myPhotoBrowser.activeSlideIndex;
                        var foto = me.sets[me.selectedSet].fotos.splice(idx, 1);
                        FileIO.removeDeletedImage(foto[0].uri);
                        me.myPhotoBrowser.close();
                        Lockr.set('appg-sets', me.sets);
                    }, function () {
                    }
                );
            },
            removeMedia: function(type, idx ) {
                var me = this;
                var msg =  ( type !== 'file' )
                                ? "Bitte bestätigen Sie das endgültige Löschen."
                                : "Bitte bestätigen Sie das Löschen";
                myApp.confirm(msg,"Löschen?",
                    function () {
                        var media;
                        if ( type === 'foto' ) {
                            media = me.sets[me.selectedSet].fotos.splice(idx, 1);
                            me.set.fotos.splice(idx,1);
                        }
                        else if ( type === 'video' ) {
                            media = me.sets[me.selectedSet].videos.splice(idx,1);
                            me.set.videos.splice(idx,1);
                        }
                        else if ( type === 'audio' ) {
                            media = me.sets[me.selectedSet].audios.splice(idx, 1);
                            me.set.audios.splice(idx,1);
                        }
                        else if ( type === 'file' ) {
                            media = me.sets[me.selectedSet].files.splice(idx, 1);
                            me.set.files.splice(idx,1);
                        }
                        if ( type !== 'file' )
                            FileIO.removeDeletedImage(media[0].uri);
                        Lockr.set('appg-sets', me.sets);
                    }, function () {
                    }
                );
            },
            commentFoto: function () {
                var me = this;
                var sliderIndex = me.myPhotoBrowser.activeIndex;
                var foto = me.sets[me.selectedSet].fotos[sliderIndex];
                var popupHTML = '<div class="popup popup-comment">' +
                    '<div class="content-block-title">Bemerkung</div>' +
                    '<div class="list-block">' +
                    '<ul><li class="align-top">' +
                    '<div class="item-content">' +
                    '<div class="item-inner">' +
                    '<div class="item-input">' +
                    '<textarea>' + foto.bemerkung + '</textarea>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</li></ul>' +
                    '</div>' +
                    '<div class="content-block"><div class="row"><div class="col-25"></div><div class="col-50">' +
                    '<input type="submit" value="Weiter" class="button button-fill color-green close-popup"/>' +
                    '</div><div class="col-25"></div></div></div>' +
                    '</div>'
                myApp.popup(popupHTML)
                $$('.popup-comment').once('close', function () {
                    foto.bemerkung = $$('.popup-comment textarea').val();
                    Lockr.set('appg-sets', me.sets);
                    me.showFotos(me.selectedSet, sliderIndex);
                });
                me.myPhotoBrowser.close();
            },
            showFotos: function (idx, initialSlide) {
                initialSlide = initialSlide || 0;
                var me = this;
                var photos = [];
                if (!me.myPhotoBrowser) {
                    me.selectedSet = idx;
                    photos = me.sets[idx].fotos.map(function (f) {
                        return {url: f.uri, caption: f.bemerkung};
                    });
                    if ( photos.length ) {
                        me.myPhotoBrowser = myApp.photoBrowser({
                            photos: photos,
                            initialSlide: initialSlide,
                            ofText: 'von',
                            backLinkText: 'Schließen',
                            toolbarTemplate: '\
                        <div class="toolbar tabbar"> \
                            <div class="toolbar-inner">\
                                <a href="#" class="link photo-browser-prev">\
                                    <i class="icon icon-prev {{iconsColorClass}}"></i>\
                                </a>\
                                <a href="#" onClick="vm.removeFoto();return false;" class="link">\
                                    <i class="icon icon-bin-white"></i>\
                                </a>\
                                <a href="#" onClick="vm.commentFoto();return false;" class="link">\
                                    <i class="icon icon-file-text2-white"></i>\
                                </a>\
                                <a href="#" class="link photo-browser-next">\
                                    <i class="icon icon-next {{iconsColorClass}}"></i>\
                                </a>\
                            </div>\
                        </div>',
                            onClose: function () {
                                me.myPhotoBrowser = null;
                            }
                        });
                        me.myPhotoBrowser.open(0);
                    }
                }
            },
            openVorgang: function(idx) {
                var me = this;
                me.selectedSet = idx;
                me.cloneset();
                me.showMedia(idx);
            },
            // aus medienliste heraus öffnen
            openFotos: function(idx) {
                var me = this;
                me.showFotos(me.selectedSet);
            },
            openVideo: function(idx) {
                var me = this;
                var uri = me.sets[me.selectedSet].videos[idx].uri;
                if (navigator.camera)
                    cordova.plugins.disusered.open( uri );
                else
                    alert(uri);
            },
            openAudio: function(idx) {
                var me = this;
                var uri = me.sets[me.selectedSet].audios[idx].uri;
                if (navigator.camera)
                    cordova.plugins.disusered.open( uri );
                else
                    alert(uri);
            },
            showMedia: function(idx) {
                mainView.router.load({pageName: 'medien'});
            },
            submitlogin: function () {
                var me = this;
                var params = {
                    version: me.appversion,
                    name: window.cfg.device.model,
                    platform: window.cfg.device.platform,
                    uuid: window.cfg.device.uuid,
                    devversion: window.cfg.device.version,
                    login: me.login.login,
                    password: me.login.password,
                    remember: 1
                };
                myApp.showPreloader('Anmelden');
                $$.ajax({
                    url: me.baseuri + 'user/login?'+ _.now(),
                    method:'POST',
                    data: params,
                    success: function (data) {
                        data = JSON.parse(data);
                        if (!data.success) {
                            myApp.hidePreloader();
                            myApp.addNotification({'title': data.msg});
                        }
                        else {
                            me.login.password = '';
                            me.user = {name: data.name, token: data.token, role:data.role};
                            me.form = data.form;
                            me.bereiche = data.bereiche;
                            me.fotoconf = data.fotos;
                            Lockr.set('appg-bereiche', me.bereiche);
                            Lockr.set('appg-form', me.form);
                            Lockr.set('appg-user', me.user);
                            Lockr.set('appg-fotoconf', me.fotoconf);
                            mainView.router.back();
                            myApp.hidePreloader();
                            me.ensureValidBereich();
                        }
                    },
                    error: function() {
                        myApp.hidePreloader();
                        myApp.addNotification({'title': 'Beim Anmelden ist ein Fehler aufgetreten.'});
                    }
                });
            },
            syncUserInfo: function() {
                var me = this;
                if (me.loggedin) {
                    var params = {
                        version: me.appversion,
                        name: window.cfg.device.model,
                        platform: window.cfg.device.platform,
                        uuid: window.cfg.device.uuid,
                        devversion: window.cfg.device.version
                    };
                    myApp.showPreloader('Synchronisation');
                    $$.ajax({
                        url: me.baseuri + 'user/syncinfo?' + _.now(),
                        method: 'POST',
                        data: params,
                        success: function (data) {
                            data = JSON.parse(data);
                            if (!data.success) {
                                me.logout();
                                myApp.hidePreloader();
                                myApp.addNotification({'title': data.msg});
                            }
                            else {
                                me.form = data.form;
                                me.bereiche = data.bereiche;
                                me.fotoconf = data.fotos;
                                me.addAuftrag(data.auftrag);
                                Lockr.set('appg-bereiche', me.bereiche);
                                Lockr.set('appg-form', me.form);
                                Lockr.set('appg-fotoconf', me.fotoconf);
                                // Empfangsbestätigung zum Löschen vom Server
                                $$.ajax({url: me.baseuri + 'user/gotauftrag?' + _.now(),method: 'GET'});
                                myApp.hidePreloader();
                                me.ensureValidBereich();
                                me.checkVersion();
                            }
                        },
                        error: function () {
                            me.logout();
                            myApp.hidePreloader();
                            myApp.addNotification({'title': 'Beim Synchronisieren ist ein Fehler aufgetreten.'});
                        }
                    });
                }
            },
            addAuftrag: function(auftrags) {
                var me = this;
                auftrags.forEach(function(auftrag) {
                    var s = {
                        name: auftrag.name,
                        code: auftrag.barcode,
                        bereich: +auftrag.bereich + 1,
                        dateCreated: moment().format('YYYY-MM-DD HH:mm:ss'),
                        format: '',
                        fotos: [],
                        videos: [],
                        audios: [],
                        files:[],
                        formdata: {name:auftrag.name}
                    };
                    me.sets.push(s);
                });
            },
            checkVersion: function() {
                fc.updater.checkVersion( this.baseuri, this.appversion );
            },
            logout: function () {
                var me = this;
                me.user = {};
                Lockr.set('appg-user', me.user);
            },
            senden: function (idx) {
                var me = this;
                idx = ( idx === -1 )?me.selectedSet:-1;
                fc.file.init();
                me.numsent = 0;
                me.vorgangSenden(idx);
            },
            roadmap: function() {
                mainView.router.load({url:this.baseuri + 'app/roadmap/', ignoreCache:true});
            },
            einstellungen: function() {
                mainView.router.load({url:this.baseuri + 'app/settings/', ignoreCache:true});
            },
            appinfo: function() {
                mainView.router.load({url:this.baseuri + 'app/info/', ignoreCache:true});
            },
            applogs: function() {
                mainView.router.load({url:this.baseuri + 'app/logs/'+this.user.name, ignoreCache:true});
            },
            applogsfilter: function() {
                var f = "?filter=" + $$('#logsfilter').val();
                mainView.router.load({
                    url: this.baseuri + 'app/logs/' + this.user.name + f,
                    ignoreCache: true,
                    reload: true
                });
            },
            vorgangSenden: function (idx) {
                var me = this;
                var singleUpload = idx >=0;
                if ( ! singleUpload ) {
                    idx=0;
                    // ersten set mit fotos finden
                    while (idx < me.sets.length &&
                    (me.sets[idx].fotos.length + me.sets[idx].videos.length + me.sets[idx].audios.length
                                               + me.sets[idx].files.length) == 0
                        )
                        idx++;
                }
                else {
                    mainView.router.back({force: true, pageName: 'index'});
                }

                if ( idx < me.sets.length ) {
                    var set = me.sets[idx];
                    var bereich = me.bereiche.bereichshort[set.bereich];
                    var group = {
                        idx: 0,
                        name: set.name,
                        code: set.code+'',
                        format: set.format,
                        fotos: set.fotos,
                        videos: _.isUndefined(set.videos)?[]:set.videos,
                        audios: _.isUndefined(set.audios)?[]:set.audios,
                        files: _.isUndefined(set.files)?[]:set.files,
                        formdata: set.formdata,
                        bereich: bereich
                    };
                    fc.file.uploadGroup(group,
                        function () {
                            me.removeSended();
                            if (! singleUpload )
                                me.vorgangSenden(-1);
                            else
                                me.notifySended();
                        },
                        function (msg) {
                            myApp.alert(msg);
                        },
                        me.fotoconf
                    );
                }
                else {
                    me.notifySended();
                }
            },
            notifySended: function() {
                var me = this;
                var s = '<%= num %> Vorgänge wurden gesendet.'
                if ( me.numsent === 0)
                    s += '<br>Es werden nur Vorgänge mit mind. einem Medium gesendet!';
                var compiled = _.template(me.numsent === 1 ? '<%= num %> Vorgang wurde gesendet.' : s);
                myApp.addNotification({
                    title: 'Senden',
                    message: compiled({'num': me.numsent}),
                    hold: 0
                });
                me.checkVersion();
            },
            removeSended: function () {
                var me = this;
                var idx = me.sets.length;
                var medium;
                while (--idx >= 0) {
                    if (me.sets[idx].sended) {
                        me.numsent++;
                        while (me.sets[idx].fotos.length) {
                            medium = me.sets[idx].fotos.splice(me.sets[idx].fotos.length - 1, 1);
                            FileIO.removeDeletedImage(medium[0].uri);
                        }
                        while (me.sets[idx].videos.length) {
                            medium = me.sets[idx].videos.splice(me.sets[idx].videos.length - 1, 1);
                            FileIO.removeDeletedImage(medium[0].uri);
                        }
                        while (me.sets[idx].audios.length) {
                            medium = me.sets[idx].audios.splice(me.sets[idx].audios.length - 1, 1);
                            // Versuch NO_MODIFICATION_ALLOWED_ERR zu umgehen
                            setTimeout(function(){
                                FileIO.removeDeletedImage(medium[0].uri);
                            }, 200);
                        }
                        while (me.sets[idx].files.length) {
                            medium = me.sets[idx].files.splice(me.sets[idx].files.length - 1, 1);
                            if ( ! this.isandroid ) // wenn filechooser verwendet wird
                                FileIO.removeDeletedImage(medium[0].uri);
                        }
                        me.sets.splice(idx, 1);
                        me.lastsent = moment().format('DD.MM.YYYY HH:mm');
                        Lockr.set('appg-lastsent', me.lastsent);
                    }
                }
                //Lockr.set('appg-sets',me.sets);
            },
            showForm: function (idx) {
                var me = this;
                if ( idx == -1 )
                    idx = me.selectedSet;
                var b = me.sets[idx].bereich;
                var name = me.hasbereiche ? me.bereiche.bereich[b] : '';
                var form = '';
                var button = '';

                var navbar = '<div class="navbar"><div class="navbar-inner">' +
                    '<div class="left"><a href="#index" class="back link"> <i class="icon icon-back"></i><span>Zurück</span></a></div>' +
                    '<div class="center">' + name + '</div>' +
                    '<div class="right"> </div>' +
                    '</div></div>';

                if (me.hasbereiche) {
                    form = '<div class="content-block">' + me.form[b] + '</div>';
                    button = '<div class="content-block">' +
                        '<div class="row">' +
                        '<div class="col-25"></div>' +
                        '<div class="col-50">' +
                        '<input ' +
                        'onClick="vm.saveForm();"' +
                        'type="submit" value="Speichern" class="button button-big button-fill color-"'+this.colortheme+'/>' +
                        '</div>' +
                        '<div class="col-25"></div>' +
                        '</div></div>';
                }

                var newPageContent = '<div class="page navbar-fixed" data-page="bereichform">' +
                    navbar +
                    '<div class="page-content">' +
                    form + button +
                    '</div>' +
                    '</div>';

                me.selectedSet = idx;
                mainView.router.load({content: newPageContent, ignoreCache: true});
                var formData = me.sets[idx].formdata;
                myApp.formFromJSON('#bereichform', formData);
                myApp.initSmartSelects('#bereichform .smart-select');
            },
            saveForm: function () {
                var me = this;
                var idx = me.selectedSet;
                var formData = myApp.formToJSON('#bereichform');
                me.sets[idx].formdata = formData;
                Lockr.set('appg-sets', me.sets);
                mainView.router.back({force: true, pageName: 'index'});
            },
            // codeformat auf basis des gewählten bereichs einstellen
            updateQuickscanCodeformat: function() {
                var me= this;
                if ( me.bereiche && me.bereiche.bctyp && me.bereiche.bctyp.length && me.bereiche.bctyp[me.bereich].length ) {
                    me.codeformat = me.bereiche.bctyp[me.bereich];
                    this.updateFormCodeformat('bctyp');
                }
            },
            updateBarcodeCodeformat: function() {
                this.updateFormCodeformat('bctyp2');
            },
            updateFormCodeformat: function(id) {
                var me = this;
                $$("#"+id+" select").val(me.codeformat);
                $$("#"+id+" select").trigger('change');
                $$("#"+id+" div.item-after").html(me.codeformat==="all"?"":me.codeformat);
                myApp.initSmartSelects('#quickscan .smart-select');
            },
            neuerVorgangFoto: function() {
                this.nextmedia = 'foto';
                mainView.router.load({pageName: 'quickscan'});
            },
            neuerVorgangVideo: function() {
                this.nextmedia = 'video';
                mainView.router.load({pageName: 'quickscan'});
            },
            neuerVorgangAudio: function() {
                this.nextmedia = 'audio';
                mainView.router.load({pageName: 'quickscan'});
            },
            neuerVorgangFile: function() {
                this.nextmedia = 'file';
                mainView.router.load({pageName: 'quickscan'});
            },
            zeigeListe: function() {
                mainView.router.load({pageName: 'index'});
            },
            zeigeDashboard: function() {
                mainView.router.load({pageName: 'dash'});
            }
        }
    });

    vm.deviceReady();

    vm.$watch('sets', function (newVal, oldVal) {
        Lockr.set('appg-sets', newVal);
    });

    vm.$watch('bereich', function (newVal, oldVal) {
        Lockr.set('appg-bereich', newVal);
        this.updateQuickscanCodeformat();
    });

    vm.$watch('usecamera', function (newVal, oldVal) {
        Lockr.set('appg-usecamera', newVal ? 'true' : 'false');
    });

    vm.$watch('showform', function (newVal, oldVal) {
        Lockr.set('appg-showform', newVal ? 'true' : 'false');
    });

    vm.$watch('codeformat', function (newVal, oldVal) {
        Lockr.set('appg-codeformat', newVal);
    });

    vm.$watch('useserver', function (newVal, oldVal) {
        Lockr.set('appg-useserver', newVal);
        if ( newVal != oldVal )
            this.logout();
    });

    //$$('body').on('click', function (e) {});

    /*
     function updateIndicator() {
     if(navigator.onLine) {
     }
     }
     // Update the online status icon based on connectivity
     window.addEventListener('online',  updateIndicator);
     window.addEventListener('offline', updateIndicator);
     updateIndicator();
     */

};