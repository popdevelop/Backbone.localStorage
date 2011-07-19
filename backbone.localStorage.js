// A simple module to replace `Backbone.sync` with *localStorage*-based
// persistence. Models are given GUIDS, and saved into a JSON object. Simple
// as that.

// Adapted to use store.js

(function () {
  // Generate four random hex digits.
  function S4() {
    return (((1 + Math.random()) * 0x10000)|0).toString(16).substring(1);
  }

  // Generate a pseudo-GUID by concatenating random hexadecimal.
  function guid() {
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  }

  // Our Store is represented by a single JS object in *localStorage*. Create it
  // with a meaningful name, like the name you'd give a table.
  window.Store = function (name) {
    this.name = name;
    var stor = store.get(this.name);
    this.records = (stor && stor.split(",")) || [];
  };

  _.extend(Store.prototype, {

    // Save the current state of the **Store** to *localStorage*.
    save: function () {
      store.set(this.name, this.records.join(","));
    },

    // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
    // have an id of it's own.
    create: function (model) {
      if (!model.id) {
        model.id = model.attributes.id = guid();
      }
      store.set(this.name + "-" + model.id, model.toJSON());
      this.records.push(model.id.toString());
      this.save();
      return model;
    },

    // Update a model by replacing its copy in `this.data`.
    update: function (model) {
      store.set(this.name + "-" + model.id, model.toJSON());
      if (!_.include(this.records, model.id.toString())) {
        this.records.push(model.id.toString());
        this.save();
      }
      return model;
    },

    // Retrieve a model from `this.data` by id.
    find: function (model) {
      return store.get(this.name + "-" + model.id);
    },

    // Return the array of all models currently in storage.
    findAll: function () {
      return _.map(this.records, function (id) {
        return store.get(this.name + "-" + id);
      }, this);
    },

    // Delete a model from `this.data`, returning it.
    destroy: function (model) {
      store.remove(this.name + "-" + Model.id);
      this.records = _.reject(this.records, function (record_id) {
        return record_id === model.id.toString();
      });
      this.save();
      return model;
    }

  });

  // Provide a `Backbone.localSync` to use delegate to the model or collection's
  //  *localStorage* property, which should be an instance of `Store`.
  Backbone.localSync = function (method, model, options, error) {
    // Backwards compatibility with Backbone <= 0.3.3
    if (typeof options === 'function') {
      options = {
        success: options,
        error: error
      };
    }

    var resp;
    var stor = model.localStorage || model.collection.localStorage;
    switch (method) {
    case "read":
      resp = model.id ? stor.find(model) : stor.findAll();
      break;
    case "create":
      resp = stor.create(model);
      break;
    case "update":
      resp = stor.update(model);
      break;
    case "delete":
      resp = stor.destroy(model);
      break;
    }

    if (resp) {
      options.success(resp);
    } else {
      options.error("Record not found");
    }
  };
}());
