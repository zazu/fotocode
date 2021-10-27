Lockr = {
   
    // me.user = Lockr.get('appg-user', {});
    get: function(key, defvalue) {


    },

    // Lockr.set('appg-set', me.set);
    set: function(key, value){
        localforage.setItem(key, value);
    }


}





