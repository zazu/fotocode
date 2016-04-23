
window.onload = function () {
    window.cfg = {
        version: '2.0.90',
        baseuri: (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) ?
            'http://test.app-geordnet.de/' :
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
        if (device.platform === "Android") {
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
        window.open = cordova.InAppBrowser.open;
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

    // Initialize the app
    window.myApp = new Framework7({
        swipePanel: 'right',
        //  pushState:true,
        template7Pages: false,
        material: true, //enable Material theme
        notificationCloseButtonText: 'Schließen',
        smartSelectPickerCloseText: 'Fertig',
        notificationHold: 5000,
        modalTitle: 'appgeordnet',
        modalButtonCancel: 'Abbrechen'
    });

    // Add view
    window.mainView = myApp.addView('.view-main', {
        domCache: true
    });

    //myApp.params.swipePanel = false;

    $$(document).on('pageInit', function (e) {
        var page = e.detail.page;

        if ( page.name !== 'index')
            myApp.params.swipePanel = false;
        else
            myApp.params.swipePanel = 'right';

        if ( page.name === 'quickscan') {
            vm.cleanset();
            vm.updateQuickscanCodeformat();
        }
        if ( page.name === 'barcode') {
            vm.updateBarcodeCodeformat();
        }
    });

    $$(document).on('pageReinit', function (e) {
        var page = e.detail.page;
        if ( page.name === 'quickscan') {
            if (page.fromPage.name === 'index') {
                vm.cleanset();
                vm.updateQuickscanCodeformat();
                myApp.params.swipePanel = false;
            }
        }
        else if ( page.name === 'index') {
            myApp.params.swipePanel = 'right';
        }
        else if ( page.name === 'medien') {
            if (page.fromPage.name === 'barcode') {
                vm.set =  _.cloneDeep(vm.sets[vm.selectedSet]);
                vm.codeformat = vm.sets[vm.selectedSet].format;
            }
        }
        else if ( page.name === 'barcode') {
            vm.updateBarcodeCodeformat();
        }
        else {
            myApp.params.swipePanel = false;
        }
    });

    Vue.config.debug = !navigator.camera;

    Vue.filter('notEmpty', function (values) {
        return values ? values.filter(function (val) {
            return val.length;
        }) : [];
    });

    Vue.filter('b2MB', function (value) {
        return (value / 1024 / 1024).toFixed(2);
    })

    window.vm = new Vue({
        el: '#app',
        myPhotoBrowser: null,
        selectedSet: null,
        numsent: 0,
        nextmedia:'foto',
        data: {
            appversion: window.cfg.version,
            baseuri: window.cfg.baseuri,
            lastsent: '',
            bereich: 0,
            usecamera: true,
            showform: true,
            sets: [],
            set: {
                name: '',
                dateCreated: '',
                code: '',
                format: '',
                fotos: [],
                formdata: [],
                bereich: 0,
                videos: [],
                audios: []
            },
            login: {login: '', password: ''},
            user: {name: '', token: ''},
            form: [],
            bereiche: {},
            codeformat: '',
            codeformats: [
                'EAN_13', 'EAN_8', 'UPC_A', 'UPC_E', 'ITF', 'CODE_128', 'CODE_39', 'CODE_93',
                'CODABAR', 'QR_CODE', 'DATA_MATRIX', 'PDF417'
            ]
        },
        computed: {
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
            nummedia: function() {
                return this.numfotos + this.numvideos + this.numaudios;
            },
            numcodes: function () {
                var num = 0;
                for (var i = 0; i < this.sets.length; i++) {
                    num = num + (this.sets[i].code.length ? 1 : 0);
                }
                return num;
            },
            emptycode: function () {
                return this.set.code.length == 0;
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
                return this.set.code.length || this.usecamera;
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

            hasform: function () {
                var me = this;
                return me.bereich > 0 && me.bereiche.hasform[me.bereich] > 0;
            }
        },
        created: function () {
            var me = this;
            me.sets = Lockr.get('appg-sets', []);
            me.user = Lockr.get('appg-user', {});
            me.form = Lockr.get('appg-form', []);
            me.bereiche = Lockr.get('appg-bereiche', {});
            me.codeformat = Lockr.get('appg-codeformat', '');
            me.bereich = Lockr.get('appg-bereich', 0);
            me.usecamera = (Lockr.get('appg-usecamera', 'true') !== 'false');
            me.showform = (Lockr.get('appg-showform', 'true') !== 'false');
            me.lastsent = Lockr.get('appg-lastsent', 'Es wurden keine Daten gesendet.');
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
                else if (mainView.activePage.name !== "index")
                    mainView.router.back();
                else if ( $$('.actions-modal.modal-in').length === 0 )
                    me.menuButton();
            },
            cleanset: function () {
                var me = this;
                me.set.fotos = [];
                me.set.name = "";
                me.set.code = "";
                me.set.format = "";
                me.set.bereich = 0;
                me.set.dateCreated = '';
                me.set.formdata = [];
                me.set.videos = [];
                me.set.audios=[];
            },
            // Weiter Button im Quickscan-Formular
            scanfoto: function (event) {
                var me = this;
                me.set.dateCreated = moment().format('YYYY-MM-DD HH:mm:ss');
                me.set.bereich = me.bereich;
                Lockr.set('appg-set', me.set);
                if (me.usecamera) {
                    vm.barcode(function () {
                        vm.media(vm.usefotos);
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
                        me.sets[me.selectedSet].code = me.set.code;
                        me.sets[me.selectedSet].format = me.set.format;
                        me.sets[me.selectedSet].name = me.set.name;
                        Lockr.set('appg-sets', me.sets);
                        mainView.router.back();
                    });
                }
                else {
                    me.set.format = me.codeformat;
                    me.validateBarcode(function () {
                        me.sets[me.selectedSet].code = me.set.code;
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
                    msg.push(compiled({'ist': me.set.code.length, 'soll': me.bereiche.bclen[me.set.bereich]}));
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
                        if (soll > 0 && soll != me.set.code.length)
                            err += 1;
                    }
                    if (me.bereiche.bctyp[bereich].length) {
                        soll = me.bereiche.bctyp[bereich];
                        if (soll != 'all' && soll != me.set.format)
                            err += 2;
                        // Wenn der Typ explizit vom User auf "leer" gesetzt wurde wir nichts geprüft
                        // Wenn der Typ in der nicht gesetzt wurde aber die Länge wird die Lände geprüft
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
                        me.set.code = result.text;
                        me.set.format = result.format;
                        me.validateBarcode(success);
                    }
                }, function () {
                    myApp.alert("Fehler beim Erfassen des Barcodes");
                });
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
                me.set.code = me.sets[me.selectedSet].code;
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
                });
            },

            takevideo: function (success) {
                var me = this;
                fc.camera.captureVideo(function (result) {
                    me.set.videos.push(result);
                    success();
                }, function () {
                    success();
                });
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
                else
                    mainView.router.back();
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
                        if ( idx >=0 )
                            me.cleanset();
                        else {
                            me.set = _.cloneDeep(me.sets[me.selectedSet]);
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
                    function(){
                        if (me.set.videos.length) {
                            me.sets[me.selectedSet].videos.push.apply(me.sets[me.selectedSet].videos, me.set.videos);
                            Lockr.set('appg-sets', me.sets);
                        }
                        if ( idx >=0 )
                            me.cleanset();
                        else {
                            me.set = _.cloneDeep(me.sets[me.selectedSet]);
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
                    function(){
                        if (me.set.audios.length) {
                            me.sets[me.selectedSet].audios.push.apply(me.sets[me.selectedSet].audios, me.set.audios);
                            Lockr.set('appg-sets', me.sets);
                        }
                        if ( idx >=0 )
                            me.cleanset();
                        else {
                            me.set = _.cloneDeep(me.sets[me.selectedSet]);
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
                        if ( back )
                            mainView.router.back();
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
                myApp.confirm(
                    "Bitte bestätigen Sie das endgültige Löschen.",
                    "Löschen?",
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
                me.set =  _.cloneDeep(me.sets[me.selectedSet]);
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
                            me.user = {name: data.name, token: data.token};
                            me.form = data.form;
                            me.bereiche = data.bereiche;
                            Lockr.set('appg-bereiche', me.bereiche);
                            Lockr.set('appg-form', me.form);
                            Lockr.set('appg-user', me.user);
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
                                myApp.hidePreloader();
                                myApp.addNotification({'title': data.msg});
                            }
                            else {
                                me.form = data.form;
                                me.bereiche = data.bereiche;
                                me.addAuftrag(data.auftrag);
                                Lockr.set('appg-bereiche', me.bereiche);
                                Lockr.set('appg-form', me.form);
                                // Empfangsbestätigung zum Löschen vom Server
                                $$.ajax({url: me.baseuri + 'user/gotauftrag?' + _.now(),method: 'GET'});
                                myApp.hidePreloader();
                                me.ensureValidBereich();
                            }
                        },
                        error: function () {
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
                        formdata: {name:auftrag.name}
                    };
                    me.sets.push(s);
                });
            },
            checkVersion: function() {
                fc.updater.checkVersion( this.baseuri + 'app/version?'+_.now(), this.appversion );
            },
            logout: function () {
                var me = this;
                me.user = {};
                Lockr.set('appg-user', me.user);
            },
            senden: function () {
                var me = this;
                fc.file.init();
                me.numsent = 0;
                me.vorgangSenden();
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
                mainView.router.load({url:this.baseuri + 'app/logs/'+this.user.name + f, ignoreCache:true, reload:true});
            },
            vorgangSenden: function () {
                var me = this;
                var idx=0;
                // ersten set mit fotos finden
                while ( idx < me.sets.length &&
                       (me.sets[idx].fotos.length + me.sets[idx].videos.length +me.sets[idx].audios.length)==0
                    )
                    idx++;
                if ( idx < me.sets.length ) {
                    var set = me.sets[idx];
                    var bereich = me.bereiche.bereichshort[set.bereich];
                    var group = {
                        idx: 0,
                        name: set.name,
                        code: set.code,
                        format: set.format,
                        fotos: set.fotos,
                        videos: _.isUndefined(set.videos)?[]:set.videos,
                        audios: _.isUndefined(set.audios)?[]:set.audios,
                        formdata: set.formdata,
                        bereich: bereich
                    };
                    fc.file.uploadGroup(group,
                        function () {
                            me.removeSended();
                            me.vorgangSenden();
                        },
                        function (msg) {
                            myApp.alert(msg);
                        }
                    );
                }
                else {
                    var s = '<%= num %> Vorgänge wurden gesendet.'
                    if ( me.numsent === 0)
                        s += '<br>Es werden nur Vorgänge mit mind. einem Medium gesendet!';
                    var compiled = _.template(me.numsent === 1 ? '<%= num %> Vorgang wurde gesendet.' : s);
                    myApp.addNotification({
                        title: 'Senden',
                        message: compiled({'num': me.numsent}),
                        hold: 0
                    });
                }
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
                    '<div class="left"><a href="#index" class="back link"> <i class="icon icon-back"></i><span></span></a></div>' +
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
                        'type="submit" value="Speichern" class="button button-big button-fill color-green"/>' +
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
                if ( me.bereiche.bctyp[me.bereich].length ) {
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