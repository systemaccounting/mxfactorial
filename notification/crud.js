var each = require('lodash/each');

module.exports = function crud(ref, username) {
  var notifyRef = ref.orderByChild('receiver_account').equalTo(username);

  function findAll() {
    return notifyRef.once('value');
  }

  function update(key, payload) {
    return ref.child(key).update(payload);
  }

  function updateSelected(keys, payload) {
    each(keys, function (key) {
      update(key, payload);
    });
  }

  function updateAll(payload) {
    return findAll().then(function (snapshot) {
      each(snapshot.val(), function (item, key) {
        update(key, payload);
      });
    });
  }

  return {
    findAll: findAll,
    updateAll: updateAll,
    updateSelected: updateSelected,
    update: update
  };
};
