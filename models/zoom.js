// Configure logger for Filters
var logger = new Logger('Models:ZoomPositions');
// Comment out to use global logging level
// Logger.setLevel('Models:ZoomPositions', 'trace');
// Logger.setLevel('Models:ZoomPositions', 'debug');
Logger.setLevel('Models:ZoomPositions', 'info');
// Logger.setLevel('Models:ZoomPositions', 'warn');

ZoomPositions = new Meteor.Collection("zoomPositions");

ZoomPosition = function(elementID, elementType, position, user) {
    this.elementID = elementID;
    this.elementType = elementType;
    this.position = position;
    this.userID = user._id;
}

ZoomManager = (function() {
    return {
        updatePosition: function(elementID, elementType, position, user) {
         /********************************************************************
         * Update the position of this element in the zoom space for this user
         *
         ********************************************************************/ 
             zoomPosition = ZoomPositions.findOne({elementType: elementType, elementID: elementID, userID: user._id});
             if (zoomPosition) {
                logger.debug("Updating existing position");
                ZoomPositions.update({_id: zoomPosition._id},
                                     {$set: {position: position}});
             } else {
                logger.debug("Adding a new position");
                newPosition = new ZoomPosition(elementID, elementType, position, user);
                newPositionID = ZoomPositions.insert(newPosition);
             }
        },
        getElementPosition: function(elementID, user) {
        /********************************************************************
        * Retrieve the position of this element in the zoom space for this user
        *
        ********************************************************************/ 
            zoomPosition = ZoomPositions.findOne({elementID: elementID, userID: user._id});
            if (zoomPosition) {
                return zoomPosition.position;    
            } else {
                return {"top": 2475, "left": 2475}
            }
            
        },
        removePosition: function(elementID, elementType, user) {
        /********************************************************************
        * Remove zoom position for this element when it leaves the zoom space
        * Cases:
        * 1) Idea enters a cluster
        * 2) Idea moves from zoom space to idea list
        * 3) Cluster gets deleted
        ********************************************************************/
        }
    };
}());