// Configure logger for Filters
var logger = new Logger('Managers:Filter');
// Comment out to use global logging level
// Logger.setLevel('Managers:Filter', 'trace');
// Logger.setLevel('Managers:Filter', 'debug');
Logger.setLevel('Managers:Filter', 'info');
// Logger.setLevel('Managers:Filter', 'warn');

FilterManager = (function () {
  return {
    create: function(name, user, col, field, val, op) {
      /**************************************************************
       * Create a new filter
       * @Params
       *    name - An identifier used but the filtering component
       *    user - the user that is using the query
       *    col - the colleciton that will be queried
       *    field - the document field to be operated on (using
       *        dot notation for document subfields)
       *    val  -  the value used for comparison with the field
       *    op  - (optional) the comparison operator to be applied
       *        with the given value (ie: eq, ne, gt, lt, gte, lte)
       * @Return
       *    boolean - true if successful creation of iflter that will
       *        not conflict with existing queries
       * ***********************************************************/
      /*****************   Stub code *******************************/
      /*****************   End Stub code ***************************/
      /*****************   Actual Implementation code **************/
      logger.trace("Beginning FilterManager.create");
      //Need to check for conflicting operators on the same field
      if (!op) {
        logger.debug("no op provided to create filter");
        op = "eq";
      } 
      var otherOps = Filters.find({name: name, 
          user: user._id, 
          collection: col, 
          type: 'filter',
          field: field,
          op: {'$ne': op}});
      logger.debug("found " + otherOps.count() + " filters with other ops");
      //var allOps = Filters.find({name: name, 
          //user: user, 
          //collection: col, 
          //field: field,
          //});
      //allOps = Filters.find({user: user, name: name});
      //logger.debug("found " + allOps.count() + " filters with matching");
      //logger.debug(allOps.fetch()[0]);

      var createFilter = true;
      if (otherOps.count() !== 0) { 
        //Settle potentially conflicting ops
        logger.trace("Found " + otherOps.count() + 
            " filters with different ops from: " + op);
        otherOps.forEach(function (filt) {
        logger.trace("Comparing to filter with op " + filt.op);
          switch (filt.op) {
            case "eq":
              //Only additional eq ops allowed
              logger.trace("Filter op is eq");
              createFilter = false;
              break;
            case "ne":
              //Only additional ne ops allowed
              logger.trace("Filter op is ne");
              createFilter = false;
              break;
            default:
              //Only eq & ne are conflicting
              if (op === 'eq' || op === 'ne') {
                logger.trace("Filter op is gt, lt, gte, lte");
                createFilter = false;
              }
              break;
          }
        });
      } 
      if (createFilter) {
        logger.trace("No Conflicting filters found. Creating new filter");
        var newFilter = new Filter(name, user, col, field, val, op);
        newFilter._id = Filters.insert(newFilter);
        logger.debug("New Filter: ");
        logger.debug(newFilter);
        return true;
      } else {
        return false;
      }


      /*****************   End Actual Implementation code **********/
    },
    toggle: function(name, user, col, field, val, op) {
      /**************************************************************
       * Create/Destroy filter with given params
       * @Params
       *    name - An identifier used but the filtering component
       *    user - the user that is using the query
       *    col - the colleciton that will be queried
       *    field - the document field to be operated on (using
       *        dot notation for document subfields)
       *    val  -  the value used for comparison with the field
       *    op  - (optional) the comparison operator to be applied
       *        with the given value (ie: eq, ne, gt, lt, gte, lte)
       * @Return
       *    boolean - true if toggle filter on, false if toggle off
       * ***********************************************************/
      logger.trace("Beginning FilterManager.toggle");
      
      if (op) {
        var filter = Filters.findOne({name: name, 
              user: user._id, 
              collection: col,
              field: field,
              val: val,
              op: op
        });
        if (filter) {
          this.remove(name, user, col, field, val, op);
          return false;
        } else {
          this.create(name, user, col, field, val, op);
          return true;
        }
      } else {
        var filter = Filters.findOne({name: name, 
              user: user._id, 
              collection: col,
              field: field,
              val: val
        });
        if (filter) {
          this.remove(name, user, col, field, val);
          return false;
        } else {
          this.create(name, user, col, field, val);
          return true;
        }
      }
      
    },
    getFilterList: function(name, user, col) {
      /**************************************************************
       * Get the raw list of filters that will shape the query
       * @Params
       *    name - An identifier used but the filtering component
       *    user - the user that is using the query
       *    col - the colleciton that will be queried
       * @Return
       *    cursor pointing to list of filters 
       * ***********************************************************/
      /*****************   Stub code *******************************/
      /*****************   End Stub code ***************************/
      /*****************   Actual Implementation code **************/
      logger.trace("Beginning getFilterList");
      var results = Filters.find({name: name, 
          user: user._id, 
          collection: col,
          type: 'filter',
      });
      logger.debug("Found " + results.count() + " filters matching");
      return results;
      /*****************   End Actual Implementation code **********/

    },
    createMappedFilterList: function(name, user, col, sessVar) {
      /**************************************************************
       * Gets a filter list and pushes the mapped result into a 
       * session var
       * @Params
       *    name - An identifier used but the filtering component
       *    user - the user that is using the query
       *    col - the colleciton that will be queried
       *    sessVar - the name of the session variable to store the 
       *        mapped filter result        
       * @Return
       *    object with 5 possible fields
       *      users - a list of users referenced by filters
       *      inCluster - a boolean referenced by filters
       *      clusters - a list of clusters referenced by filters
       *      eventTypes - the list of Event types
       *      time - a single object with 2 possible fields: begin
       *          and end, where begin and end are a javascript Date
       *      misc - array of raw filters not translated into one of
       *          the above categories 
       * ***********************************************************/
      /*****************   Stub code *******************************/
      /*****************   End Stub code ***************************/
      /*****************   Actual Implementation code **************/
      logger.trace("Beginning getFilterList");
      var result = {};
      //var rawFilters = this.getFilterList(name, user, col);
      //Get user filters
      var userFilters = Filters.find({name: name, 
          user: user._id, 
          collection: col,
          type: 'filter',
          field: 'userID'
      });
      logger.debug("Found " + userFilters.count() + " matching user filters");
      if (userFilters.count() !== 0) {
        //Grab userIDs from filters and get associated user documents
        var IDs = getValsFromField(userFilters, 'val');
        logger.debug("IDs of users: " + JSON.stringify(IDs));
        result['users'] = MyUsers.find({_id: {$in: IDs}}).fetch();
      }
      //Get inCluster Filters
      var inClusterFilters = Filters.findOne({name: name,
          user: user._id,
          collection: col,
          field: 'inCluster'
        });
      // logger.debug("Found " + inClusterFilters.count() + 
      //     " matching inCluster filters");
      if (inClusterFilters) {
        //Grab clusterIDs from filters and get associated cluster documents
        bool = inClusterFilters.val;
        console.log(bool);
        logger.debug("bools of inClusters: " + bool);
        result['inCluster'] = bool;
      }

      //Get cluster filters
      var clusterFilters = Filters.find({name: name, 
          user: user._id, 
          collection: col,
          type: 'filter',
          field: 'clusterIDs'
      });
      logger.debug("Found " + clusterFilters.count() + 
          " matching [cluster] filters");
      if (clusterFilters.count() !== 0) {
        //Grab clusterIDs from filters and get associated cluster documents
        IDs = getValsFromField(clusterFilters, 'val');
        logger.debug("IDs of clusters: " + JSON.stringify(IDs));
        result['clusters'] = Clusters.find({_id: {$in: IDs}}).fetch();
        // console.log(result['clusters']);
      }
      //Get time filters
      var timeFilters = Filters.find({name: name, 
          user: user._id, 
          collection: col,
          type: 'filter',
          field: 'time'
      });
      logger.debug("Found " + timeFilters.count() + 
          " matching time filters");
      //Translate to begin and end times
      if (timeFilters.count() !== 0) {
        var time = {};
        timeFilters.forEach(function(filt) {
          if (filt.op === 'gt' || filt.op === 'gte') {
            time['begin'] = filt.val;
            // console.log("begin: " + time['begin']);
          } else if (filt.op === 'lt' || filt.op === 'lte') {
            time['end'] = filt.val;
            // console.log("end: " + time['end']);
          }
        });
        result['time'] = time;
      }
      //Get EventType Filters
      var typeFilters = Filters.find({name: name, 
          user: user._id, 
          collection: col,
          type: 'filter',
          field: 'type._id'
      });
      logger.debug("Found " + typeFilters.count() + 
          " matching EventType filters");
      if (typeFilters.count() !== 0) {
        //Grab EventTypeIDs from filters and get associated 
        //cluster documents
        IDs = getValsFromField(typeFilters, 'val');
        logger.debug("IDs of EventTypes: " + JSON.stringify(IDs));
        result['eventTypes'] = EventTypes.find(
            {_id: {$in: IDs}}).fetch();
      }
      //Return nonmatching filters as raw filters
      var filts = Filters.find({name: name, 
          user: user._id, 
          collection: col,
          type: 'filter',
          field: {$nin: ['userID', 'clusters', 'time', 'type._id']}
      });
      logger.debug("Found " + filts.count() + 
          " matching misc filters");
      if (filts.count() !== 0) {
        result['misc'] = filts.fetch();
      }
      if (Meteor.isClient) {
        logger.trace("Creating Session var with name: " + sessVar);
        Session.set(sessVar, result);
      }
      return result;
      /*****************   End Actual Implementation code **********/

    },
    removeFilters: function(filters) {
      if (hasForEach(filters)) {
        ids = getIDs(filters);
        //for (var i=0; i<ideas.length; i++) {
          //ids.push(ideas._id);
        //} 
        if (Meteor.isServer) {
          Filters.remove({_id: {$in: ids}});
        } else {
          ids.forEach(function(id) {
            Filters.remove({_id: id});
          });
        }
      } else {
        Filters.remove({_id: ideas._id});
      }
    },
    remove: function(name, user, col, field, val) {
      /**************************************************************
       * Delete the specific filter matching the given params
       * @Params
       *    name - An identifier used but the filtering component
       *    user - the user that is using the query
       *    collection - the colleciton that will be queried
       *    field - the document field to be operated on (using
       *        dot notation for document subfields)
       *    val  - (optional) the value used for comparison with the field
       *
       * @Return
       *    boolean if the filter was successfully removed
       * ***********************************************************/
      /*****************   Stub code *******************************/
      /*****************   End Stub code ***************************/
      /*****************   Actual Implementation code **************/
      logger.trace("Beginning remove matching filters");
      var results = Filters.find({name: name, 
          user: user._id, 
          collection: col,
          type: 'filter',
          field: field,
          val: val
      });
      logger.debug("Found " + results.count() + " filters to remove");
      if (Meteor.isServer) {
        if(val){
          Filters.remove({name: name, 
              user: user._id, 
              collection: col,
              field: field,
              val: val
          });
        } else {
          Filters.remove({name: name, 
              user: user._id, 
              collection: col,
              field: field
          });
        }
      } else {
        //Can't delete data except by using individual IDs on client
        if(val){ 
          var filts = Filters.find({name: name, 
            user: user._id, 
            collection: col,
            type: 'filter',
            field: field,
            val: val
          });
          filts.forEach(function(filt) {
            Filters.remove({_id: filt._id});
          });
        } else {
          var filts = Filters.find({name: name, 
            user: user._id, 
            collection: col,
            type: 'filter',
            field: field
          });
          filts.forEach(function(filt) {
            Filters.remove({_id: filt._id});
          });
        }

      }
      if(val){
        var results = Filters.find({name: name, 
            user: user._id, 
            collection: col,
            type: 'filter',
            field: field,
            val: val
        });
      } else {
        var results = Filters.find({name: name, 
              user: user._id, 
              collection: col,
              type: 'filter',
              field: field
          });
      }

      logger.debug("Found " + results.count() + " filters after remove");
      if (results.count() === 0) 
        return true;
      else
        return false;
      /*****************   End Actual Implementation code **********/

    },
    reset: function(name, user, col, exceptionFilters) {
      /**************************************************************
       * Delete all filters associated with the name, user, and
       * collection
       * @Params
       *    name - An identifier used but the filtering component
       *    user - the user that is using the query
       *    collection - the colleciton that will be queried
       *    exceptionFilters - (optional) list of filters to NOT remove
       * @Return
       *    boolean if all the filters was successfully removed
       * ***********************************************************/
      /*****************   Stub code *******************************/
      /*****************   End Stub code ***************************/
      /*****************   Actual Implementation code **************/
      logger.trace("Beginning reset all matching filters");
      var results = Filters.find({name: name, 
          user: user._id, 
          collection: col,
          type: 'filter',
      });
      logger.debug("Found " + results.count() + " filters to remove");
      if (Meteor.isServer) {
        Filters.remove({name: name, 
            user: user._id, 
            collection: col,
        });
      } else {
        //Can't delete data except by using individual IDs on client
        var filts = Filters.find({name: name, 
          user: user._id, 
          collection: col,
          type: 'filter',
        });
        if (exceptionFilters) {
          filts.forEach(function(filt) {
            if (!isInList(filt,exceptionFilters,"_id")) {
              Filters.remove({_id: filt._id});  
            }
          });
        } else {
          filts.forEach(function(filt) {
            Filters.remove({_id: filt._id});
          });
        }
      }
      results = Filters.find({name: name, 
          user: user._id, 
          collection: col,
          type: 'filter',
      });
      logger.debug("Found " + results.count() + " filters after remove");
      if (results.count() === 0) 
        return true;
      else
        return false;
      /*****************   End Actual Implementation code **********/

    },
    parseFilterOps: function (filters) {
    /******************************************************************
    * Translate a set of filters into a field separeted set of filters
    * @Params
    *     filters - 
    * @Return
    *     
    *****************************************************************/
    //Result that will organize filters by field
    var sortedFields = binByField(filters, 'field');
    //Result that will hold the sorted filters
    var sortedOps = {fields: sortedFields.fields};
    sortedFields.fields.forEach(function(field) {
      logger.debug("Field: " + field +
        "filters: " + JSON.stringify(sortedFields[field]));
      sortedOps[field] = binByField(sortedFields[field], 'op');
      logger.debug("Sorted Result: " + JSON.stringify(sortedOps[field]));
    });
    return sortedOps;
    },
    getOpQuery: function(op, sortedOp) {
      /**************************************************************
       * Translate a set of filters over a common field and operation
       * into a query subobject
       * @Params
       *    op - a string of the operation to be performed
       *    sortedOp - an array of filters
       * @Return
       *    an object that will be passed as a query field parameter
       *************************************************************/
      var query;
      var length = sortedOp.length;
      switch (op) {
        case 'eq':
          if (length === 1) {
            logger.trace("eq single vals: " + JSON.stringify(sortedOp[0].val));
            return sortedOp[0].val;
          } else {
            var vals = [];
            sortedOp.forEach(function(filt) {
              vals.push(filt.val);
            });
            logger.trace("eq multiple vals: " + JSON.stringify(vals));
            return {'$in': vals};
          }
          break;
        case 'ne': 
          if (length === 1) {
            return {'$ne': sortedOp[0].val};
          } else {
            var vals = [];
            sortedOp.forEach(function(filt) {
              vals.push(filt.val);
            });
            return {'$nin': vals};
          }
          break;
        case 'gt':
          //Should only be 1 filter in list
          return {'$gt': sortedOp[0].val};
          break;
        case 'lt':
          //Should only be 1 filter in list
          return {'$lt': sortedOp[0].val};
          break;
        case 'gte':
          //Should only be 1 filter in list
          return {'$gte': sortedOp[0].val};
          break;
        case 'lte':
          //Should only be 1 filter in list
          return {'$lte': sortedOp[0].val};
          break;
      }
    },
    getSingleFieldQuery: function(qField, opSortedFilters) {
        logger.trace("Forming a query over a single field");
        //Get field specific filters sorted by ops
        var ops = opSortedFilters['fields'];
        var query = {};
        if (ops.length === 1) {
          logger.trace("Forming query with only 1 operation");
          logger.trace("query op: " + ops[0]);
          logger.trace("Filter: " + JSON.stringify(opSortedFilters[ops[0]]));
          query[qField] = this.getOpQuery(ops[0], 
              opSortedFilters[ops[0]]);
        } else {
          query['$and'] = [];
          for (var i=0; i<ops.length; i++) {
            var op = ops[i];
            var filts = opSortedFilters[op];
            var subQuery = {};
            subQuery[qField] = this.getOpQuery(op, filts);
            query['$and'].push(subQuery);
          }
        }
        return query;

    },
    getQuery: function(parsed, collection) {
      /**************************************************************
       * Translate a set of filters parsed by field and then
       * operation into a single query object that can be passed to
       * Meteor.Collection.find()
       * @Params
       *    parsedFilters - the result of parseFilterOps
       *    collection - the collection being queried (hack to filter
       *        events differently)
       * @Return
       *    a object that can be passed directly to Collection.find()
       *    that will filter a given filter
       *************************************************************/
      //Get and parse relevant filters
      //var filters = this.getFilterList(name, user, collection);
      //var parsed = this.parseFilterOps(filters);
      //The result to be returned
      var query = {};
      var fields = parsed.fields;
      if (fields.length === 0) {
        logger.trace("No filters found, returning empty query");
      } else if (fields.length === 1) {
        logger.trace("Filtering over only 1 field");
        //Get field specific filters sorted by ops
        var fieldParsed = parsed[fields[0]];
        //var ops = fieldParsed['fields'];
        var field = fields[0];
        query = this.getSingleFieldQuery(field, fieldParsed);
        //if (ops.length === 1) {
          //logger.trace("Forming query with only 1 operation");
          //query[field] = this.getOpQuery(ops[0], fieldParsed[ops[0]);
        //} else {
          //query['$and'] = [];
          //for (var i=0; i<ops.length; i++) {
            //var op = ops[i];
            //var filts = fieldParsed[op];
            //query['$and'].push({field: this.getOpQuery(op, filts)});
          //}
          //return query;
        //}
      } else {
        //Filtering over multiple fields
        logger.trace("Filtering over " + parsed.fields.length + 
          " fields");
        //if field is not eventtype, then $or all fields of filters
        var fieldParsed = parsed[fields[0]];
        var ops = fieldParsed['fields'];
        if (collection == "events") {
          var query = {'$and': []};
        } else {
          query = {'$and': []};
        }
        for (var i=0; i<fields.length; i++) {
          var field = fields[i];
          var fieldParsed = parsed[field];
          query['$and'].push(this.getSingleFieldQuery(field, fieldParsed));
        }
      }
      return query;

    },


    createSorter : function(name, user, col, field, val, position){
    /**************************************************************
       * Creates a new sorter. Delete if there are any existing for 
       * the provided field , collection, user and name.
       * @Params
       *    name - An identifier used but the sorting component
       *    user - the user that is using the query
       *    col - the colleciton that will be queried
       *    field - field of collection that will be used for sorting
       *    val - can take only +1/-1. Signifies ascending descending
       *    position - to support multiple level of sorting
       * @Return
       *    cursor pointing to list of sorters 
       * ***********************************************************/
      var newSorter = new Sorter(name, user, col, field, val, position);
      //var findObject = new UniqueSorter(name, user, col, field);
      //var upsert  = { 'upsert' : true };
      //this.removeSorter(name, user, col, field)
  
      /* inserts the value of sorter if found, else inserts a new one */
      newSorter._id = Sorters.insert(newSorter);
  
      logger.debug("New Sorter: ");
      logger.debug(newSorter);
      return true;

    },

    removeSorters: function(sorters) {
      if (hasForEach(sorters)) {
        ids = getIDs(sorters);
        //for (var i=0; i<ideas.length; i++) {
          //ids.push(ideas._id);
        //} 
        if (Meteor.isServer) {
          Sorters.remove({_id: {$in: ids}});
        } else {
          ids.forEach(function(id) {
            Sorters.remove({_id: id});
          });
        }
      } else {
        Sorters.remove({_id: sorters._id});
      }
    },

    removeSorter: function(name, user, col, field, val) {
      /**************************************************************
       * Delete the specific filter matching the given params
       * @Params
       *    name - An identifier used but the filtering component
       *    user - the user that is using the query
       *    collection - the colleciton that will be queried
       *    field - the document field to be operated on (using
       *        dot notation for document subfields)
       *    val  - (optional) the value used for comparison with the field
       *
       * @Return
       *    boolean if the filter was successfully removed
       * ***********************************************************/
      logger.trace("Beginning remove matching sorters");
      var results = Sorters.find({name: name, 
          userID: user._id, 
          collection: col,
          type: 'sorter',
          field: field,
          val: val
      });
      logger.debug("Found " + results.count() + " sorters to remove");
      if (Meteor.isServer) {
        if(val){
          Sorters.remove({name: name, 
              userID: user._id, 
              collection: col,
              field: field,
              val: val
          });
        } else {
          Sorters.remove({name: name, 
              userID: user._id, 
              collection: col,
              field: field
          });
        }
      } else {
        //Can't delete data except by using individual IDs on client
        if(val){ 
          var sorts = Sorters.find({name: name, 
            userID: user._id, 
            collection: col,
            type: 'sorter',
            field: field,
            val: val
          });
          sorts.forEach(function(sort) {
            Sorters.remove({_id: sort._id});
          });
        } else {
          var sorts = Sorters.find({name: name, 
            userID: user._id, 
            collection: col,
            type: 'sorter',
            field: field
          });
          sorts.forEach(function(sort) {
            Sorters.remove({_id: sort._id});
          });
        }

      }
      if(val){
        var results = Sorters.find({name: name, 
            userID: user._id, 
            collection: col,
            type: 'sorter',
            field: field,
            val: val
        });
      } else {
        var results = Sorters.find({name: name, 
              userID: user._id, 
              collection: col,
              type: 'sorter',
              field: field
          });
      }

      logger.debug("Found " + results.count() + " sorters after remove");
      if (results.count() === 0) 
        return true;
      else
        return false;

    },
    resetSorters: function(name, user, col, exceptionSorters) {
      /**************************************************************
       * Delete all filters associated with the name, user, and
       * collection
       * @Params
       *    name - An identifier used but the filtering component
       *    user - the user that is using the query
       *    collection - the colleciton that will be queried
       *    exceptionFilters - (optional) list of filters to NOT remove
       * @Return
       *    boolean if all the filters was successfully removed
       * ***********************************************************/
      logger.trace("Beginning reset all matching sorters");
      var results = Sorters.find({name: name, 
          userID: user._id, 
          collection: col,
          type: 'sorter',
      });
      logger.debug("Found " + results.count() + " sorters to remove");
      if (Meteor.isServer) {
        Sorters.remove({name: name, 
            userID: user._id, 
            collection: col,
        });
      } else {
        //Can't delete data except by using individual IDs on client
        var sorts = Sorters.find({name: name, 
          userID: user._id, 
          collection: col,
          type: 'sorter',
        });
        if (exceptionSorters) {
          sorts.forEach(function(sort) {
            if (!isInList(sort,exceptionSorters,"_id")) {
              Sorters.remove({_id: sort._id});  
            }
          });
        } else {
          sorts.forEach(function(sort) {
            Sorters.remove({_id: sort._id});
          });
        }
      }
      results = Sorters.find({name: name, 
          userID: user._id, 
          collection: col,
          type: 'sorter',
      });
      logger.debug("Found " + results.count() + " sorters after remove");
      if (results.count() === 0) 
        return true;
      else
        return false;
    },


    getSorterList: function(name, user, col) {
      /**************************************************************
       * Get the raw list of sorters that will shape the query
       * @Params
       *    name - An identifier used but the sortering component
       *    user - the user that is using the query
       *    col - the colleciton that will be queried
       * @Return
       *    cursor pointing to list of sorters 
       * ***********************************************************/
      /*****************   Stub code *******************************/
      /*****************   End Stub code ***************************/
      /*****************   Actual Implementation code **************/
      logger.trace("Beginning getSortersList");
      
      var results = Sorters.find({'name': name, 
          'userID': user._id, 
          'collection' : col,
          type: 'sorter',
      });

      logger.debug("Found " + results.count() + " sorters matching");

      return results;
      /*****************   End Actual Implementation code **********/

    },

    getSortingQuery: function (sorters) {
    /******************************************************************
    * Uses the sorters cursor to generate a string sorting query
    * @Params
    *     sorters - 
    * @Return
    *     sorting query string
    *****************************************************************/
      var sortArray = sorters.fetch();
      var sorterObj = {};
      sorters.forEach(function(sorter) {
        sorterObj[sorter.field] = sorter.val;
      });
      logger.debug("Generating a sort object");
      logger.trace(sorterObj);
      return { 'sort' : sorterObj };
    },

    performQuery: function(name, user, collection) {
      /**************************************************************
       * Create a new filter
       * @Params
       *    name - An identifier used but the filtering component
       *    user - the user that is using the query
       *    collection - the colleciton that will be queried
       * @Return
       *    Collection cursor of the collection specified
       * ***********************************************************/
      /*****************   Stub code *******************************/
      /*****************   End Stub code ***************************/
      /*****************   Actual Implementation code **************/
      //Get and parse relevant filters into query parameter object
      var filters = this.getFilterList(name, user, collection);
      var parsed = this.parseFilterOps(filters);
      var query = this.getQuery(parsed);
      logger.debug("got query string: " + JSON.stringify(query));

      var sorters = this.getSorterList(name, user, collection);
      var sortingQuery = this.getSortingQuery(sorters);

      var col = getCollection(collection);
      // return col.find(query);
      return col.find(query,sortingQuery);

      return result;

      /*****************   End Actual Implementation code **********/

    },
  };
}());
