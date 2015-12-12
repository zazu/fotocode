// Initialize your app
var myApp = new Framework7({
  swipePanel: 'left',
  template7Pages: false,
  material: true, //enable Material theme
  notificationCloseButtonText:'Schließen',
  notificationHold: 2500
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

var vm = new Vue({
  el: '#app',
  myPhotoBrowser: null,
  selectedSet: null,
  data: {
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
    }
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
    }
  },
  created: function () {
    this.sets = Lockr.get('sets',[]);
    this.user = Lockr.get('user',{});
  },
  methods: {
      cleanset: function() {
          this.set.fotos.length=0;
          this.set.name="";
          this.set.code="";
          this.set.format="";
          this.set.dateCreated='';
      },
      scanfoto: function(event) {
          var me = this;
          me.set.dateCreated = moment().format('YYYY-MM-DD HH:mm:ss');
          if (me.set.usecamera) {
              vm.barcode();
          }
          else {
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
                me.sets[me.selectedSet].fotos.splice(idx, 1);
                me.myPhotoBrowser.close();
                //this.showFotos(this.selectedSet);
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

          $$.each( me.sets, function( idx, set ) {
              var group = {
                  idx:idx,
                  name: set.name,
                  code: set.code,
                  format: set.format,
                  fotos: set.fotos
              };
              fc.file.uploadGroup( group,
                  function(){
                    console.log('success');
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
                  me.sets.splice(idx, 1);
                  //@todo fotos löschen
              }
          }
      },

      notyet: function() {
          myApp.alert("Diese Funktion ist noch nicht implementiert.",'appgeordnet');
      }
  }
});

vm.$watch('sets', function (newVal, oldVal) {
    Lockr.set('sets',newVal);
});


