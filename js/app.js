// Initialize your app
var myApp = new Framework7({
  swipePanel: 'left',
  template7Pages: false,
  material: true, //enable Material theme
  notificationCloseButtonText:'Schließen',
  smartSelectPickerCloseText:'Fertig',
  notificationHold: 2500,
  modalTitle: 'appgeordnet',
  modalButtonCancel:'Abbrechen'
});

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    domCache: true
});


// Callbacks to run specific code for specific pages, for example for About page:
myApp.onPageInit('quickscan', function (page) {
    vm.cleanset();
});

Dom7.isEmpty = function(obj) {
    return Object.keys(obj).length === 0;
}

Vue.config.debug = ! navigator.camera;

Vue.filter('notEmpty', function (values) {
    return values ? values.filter( function(val){return val.length;} ):[];
})

var vm = new Vue({
  el: '#app',
  myPhotoBrowser: null,
  selectedSet: null,
  data: {
    bereich:0,
    usecamera:true,
    showform:true,
    sets:[],
    set: {
        name: '',
        dateCreated: '',
        code: '',
        format:'',
        fotos: [],
        formdata: [],
        bereich:0
    },
    login: { login:'', password:'' },
    user:  { name:'', token:'' },
    form:[],
    bereiche:{},
    codeformat:'',
    codeformats: [
        'EAN_13','EAN_8','UPC_A','UPC_E','ITF','CODE_128','CODE_39','CODE_93',
        'CODABAR','QR_CODE','DATA_MATRIX','PDF417'
    ]
  },
  computed: {
    numsets: function() {
        return this.sets.length;
    },
    numfotos: function() {
        var num = 0;
        for (var i=0; i<this.sets.length; i++) {
            num = num + this.sets[i].fotos.length;
        }
        return num;
    },
    numcodes: function() {
        var num = 0;
        for (var i=0; i<this.sets.length; i++) {
            num = num + (this.sets[i].code.length?1:0);
        }
        return num;
    },
    emptycode: function () {
        return this.set.code.length==0;
    },
    validlogin:function() {
        return this.login.login.length && this.login.password.length;
    },
    loggedin: function() {
        return this.user.token && this.user.token.length > 0;
    },
    validquickscan:function() {
        return this.set.name.length && (this.set.code.length || this.usecamera );
    },
    hasbereiche:function(){
        return !$$.isEmpty(this.user) && this.form && this.form.length > 1;
    },
    bereichkurzname: function() {
        var me = this;
        return (me.bereich>=0 &&
                !$$.isEmpty(me.user) &&
                me.bereiche &&
                me.bereiche.bereich[me.bereich].length
               )?me.bereiche.bereichshort[me.bereich]
                    :'';
    },
    hasform: function() {
        var me = this;
        return me.bereich > 0 && me.bereiche.bereich[me.bereich].length>3;
    }
  },
  created: function () {
      var me = this;
      me.sets = Lockr.get('appg-sets',[]);
      me.user = Lockr.get('appg-user',{});
      me.form = Lockr.get('appg-form',[]);
      me.bereiche = Lockr.get('appg-bereiche',{});
      me.codeformat = Lockr.get('appg-codeformat','');
      me.bereich = Lockr.get('appg-bereich',0);
      me.usecamera = (Lockr.get('appg-usecamera','true') !== 'false');
      me.showform = (Lockr.get('appg-showform','true') !== 'false');
      if ( me.bereich >0 && me.bereich < 0 && ( ! me.hasbereiche ||
                              $$.isEmpty(me.user) ||
                              !me.bereiche.bereich[me.bereich] ||
                              !me.bereiche.bereich[me.bereich].length ) )
          me.bereich=0;
  },
  methods: {
      cleanset: function() {
          var me = this;
          me.set.fotos=[];
          me.set.name="";
          me.set.code="";
          me.set.format="";
          me.set.bereich=0;
          me.set.dateCreated='';
          me.set.formdata=[];
      },
      scanfoto: function(event) {
          var me = this;
          me.set.dateCreated = moment().format('YYYY-MM-DD HH:mm:ss');
          me.set.bereich = me.bereich;
          Lockr.set('appg-set',me.set);
          if (me.usecamera) {
              vm.barcode();
          }
          else {
              me.set.format = me.codeformat;
              me.validateBarcode();
          }
      },
      validateBarcode:function() {
          var me = this;
          var msg = [];
          var compiled;
          var err = me.checkBarcode();
          if ( err & 1 ) {
              compiled = _.template('Die Barcodelänge (<%= ist %>) stimmt nicht mit der Vorgabe (<%= soll %>) überein!');
              msg.push( compiled({ 'ist': me.set.code.length, 'soll': me.bereiche.bclen[me.set.bereich] }));
          }
          if ( err & 2 ) {
              compiled = _.template('Der Barcodetyp (<%= ist %>) stimmt nicht mit der Vorgabe (<%= soll %>) überein!');
              msg.push( compiled({ 'ist': me.set.format, 'soll': me.bereiche.bctyp[me.set.bereich] }));
          }
          if ( err > 0 ) {
              msg.push('');
              msg.push('Sollen die Vorgaben ignoriert werden?');
              myApp.confirm( msg.join('<br>'), function () {
                vm.foto();
              });
          }
          else
            vm.foto();
          return err===0;
      },
      checkBarcode:function() {
          var err = 0;
          var me = this;
          var bereich = me.set.bereich;
          me.set.code = _.trim( me.set.code );
          if ( bereich >= 0 && me.bereiche.bclen[bereich].length ) {
              var soll = _.parseInt(me.bereiche.bclen[bereich]);
              if ( soll > 0 && soll != me.set.code.length )
                  err+=1;
              soll = me.bereiche.bctyp[bereich];
              if ( soll != 'all' && soll != me.set.format)
                  err+=2;
          }
          return err;
      },
      barcode: function() {
        var me = this;
        fc.camera.captureBarcode( function(result){
            if ( ! result.cancelled ) {
                me.set.code = result.text;
                me.set.format = result.format;
                me.validateBarcode();
            }
        }, function(){
          myApp.alert("Fehler beim Erfassen des Barcodes");
        });

      },
      foto: function() {
          var me = this;
          fc.camera.getPicture(function(result){
            me.set.fotos.push(result);
            if ( navigator.camera || me.set.fotos.length < 2)
                me.foto();
            else
                me.usefotos();
          }, function(){
              me.usefotos();
          });
      },
      usefotos: function() {
          var me=this;
          if ( me.set.fotos.length ) {
            var s = JSON.parse(JSON.stringify(me.set));
            s.formdata = {name:s.name};
            me.sets.push(s);
          }
          me.cleanset();
          if ( me.hasform && me.showform ) {
              mainView.router.back({animatePages:false});
              me.showForm(me.sets.length-1);
              //setTimeout(function() { me.showForm(me.sets.length-1); }, 50);
          }
          else
              mainView.router.back();
      },
      removeset: function(idx) {
          var me = this;
          myApp.confirm(
              "Bitte bestätigen Sie das endgültige Löschen des Vorgangs.",
              "Löschen?",
              function(){
                me.sets.splice(idx, 1);
          }, function(){}
          );
      },
      removeFoto: function() {
          var me = this;
          myApp.confirm(
              "Bitte bestätigen Sie das endgültige Löschen des Fotos.",
              "Löschen?",
              function(){
                var idx = me.myPhotoBrowser.activeSlideIndex;
                var foto = me.sets[me.selectedSet].fotos.splice(idx, 1);
                FileIO.removeDeletedImage( foto[0].uri );
                me.myPhotoBrowser.close();
                Lockr.set('appg-sets',me.sets);
          }, function(){}
          );
      },
      showFotos: function(idx) {
          var me = this;
          var photos = [];
          me.selectedSet = idx;
          photos = me.sets[idx].fotos.map(function(f){ return f.uri;});
          me.myPhotoBrowser = myApp.photoBrowser({
                photos : photos,
                ofText : 'von',
                toolbarTemplate: '\
                <div class="toolbar tabbar"> \
                    <div class="toolbar-inner">\
                        <a href="#" class="link photo-browser-prev">\
                            <i class="icon icon-prev {{iconsColorClass}}"></i>\
                        </a>\
                        <a href="#" onClick="vm.removeFoto();return false;" class="link">\
                            <i class="icon">Löschen</i>\
                        </a>\
                        <a href="#" class="link photo-browser-next">\
                            <i class="icon icon-next {{iconsColorClass}}"></i>\
                        </a>\
                    </div>\
                </div>'
          });
          this.myPhotoBrowser.open(0);
      },
      baseuri: function() {
          var url = window.location.href;
          if ( url.indexOf('www') > 0 )
            return 'http://test.app-geordnet.de/';
          else
            return 'http://localhost/app-geordnet/';
      },
      submitlogin: function() {
          var me = this;
          var params = {
                version: '2.0.0',
                name:'',
                platform:'',
                uuid: '',
                devversion:'',
                login: me.login.login,
                password: me.login.password,
                remember:1
            };
            myApp.showPreloader('Anmelden');
            $$.post(me.baseuri()+'user/login', params, function (data) {
                data = JSON.parse(data);
                if ( !data.success )
                    myApp.addNotification( { 'title':data.msg } );
                else {
                    me.login.password='';
                    me.user = { name: data.name, token: data.token };
                    me.form = data.form;
                    me.bereiche = data.bereiche;
                    Lockr.set('appg-bereiche',me.bereiche);
                    Lockr.set('appg-form',me.form);
                    Lockr.set('appg-user',me.user);
                    //mainView.router.load({pageName: 'index'});
                    mainView.router.back();
                    myApp.hidePreloader();
                }
            });
      },
      logout: function() {
          var me = this;
          me.user={};
          Lockr.set('appg-user',me.user);
      },
      senden: function() {
          var me = this;
          fc.file.init();
          me.vorgangSenden();
      },
      vorgangSenden: function() {
          var me = this;
          if ( me.sets.length ) {
              var set = me.sets[0];
              var bereich = me.bereiche.bereichshort[set.bereich];
              var group = {
                  idx:0,
                  name: set.name,
                  code: set.code,
                  format: set.format,
                  fotos: set.fotos,
                  formdata: set.formdata,
                  bereich: bereich
              };
              fc.file.uploadGroup( group,
                  function(){
                    me.removeSended();
                    me.vorgangSenden();
                  },
                  function(msg){
                    myApp.alert( msg );
                  }
              );
          }
      },
      removeSended: function() {
          var me=this;
          var idx=me.sets.length;
          while (--idx >= 0) {
              if ( me.sets[idx].sended ) {
                  while ( me.sets[idx].fotos.length ) {
                    var foto = me.sets[idx].fotos.splice(me.sets[idx].fotos.length-1, 1);
                    FileIO.removeDeletedImage( foto[0].uri );
                  }
                  me.sets.splice(idx, 1);
              }
          }
          //Lockr.set('appg-sets',me.sets);
      },
      notyet: function() {
          myApp.alert("Diese Funktion ist noch nicht implementiert.",'appgeordnet');
      },
      showForm: function(idx) {
        var me = this;
        var b = me.sets[idx].bereich;
        var name = me.bereiche.bereich[b];

        var navbar = '<div class="navbar"><div class="navbar-inner">'+
                '<div class="left"><a href="#index" class="back link"> <i class="icon icon-back"></i><span></span></a></div>'+
                '<div class="center">'+name+'</div>'+
                '<div class="right"> </div>'+
            '</div></div>';

        var form = '<div class="content-block">' + me.form[b] + '</div>';
        var button = '<div class="content-block">'+
                '<div class="row">'+
                  '<div class="col-25"></div>'+
                  '<div class="col-50">'+
                    '<input '+
                        'onClick="vm.saveForm();"'+
                           'type="submit" value="Speichern" class="button button-big button-fill color-green"/>'+
                  '</div>'+
                  '<div class="col-25"></div>'+
                '</div></div>';

        var newPageContent = '<div class="page" data-page="bereichform">' +
                            navbar +
                        '<div class="page-content">' +
                            form + button +
                        '</div>' +
                      '</div>';

        me.selectedSet = idx;
        mainView.router.load({ content: newPageContent, ignoreCache:true });
        var formData = me.sets[idx].formdata;
        myApp.formFromJSON('#bereichform', formData)
      },
      saveForm: function() {
          var me = this;
          var idx = me.selectedSet;
          var formData = myApp.formToJSON('#bereichform');
          me.sets[idx].formdata = formData;
          Lockr.set('appg-sets',me.sets);
          mainView.router.back( {force:true, pageName:'index'} );
      }
  }
});

vm.$watch('sets', function (newVal, oldVal) {
    Lockr.set('appg-sets',newVal);
});

vm.$watch('bereich', function (newVal, oldVal) {
    Lockr.set('appg-bereich',newVal);
});

vm.$watch('usecamera', function (newVal, oldVal) {
    Lockr.set('appg-usecamera',newVal?'true':'false');
});

vm.$watch('showform', function (newVal, oldVal) {
    Lockr.set('appg-showform',newVal?'true':'false');
});

vm.$watch('codeformat', function (newVal, oldVal) {
    Lockr.set('appg-codeformat',newVal);
});


