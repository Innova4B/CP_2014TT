angular.module('starter.services', ['starter.config' ,'starter.filesConfig'])

.factory('DB', function($q, DB_CONFIG) {
    var self = this;
    self.db = null;
 
    self.init = function() {
      if (self.db == null){
        if(window.cordova) {
          self.db = window.sqlitePlugin.openDatabase({name: DB_CONFIG.name});
        } else {
          self.db = window.openDatabase(DB_CONFIG.name, '1.0', 'database', -1);
        }

        angular.forEach(DB_CONFIG.tables, function(table) {
          var columns = [];
          angular.forEach(table.columns, function(column) {
            //PARA INSERTAR FK
            if(column.type.indexOf("FOREIGN") > -1){
              columns.push(column.type);
            }else{
                columns.push(column.name + ' ' + column.type);
              }
          });
          var query = 'CREATE TABLE IF NOT EXISTS ' + table.name + ' (' + columns.join(',') + ')';
          self.query(query);
          console.log('Table ' + table.name + ' initialized');

        });
      }

    };


    //Realizar los inserts en la BBDD 
  self.insert = function(query) {
    self.db.transaction(function(transaction) {
            transaction.executeSql(query,
              [ ],
              function (transaction, resultSet) {
                if (!resultSet.rowsAffected) {
                    console.log('No rows affected');
                    return false;
                }
              },
              function(transaction, error) {
                 console.log("No se ha podido realizar la insercion: "+query);
                 console.log("Codigo de error: "+error.code);
              }
            );
        });
  };


  //Realizar deletes
  self.delet = function(query){
    self.db.transaction(function(transaction) {
            transaction.executeSql(query,
              [ ],
              function(){ console.log("exito al borrar")} ,
              function(transaction, error) {
                 console.log("No se ha podido realizar el borrado: "+query);
              }
            );
        });
  };

    self.selectQuery = function(query) {
      return $q(function(resolve, reject) {
        if (self.db == null){
          self.init();
        }
        var config = [];
        self.db.transaction(function(transaction) {
            transaction.executeSql(query, 
              [],
              function(transaction, result) {
                if (result != null && result.rows != null) { 
                  for (var i = 0; i < result.rows.length; i++) { 
                    var row = result.rows.item(i);
                    config.push(row);
                  } 
                }
                resolve(config);
            }, function(transaction, error) {
                console.log("Codigo de error: "+error.code);
                resolve(config);
            });
        });
      })
    };

    self.query = function(query, bindings) {
        bindings = typeof bindings !== 'undefined' ? bindings : [];
        var deferred = $q.defer();
        self.db.transaction(function(transaction) {
            transaction.executeSql(query, bindings, function(transaction, result) {
                deferred.resolve(result);
            }, function(transaction, error) {
                deferred.reject(error);
            });
        });
        return deferred.promise;
    };

 
    self.fetchAll = function(result) {
        var output = [];
        for (var i = 0; i < result.rows.length; i++) {
            output.push(result.rows.item(i));
        }
        return output;
    };
    self.fetch = function(result) {
        return result.rows.item(0);
    };
    return self;
})


.factory('Ruta', function($http) {
  var self = this;

  self.getAll = function(fileSystem, appDirectory, language) {
    return $http.get(fileSystem+appDirectory+language+'/routes/routes.json');
  };
  
  self.getById = function(id, fileSystem, appDirectory, language) {
      var ruta = null;
      return $http.get(fileSystem+appDirectory+language+'/routes/routes.json').success(function(data) {
        var result = data.filter(function( ruta ) {
          return ruta.routeId == id;
        });
        ruta = result[0];
      })
      .then(function() {
        return ruta;
      });
  };

  self.getRoutesByCategory = function(category, fileSystem, appDirectory, language) {
    var rutas = null;
    return $http.get(fileSystem+appDirectory+language+'/routes/routes.json').success(function(data) {
        var result = data.filter(function( ruta ) {
          return ruta.category == category;
        });
        rutas = result;
      })
      .then(function() {
        return rutas;
      });

  }
  
  self.getPoisById = function(id, fileSystem, appDirectory, language) {
    var rutas = null;
    return $http.get(fileSystem+appDirectory+language+'/routes/routes.json').success(function(data) {
      var result = data.filter(function( ruta ) {
        return ruta.routeId == id;
      });
      ruta = result[0];
    }).then(function() {
        return ruta.routePois;
      });

  }

  self.getAllCategories = function(fileSystem, appDirectory, language) {
    var categories = [];
    return $http.get(fileSystem+appDirectory+language+'/routes/routes.json').success(function(data) {
      for (var i = 0; i <= data.length-1 ; i++) {
        categories.push(data[i].category);
      }
    })
    .then(function() {
      return categories.unique().sort();
    })
    
  }
  
  return self;
})

.factory('Poi', function($http, DB){
  var self = this;

  self.getAll = function(fileSystem, appDirectory, language) {
    return $http.get(fileSystem+appDirectory+language+'/pois/pois.json');
    }

  self.getById = function(id, fileSystem, appDirectory, language) {
    var poi = null;
      return $http.get(fileSystem+appDirectory+language+'/pois/pois.json').success(function(data) {
        var result = data.filter(function( poi ) {
          return poi.id == id;
        });
        poi = result[0];
      })
      .then(function() {
        return poi;
      });
  };

  self.getAllCategories = function(fileSystem, appDirectory, language) {
    var categories = [];
    return $http.get(fileSystem+appDirectory+language+'/pois/pois.json').success(function(data) {
      for (var i = 0; i < data.length ; i++) {
        for (var j = 0; j < data[i].tags.length; j++)
          categories.push(data[i].tags[j]);
      }
    })
    .then(function() {
      return categories.unique().sort();
    })   
  }

  self.getPhotosById = function(id, fileSystem, appDirectory, language) {
    var poi = null;
      return $http.get(fileSystem+appDirectory+language+'/pois/pois.json').success(function(data) {
        var result = data.filter(function( poi ) {
          return poi.id == id;
        });
        poi = result[0];
      })
      .then(function() {
        return poi.photos;
      });
  };

  self.getAudiosById = function(id, fileSystem, appDirectory, language) {
    var poi = null;
      return $http.get(fileSystem+appDirectory+language+'/pois/pois.json').success(function(data) {
        var result = data.filter(function( poi ) {
          return poi.id == id;
        });
        poi = result[0];
      })
      .then(function() {
        return poi.audioguide;
      });
  };

  return self;
})

.factory('Restaurant', function($http, DB){
  var self = this;

  self.getAll = function(fileSystem, appDirectory, language) {
    return $http.get(fileSystem+appDirectory+language+'/restaurants/restaurants.json');
  }

  self.getById = function(id, fileSystem, appDirectory, language) {
    var restaurant = null;
    return $http.get(fileSystem+appDirectory+language+'/restaurants/restaurants.json').success(function(data) {
      var result = data.filter(function( restaurant ) {
        return restaurant.id == id;
      });
      restaurant = result[0];
    })
    .then(function() {
      return restaurant;
    });
  };

  self.getAllCategories = function(fileSystem, appDirectory, language) {
    var categories = [];
    return $http.get(fileSystem+appDirectory+language+'/restaurants/restaurants.json').success(function(data) {
      for (var i = 0; i < data.length ; i++) {
        for (var j = 0; j < data[i].tags.length; j++)
          categories.push(data[i].tags[j]);
      }
    })
    .then(function() {
      return categories.unique().sort();
    })   
  }

  self.getPhotosById = function(id, fileSystem, appDirectory, language) {
    var poi = null;
      return $http.get(fileSystem+appDirectory+language+'/restaurants/restaurants.json').success(function(data) {
        var result = data.filter(function( restaurant ) {
          return restaurant.id == id;
        });
        restaurant = result[0];
      })
      .then(function() {
        return restaurant.photos;
      });
  };

  self.getAudiosById = function(id, fileSystem, appDirectory, language) {
    var restaurant = null;
      return $http.get(fileSystem+appDirectory+language+'/restaurants/restaurants.json').success(function(data) {
        var result = data.filter(function( restaurant ) {
          return restaurant.id == id;
        });
        restaurant = result[0];
      })
      .then(function() {
        return restaurant.audioguide;
      });
  };

  return self;
})

.factory('Pub', function($http, DB){
  var self = this;

  self.getAll = function(fileSystem, appDirectory, language) {
    return $http.get(fileSystem+appDirectory+language+'/pubs/pubs.json');
  }

  self.getById = function(id, fileSystem, appDirectory, language) {
    var pub = null;
    return $http.get(fileSystem+appDirectory+language+'/pubs/pubs.json').success(function(data) {
      var result = data.filter(function( pub ) {
        return pub.id == id;
      });
      pub = result[0];
    })
    .then(function() {
      return pub;
    });
  };

  self.getAllCategories = function(fileSystem, appDirectory, language) {
    var categories = [];
    return $http.get(fileSystem+appDirectory+language+'/pubs/pubs.json').success(function(data) {
      for (var i = 0; i < data.length ; i++) {
        for (var j = 0; j < data[i].tags.length; j++)
          categories.push(data[i].tags[j]);
      }
    })
    .then(function() {
      return categories.unique().sort();
    })   
  }

  self.getPhotosById = function(id, fileSystem, appDirectory, language) {
    var poi = null;
      return $http.get(fileSystem+appDirectory+language+'/pubs/pubs.json').success(function(data) {
        var result = data.filter(function( pub ) {
          return pub.id == id;
        });
        pub = result[0];
      })
      .then(function() {
        return pub.photos;
      });
  };

  self.getAudiosById = function(id, fileSystem, appDirectory, language) {
    var bar = null;
      return $http.get(fileSystem+appDirectory+language+'/pubs/pubs.json').success(function(data) {
        var result = data.filter(function( pub ) {
          return pub.id == id;
        });
        pub = result[0];
      })
      .then(function() {
        return pub.audioguide;
      });
  };

  return self;
})

.factory('Accommodation', function($http, DB){
  var self = this;

  self.getAll = function(fileSystem, appDirectory, language) {
    return $http.get(fileSystem+appDirectory+language+'/accommodations/accommodations.json');
  }

  self.getById = function(id, fileSystem, appDirectory, language) {
    var accommodation = null;
    return $http.get(fileSystem+appDirectory+language+'/accommodations/accommodations.json').success(function(data) {
      var result = data.filter(function( accommodation ) {
        return accommodation.id == id;
      });
      accommodation = result[0];
    })
    .then(function() {
      return accommodation;
    });
  };

  self.getAllCategories = function(fileSystem, appDirectory, language) {
    var categories = [];
    return $http.get(fileSystem+appDirectory+language+'/accommodations/accommodations.json').success(function(data) {
      for (var i = 0; i < data.length ; i++) {
        for (var j = 0; j < data[i].tags.length; j++)
          categories.push(data[i].tags[j]);
      }
    })
    .then(function() {
      return categories.unique().sort();
    })   
  }

  self.getPhotosById = function(id, fileSystem, appDirectory, language) {
    var poi = null;
      return $http.get(fileSystem+appDirectory+language+'/accommodations/accommodations.json').success(function(data) {
        var result = data.filter(function( accommodation ) {
          return accommodation.id == id;
        });
        accommodation = result[0];
      })
      .then(function() {
        return accommodation.photos;
      });
  };

  self.getAudiosById = function(id, fileSystem, appDirectory, language) {
    var bar = null;
      return $http.get(fileSystem+appDirectory+language+'/accommodations/accommodations.json').success(function(data) {
        var result = data.filter(function( accommodation ) {
          return accommodation.id == id;
        });
        accommodation = result[0];
      })
      .then(function() {
        return accommodation.audioguide;
      });
  };

  return self;
})

.factory('Event', function($http, DB){
  var self = this;

  self.getAll = function(fileSystem, appDirectory, language) {
    return $http.get(fileSystem+appDirectory+language+'/events/events.json');
  }

  self.getByMonth = function(fileSystem, appDirectory, language, month, year) {
    var events = [];
    return $http.get(fileSystem+appDirectory+language+'/events/events.json').success(function(data) {
      var result = data.filter(function( event ) {
        var now = new Date();
        var dateStart = new Date(event.dateStart);
        var dateEnd = new Date(event.dateEnd);
        return dateStart.getMonth() + 1 == month && dateStart.getFullYear() == year && dateStart > now;
      });
      events = result;
    })
    .then(function() {
      return events.sort(function(a,b) { return parseFloat(a.dateStart) - parseFloat(b.dateStart) } );
    });

  }

  self.getNextMonth = function(fileSystem, appDirectory, language) {
    var events = [];
    return $http.get(fileSystem+appDirectory+language+'/events/events.json').success(function(data) {
      var result = data.filter(function( event ) {
        var now = new Date();
        var dateStart = new Date(event.dateStart);
        var timeDiff = dateStart.getTime() - now.getTime();
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays <= 30 && diffDays >=0;
      });
      events = result;
    })
    .then(function() {
      return events.sort(function(a,b) { return parseFloat(a.dateStart) - parseFloat(b.dateStart) } );
    });

  }

  self.getById = function(id, fileSystem, appDirectory, language) {
    var event = null;
    return $http.get(fileSystem+appDirectory+language+'/events/events.json').success(function(data) {
      var result = data.filter(function( event ) {
        return event.eventId == id;
      });
      event = result[0];
    })
    .then(function() {
      return event;
    });
  };

  return self;
})

.factory('Shop', function($http){
  var self = this;

  self.getAll = function(fileSystem, appDirectory, language) {
    return $http.get(fileSystem+appDirectory+language+'/shops/shops.json');
  }

  self.getById = function(id, fileSystem, appDirectory, language) {
    var shop = null;
    return $http.get(fileSystem+appDirectory+language+'/shops/shops.json').success(function(data) {
      var result = data.filter(function( shop ) {
        return shop.id == id;
      });
      shop = result[0];
    })
    .then(function() {
      return shop;
    });
  };

  self.getAllCategories = function(fileSystem, appDirectory, language) {
    var categories = [];
    return $http.get(fileSystem+appDirectory+language+'/shops/shops.json').success(function(data) {
      for (var i = 0; i < data.length ; i++) {
        for (var j = 0; j < data[i].tags.length; j++)
          categories.push(data[i].tags[j]);
      }
    })
    .then(function() {
      return categories.unique().sort();
    })   
  }

  self.getPhotosById = function(id, fileSystem, appDirectory, language) {
    var poi = null;
      return $http.get(fileSystem+appDirectory+language+'/shops/shops.json').success(function(data) {
        var result = data.filter(function( shop ) {
          return shop.id == id;
        });
        shop = result[0];
      })
      .then(function() {
        return shop.photos;
      });
  };

  self.getAudiosById = function(id, fileSystem, appDirectory, language) {
    var bar = null;
      return $http.get(fileSystem+appDirectory+language+'/shops/shops.json').success(function(data) {
        var result = data.filter(function( shop ) {
          return shop.id == id;
        });
        shop = result[0];
      })
      .then(function() {
        return shop.audioguide;
      });
  };

  return self;
})

.factory('Info', function($http){
  var self = this;

  self.getAll = function(fileSystem, appDirectory, language) {
    return $http.get(fileSystem+appDirectory+language+'/info/info.json');
    }

  return self;
})

.factory('Favorite', function($http, DB){
  var self = this;

  self.getAll = function() {
    return DB.query('SELECT type, item_id FROM favorite')
      .then(function(result){
          return DB.fetchAll(result);
      });
  };
  
  self.getAllByType = function(type, visited) {
    if(visited) {
      return DB.query('SELECT item_id, visited, timestamp FROM favorite WHERE type = ? AND visited = ? ORDER BY timestamp', [type,true])
        .then(function(result){
            return DB.fetchAll(result);
        });
    } else {
      return DB.query('SELECT item_id, visited, timestamp FROM favorite WHERE type = ? ORDER BY timestamp', [type])
        .then(function(result){
            return DB.fetchAll(result);
        });
    }
  };

  self.getAllVisitedByType = function(type) {
    return DB.query('SELECT item_id FROM favorite WHERE type = ? AND visited = ?', [type,true])
      .then(function(result){
        return DB.fetchAll(result);
      });
  };

  self.isFavorite = function(type,id) {
    return DB.query("SELECT * FROM favorite WHERE type = ? AND item_id = ?", [type,id])
      .then(function(result){
        if(result.rows.length)
          return true;
        else
          return false;
      });
  };

  self.getFavorite = function(type,id) {
    var favorite = null;
    return DB.query("SELECT * FROM favorite WHERE type = ? AND item_id = ?", [type,id])
      .then(function(result){
        return DB.fetchAll(result);
      });
  };

  self.addFavorite = function(type,id,visited) {
    if (typeof(visited)==='undefined')
      visited = false;
    return self.isFavorite(type,id).then(function(exists){
      if(!exists) {
        return DB.query("INSERT INTO favorite (type, item_id, visited) VALUES (?,?, ?)", [type,id,visited])
          .then(function(result){
            if(result.rowsAffected)
              return true;
            else
              return false;
          });
      } else {
        return DB.query("UPDATE favorite SET visited = ? WHERE type = ? AND item_id = ?", [visited,type,id])
          .then(function(result){
            if(result.rowsAffected)
              return true;
            else
              return false;
          });
      }
    });
  };

  self.removeFavorite = function(type,id) {
    return DB.query("DELETE FROM favorite WHERE type = ? AND item_id = ?", [type,id])
      .then(function(result){
        if(result.rowsAffected)
          return true;
        else
          return false;
    });
  };

  return self;
})

.factory('SocialComment', function($http, DB, itemsConfig){
  var self = this;

  self.getAllByType = function(type) {
    switch(true){
      case type == itemsConfig.poiType:
        return DB.query('SELECT * FROM social_comment_poi')
        .then(function(result){
            return DB.fetchAll(result);
        });
        break;
      case type == itemsConfig.routeType:
        return DB.query('SELECT * FROM social_comment_route')
        .then(function(result){
            return DB.fetchAll(result);
        });
        break;
      case type == itemsConfig.eventType:
        return DB.query('SELECT * FROM social_comment_event')
        .then(function(result){
            return DB.fetchAll(result);
        });
        break;
    }
  };

  self.getNotSentByType = function(type) {
    switch(true){
      case type == itemsConfig.poiType:
        return DB.query('SELECT social_comment_id, timestamp AS date, user, comment, item_id, rating FROM social_comment_poi WHERE sent = 0')
        .then(function(result){
             DB.query("UPDATE social_comment_poi SET sent = 1 WHERE sent = 0 ")
            return DB.fetchAll(result);
        });
        break;
      case type == itemsConfig.routeType:
        return DB.query('SELECT social_comment_id, timestamp AS date, user, comment, item_id, rating FROM social_comment_route WHERE sent = 0')
        .then(function(result){
            DB.query("UPDATE social_comment_route SET sent = 1 WHERE sent = 0 ")
            return DB.fetchAll(result);
        });
        break;
      case type == itemsConfig.eventType:
        return DB.query('SELECT social_comment_id, timestamp AS date, user, comment, item_id, rating FROM social_comment_event WHERE sent = 0')
        .then(function(result){
            DB.query("UPDATE social_comment_event SET sent = 1 WHERE sent = 0 ")
            return DB.fetchAll(result);
        });
        break;
    }
  };

  self.add = function(type,user,comment,rating,id) {
    var table_name = null;
    switch(true) {
      case (type == itemsConfig.poiType || type == itemsConfig.restaurantType || type == itemsConfig.pubType || type == itemsConfig.accommodationType || type == itemsConfig.shopType):
        table_name = "social_comment_poi";
        break;
      case type == itemsConfig.routeType:
        table_name = "social_comment_route";
        break;
      case type == itemsConfig.eventType:
        table_name = "social_comment_event";
        break;
    }

    if (table_name) {
      return DB.query("INSERT INTO " + table_name + " (user, comment, rating, item_id) VALUES (?,?,?,?)", [user, comment, rating, id])
        .then(function(result){
          if(result.rowsAffected)
            return true;
          else
            return false;
        });
    } else {
      console.log("Error inserting comment");
      return false;
    }
  };

  return self;

})

.factory('PoiComments', function($http, DB){
  var self = this;

  self.getById = function(id, fileSystem, appDirectory, language) {
    return $http.get(fileSystem+appDirectory+'comments/poisComments.json').success(function(data) {
        var result = data.filter(function( poi ) {
          return poi.id == id;
        });
        opinions = result[0].comments;
      })
      .then(function() {
        return opinions.sort(function(a,b) { return Date.parse(b.date) - Date.parse(a.date) } );
      });
  };

  self.getRatings = function(fileSystem, appDirectory) {
    var ratings = [];
    return $http.get(fileSystem+appDirectory+'comments/poisComments.json').success(function(data) {
      for (var i = 0; i < data.length ; i++) {
        poi_id = data[i].id;
        ratings[poi_id] = data[i].avgRating;
      }
    })
    .then(function() {
      return ratings;
    })  
  }

  return self;
})

.factory('RouteComments', function($http, DB){
  var self = this;

  self.getById = function(id, fileSystem, appDirectory, language) {
    return $http.get(fileSystem+appDirectory+'comments/routesComments.json').success(function(data) {
        var result = data.filter(function( route ) {
          return route.id == id;
        });
        opinions = result[0].comments;
      })
      .then(function() {
        return opinions;
      });
  };

  self.getRatings = function(fileSystem, appDirectory) {
    var ratings = [];
    return $http.get(fileSystem+appDirectory+'comments/routesComments.json').success(function(data) {
      for (var i = 0; i < data.length ; i++) {
        route_id = data[i].id;
        ratings[route_id] = data[i].avgRating;
      }
    })
    .then(function() {
      return ratings;
    })  
  }

  return self;
})

.factory('Offline', function($http) {
  var self = this;

  self.getValue = function(fileSystem, appDirectory) {
    var value = null;
    return $http.get(fileSystem+appDirectory+'/version.json').success(function(data) {
      value = data[0].offline;
    })
    .then(function() {
      return value;
    });
  };

  return self;
})

.factory('AppVersion', function($http) {
  var self = this;

  self.getValue = function(fileSystem, appDirectory) {
    var value = null;
    //return $http.get(fileSystem+appDirectory+'/config.json').success(function(data) {
    return $http.get('configuration.json').success(function(data) {
      value = data[0].appVersion;
    })
    .then(function() {
      return value;
    });
  };

  return self;
})

.factory('Languages', function($http) {
  var self = this;

  self.getValues = function() {
    var value = null;
    return $http.get('configuration.json').success(function(data) {
      value = data[0].langs;
    })
    .then(function() {
      return value;
    });
  };

  return self;
})

.factory('Organization', function($http) {
  var self = this;

  self.getValue = function() {
    var value = null;
    return $http.get('configuration.json').success(function(data) {
      value = data[0].organizationId;
    })
    .then(function() {
      return value;
    });
  };

  return self;
})

.factory('Destination', function($http) {
  var self = this;

  self.getValue = function() {
    var value = null;
    return $http.get('configuration.json').success(function(data) {
      value = data[0].destinationId;
    })
    .then(function() {
      return value;
    });
  };

  return self;
})

.factory('Temp', function($http) {
  var self = this;

  self.getValue = function(destination) {
    var value = null;
    return $http.get('http://api.openweathermap.org/data/2.5/weather?q=' + destination).success(function(data) {
      value = parseFloat(data['main']['temp'] - 273.15).toFixed(0);
    })
    .then(function() {
      return value;
    });
  };

  self.getIcon = function(destination) {
    var value = null;
    return $http.get('http://api.openweathermap.org/data/2.5/weather?q=' + destination).success(function(data) {
      value = data['weather'][0]['icon'];
    })
    .then(function() {
      return value;
    });
  };

  return self;
})

Array.prototype.unique=function(a){
  return function(){return this.filter(a)}}(function(a,b,c){return c.indexOf(a,b+1)<0
})
