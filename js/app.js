// Initialize your app
var myApp = new Framework7({
  swipePanel: 'left',
  template7Pages: false,
  material: true, //enable Material theme
  notificationCloseButtonText:'Schließen',
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


Vue.config.debug = ! navigator.camera;

Vue.filter('notEmpty', function (values) {
    return values ? values.filter( function(val){return val.length;} ):[];
})

// define
var VueHidden = Vue.extend({
  template: '<div>A custom component!</div>'
});

// register
Vue.component('vue-hidden', VueHidden);

var vm = new Vue({
  el: '#app',
  myPhotoBrowser: null,
  selectedSet: null,
  data: {
    bereich:-1,
    sets:[],
    set: {
        name: '',
        dateCreated: '',
        code: '',
        format:'',
        usecamera:true,
        fotos: []
    },
    login: {
        login:'',
        password:'',
    },
    user:{
        name:'',
        token:''
    },
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
        return this.sets.code.length==0;
    },
    validlogin:function() {
        return this.login.login.length && this.login.password.length;
    },
    loggedin: function() {
        return this.user.token && this.user.token.length > 0;
    },
    validquickscan:function() {
        return this.set.name.length && (this.set.code.length || this.set.usecamera );
    },
    hasbereiche:function(){
        return this.user.bereiche && this.user.bereiche.bereich[0].length;
    },
    bereichkurzname: function() {
        var me = this;
        return (me.bereich>=0 &&
                me.user.bereiche &&
                me.user.bereiche.bereich[me.bereich].length)?
                    me.user.bereiche.bereichshort[me.bereich]:'';
    }
  },
  created: function () {
      var me = this;
      me.sets = Lockr.get('sets',[]);
      me.user = Lockr.get('user',{});
      me.codeformat = Lockr.get('codeformat','');
      me.bereich = Lockr.get('bereich',-1);
      if ( me.bereich >=0 && ( ! me.hasbereiche || !me.user.bereiche.bereich[me.bereich].length ) )
          me.bereich=-1;
  },
  methods: {
      cleanset: function() {
          var me = this;
          me.set.fotos.length=0;
          me.set.name="";
          me.set.code="";
          me.set.format="";
          me.set.dateCreated='';
      },
      scanfoto: function(event) {
          var me = this;
          me.set.dateCreated = moment().format('YYYY-MM-DD HH:mm:ss');
          if (me.set.usecamera) {
              vm.barcode();
          }
          else {
              me.set.format = me.codeformat;
              vm.foto();
          }
      },
      barcode: function() {
        var me = this;
        fc.camera.captureBarcode( function(result){
            if ( ! result.cancelled ) {
                me.set.code = result.text;
                me.set.format = result.format;
                vm.foto();
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
            me.sets.push(s);
        }
        me.cleanset();
        mainView.router.load({pageName: 'index'});
      },
      removeset: function(idx) {
          var me = this;
          myApp.confirm(
              "Bitte bestätigen Sie das endgültige Löschen des Vorgangs.",
              "Löschen?",
              function(){
                //var i = me.sets.indexOf( me.sets[idx] );
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
                Lockr.set('sets',me.sets);
          }, function(){}
          );
      },
      showFotos: function(idx) {
          var me = this;
          var photos = [];
          this.selectedSet = idx;
          photos = me.sets[idx].fotos.map(function(f){ return f.uri;});
          this.myPhotoBrowser = myApp.photoBrowser({
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
            return 'http://www.app-geordnet.de/';
          else
            return 'http://localhost/app-geordnet/';
      },
      submitlogin: function() {
         var $$ = Dom7;
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
        $$.post(me.baseuri()+'user/login', params, function (data) {
            data = JSON.parse(data);
            if ( !data.success )
                myApp.addNotification( { 'title':data.msg } );
            else {
                me.login.password='';
                me.user = data;
                Lockr.set('user',me.user);
                mainView.router.load({pageName: 'index'});
            }
        });
      },
      logout: function() {
          var me = this;
          me.user={};
          Lockr.set('user',me.user);
      },
      senden: function() {
          var $$ = Dom7;
          var me = this;
          var done = [];

          fc.file.init();
          $$.each( me.sets, function( idx, set ) {
              var group = {
                  idx:idx,
                  name: me.bereichkurzname + set.name,
                  code: set.code,
                  format: set.format,
                  fotos: set.fotos
              };
              fc.file.uploadGroup( group,
                  function(){
                    me.removeSended();
                  },
                  function(msg){
                    myApp.alert( msg );
                  }
              );
          });
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
      },
      notyet: function() {
          myApp.alert("Diese Funktion ist noch nicht implementiert.",'appgeordnet');
      },
      showForm: function() {
        var me = this;
        var b = 0;
        var name = me.user.bereiche.bereich[b];

        var navbar = '<div class="navbar"><div class="navbar-inner">'+
                '<div class="left"><a href="#" class="back link"> <i class="icon icon-back"></i><span></span></a></div>'+
                '<div class="center">'+name+'</div>'+
                '<div class="right"> </div>'+
            '</div></div>';

        var form = '<div class="content-block">' + me.user.form[b] + '</div>';
        var newPageContent = '<div class="page" data-page="my-page">' +
                            navbar +
                        '<div class="page-content">' +
                            form +
                        '</div>' +
                      '</div>';

        //Load new content as new page
        mainView.router.loadContent(newPageContent);
      }
  }
});

vm.$watch('sets', function (newVal, oldVal) {
    Lockr.set('sets',newVal);
});

vm.$watch('bereich', function (newVal, oldVal) {
    Lockr.set('bereich',newVal);
});

vm.$watch('codeformat', function (newVal, oldVal) {
    Lockr.set('codeformat',newVal);
});


