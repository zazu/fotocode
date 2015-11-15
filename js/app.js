// Initialize your app
var myApp = new Framework7({
  swipePanel: 'left',
  material: true //enable Material theme
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
        code: '',
        usecamera:true,
        fotos: []
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
    }
  },
  created: function () {
    this.sets = Lockr.get('sets',[]);
  },
  methods: {
      cleanset: function() {
          this.set.fotos.length=0;
          this.set.name="";
          this.set.code="";
      },
      scanfoto: function(event) {
          if (this.set.usecamera) {
              vm.barcode();
          }
          else {
              vm.foto();
          }
      },
      barcode: function() {
        var me = this;
        console.log('barcode');
        fc.camera.captureBarcode( function(result){
            console.log(result);
            if ( ! result.cancelled ) {
                me.set.code = result.text;
                vm.foto();
            }
        }, function(){
          alert("error getting barcode");
        });

      },
      foto: function() {
          var me = this;
          console.log('foto');
          fc.camera.getPicture(function(result){
            console.log(result);
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
      notyet: function() {
          myApp.alert("Diese Funktion ist noch nicht implementiert.",'appgeordnet');
      }
  }
});

vm.$watch('sets', function (newVal, oldVal) {
    Lockr.set('sets',newVal);
});


