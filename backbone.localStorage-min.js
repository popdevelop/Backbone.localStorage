(function(){function b(){return(((1+Math.random())*65536)|0).toString(16).substring(1)}function a(){return(b()+b()+"-"+b()+"-"+b()+"-"+b()+"-"+b()+b()+b())}window.Store=function(d){this.name=d;var c=store.get(this.name);this.records=(c&&c.split(","))||[]};_.extend(Store.prototype,{save:function(){store.set(this.name,this.records.join(","))},create:function(c){if(!c.id){c.id=c.attributes.id=a()}store.set(this.name+"-"+c.id,c.toJSON());this.records.push(c.id.toString());this.save();return c},update:function(c){store.set(this.name+"-"+c.id,c.toJSON());if(!_.include(this.records,c.id.toString())){this.records.push(c.id.toString());this.save()}return c},find:function(c){return store.get(this.name+"-"+c.id)},findAll:function(){return _.map(this.records,function(c){return store.get(this.name+"-"+c)},this)},destroy:function(c){store.remove(this.name+"-"+Model.id);this.records=_.reject(this.records,function(d){return d===c.id.toString()});this.save();return c}});Backbone.localSync=function(h,f,e,d){if(typeof e==="function"){e={success:e,error:d}}var g;var c=f.localStorage||f.collection.localStorage;switch(h){case"read":g=f.id?c.find(f):c.findAll();break;case"create":g=c.create(f);break;case"update":g=c.update(f);break;case"delete":g=c.destroy(f);break}if(g){e.success(g)}else{e.error("Record not found")}}}());