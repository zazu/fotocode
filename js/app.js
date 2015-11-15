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
    numsets: function () {
        return this.sets.length;
    },
    emptycode: function () {
        return this.sets.code.length==0;
    }
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
      }
  }
})


