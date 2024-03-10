var MAZE = (function () {
    // public variables (via return statement):
    var my = {};
    my.map = [];
    
    // public readonly properties:

    const MAP_SPACE_WALL = 0;
    Object.defineProperty(my , "MAP_SPACE_WALL", {
        value: MAP_SPACE_WALL,
        writable: false,
        enumerable: true,
        configurable: true
    });

    const MAP_SPACE_FREE = 1;
    Object.defineProperty(my , "MAP_SPACE_FREE", {
        value: MAP_SPACE_FREE,
        writable: false,
        enumerable: true,
        configurable: true
    });

    const MAP_SPACE_DOOR = 2;
    Object.defineProperty(my , "MAP_SPACE_DOOR", {
        value: MAP_SPACE_DOOR,
        writable: false,
        enumerable: true,
        configurable: true
    });

    const MAP_SPACE_KEY = 3;
    Object.defineProperty(my , "MAP_SPACE_KEY", {
        value: MAP_SPACE_KEY,
        writable: false,
        enumerable: true,
        configurable: true
    });

    const MAP_SPACE_COIN = 4;
    Object.defineProperty(my , "MAP_SPACE_COIN", {
        value: MAP_SPACE_COIN,
        writable: false,
        enumerable: true,
        configurable: true
    });

    const MAP_SPACE_ENEMY = 5;
    Object.defineProperty(my , "MAP_SPACE_ENEMY", {
        value: MAP_SPACE_ENEMY,
        writable: false,
        enumerable: true,
        configurable: true
    });

    function _boundingBox(x, y, w, h, id) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.id = id;
        this.wasInView = false
    }

    _randomGen = function(seed){
        if (seed === undefined) var seed = performance.now();
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        }
    };

    
    // Gets a random number within (inclusive) the input min and max:
    _randomIntFromIntervalInclusive = function(min, max) {
        return Math.floor(Math.random()*(max-min+1)+min);
    };

    // private variables:
    let _route,
        _random = _randomGen((Math.random() * 100000) | 0),
        _directions = [
            [ 0, 1], // up
            [ 0,-1], // down
            [-1, 0], // left
            [ 1, 0]  // right
        ];

    _populateMazeMap = function() {
        let x = _route[_route.length-1][0] | 0;
        let y = _route[_route.length-1][1] | 0;
        let alternatives = [];
        for (var i=0; i<_directions.length; i++) {
            if (my.map[(_directions[i][1]+y)*2] != undefined &&
                my.map[(_directions[i][1]+y)*2][(_directions[i][0]+x)*2 ] === MAZE.MAP_SPACE_FREE
            ) {
                alternatives.push(_directions[i])
            }
        }
        if (alternatives.length === 0) {
            _route.pop();
            if (_route.length > 0) {
                _populateMazeMap();
            }
        }
        else {
            let direction = alternatives[(_random() * alternatives.length) | 0];
            _route.push([direction[0]+x,direction[1]+y]);
            my.map[(direction[1]+y)*2][(direction[0]+x)*2] = MAZE.MAP_SPACE_WALL;
            my.map[direction[1] + y*2][direction[0] + x*2] = MAZE.MAP_SPACE_WALL;
            _populateMazeMap();
        }
    }

    my.buildMap = function (width, height) {
        my.buildMap(width, height, false);
    }
    my.buildMap = function (width, height, includeBorder) {
        let x = (width / 2) | 0;
        let y = (height / 2) | 0;
        _route = [[x,y]];
        for (var i=0; i<height*2; i++) {
            my.map[i] = [];
            for(var j=0; j<width*2; j++){
                my.map[i][j] = MAZE.MAP_SPACE_FREE;
            }
        }
        my.map[y*2][x*2] = MAZE.MAP_SPACE_WALL;
        _populateMazeMap();

        if (includeBorder) {
            let mapWithBorders = [];
            
            // Set the top and bottom border rows:
            let fullRow = [];
            let emptyRow = [];
            for (let c=0; c < width*2 + 3; c++) {
                fullRow[c] = MAZE.MAP_SPACE_WALL;
                emptyRow[c] = MAZE.MAP_SPACE_FREE;
            }
            mapWithBorders[0] = fullRow;
            mapWithBorders[1] = emptyRow;
            mapWithBorders[height*2 + 2] = fullRow;
            
            // Copy the old maze to the middle rows:
            for (var i=0; i<height*2; i++) {
                mapWithBorders[i + 2] = [];
                for(var j=0; j<width*2; j++){
                    mapWithBorders[i + 2][j + 2] = my.map[i][j];
                }
            }

            // Set the left and right columns:
            mapWithBorders[1][0] = MAZE.MAP_SPACE_WALL;
            mapWithBorders[1][width*2 + 2] = MAZE.MAP_SPACE_WALL;
            for (let r = 2; r < height*2 + 2; r++) {
                mapWithBorders[r][0] = MAZE.MAP_SPACE_WALL;
                mapWithBorders[r][1] = MAZE.MAP_SPACE_FREE;
                mapWithBorders[r][width*2 + 2] = MAZE.MAP_SPACE_WALL;
            }
            
            return mapWithBorders;
        }
        return my.map;
    }

    my.buildBoundingBoxes = function (mapBounds, wall) {
        let boundWidth = mapBounds[0].length;
        let boundHeight = mapBounds.length;
        let boundingBoxes = [];
        
        let boxId = 0;

        // Consolidate columns:
        for (var iMapCol = 0; iMapCol < boundWidth; iMapCol++) {
            for (var iMapRow1 = 0; iMapRow1 < boundHeight; iMapRow1++) {
                if (mapBounds[iMapRow1][iMapCol] === MAZE.MAP_SPACE_WALL) {
                    for (var iMapRow2 = iMapRow1; iMapRow2 <= boundHeight; iMapRow2++) {
                        if (!mapBounds[iMapRow2] || mapBounds[iMapRow2][iMapCol] === MAZE.MAP_SPACE_FREE) {
                            if (iMapRow2 != iMapRow1 + 1) {
                                boundingBoxes.push(
                                    new _boundingBox(
                                        (wall * (iMapCol)),
                                        ((iMapRow1) * wall),
                                        wall,
                                        ((iMapRow2 - iMapRow1) * wall),
                                        boxId
                                    )
                                );
                                boxId++;
                            }
                            iMapRow1 = iMapRow2;
                            break;
                        }
                    }
                }
            }
        }

        // Consolidate rows:
        for (var iMapRow = 0; iMapRow < boundHeight; iMapRow++) {
            for (var iMapCol1 = 0; iMapCol1 < boundWidth; iMapCol1++) {
                if (
                    mapBounds[iMapRow][iMapCol1] === MAZE.MAP_SPACE_WALL 
                    && 
                    (!mapBounds[iMapRow - 1] || (mapBounds[iMapRow - 1][iMapCol1] === MAZE.MAP_SPACE_FREE)) 
                    && 
                    (!mapBounds[iMapRow + 1] || (mapBounds[iMapRow + 1][iMapCol1] === MAZE.MAP_SPACE_FREE))
                ) {
                    for (var iMapCol2 = iMapCol1; iMapCol2 < boundWidth; iMapCol2++) {
                        if ((mapBounds[iMapRow - 1] && mapBounds[iMapRow - 1][iMapCol2] === MAZE.MAP_SPACE_WALL) || 
                            (mapBounds[iMapRow + 1] && mapBounds[iMapRow + 1][iMapCol2] === MAZE.MAP_SPACE_WALL) ||
                            (mapBounds[iMapRow][iMapCol2] === MAZE.MAP_SPACE_FREE)
                        ) {
                            boundingBoxes.push(
                                new _boundingBox(
                                    ((iMapCol1) * wall),
                                    ((iMapRow) * wall),
                                    ((iMapCol2 - iMapCol1) * wall),
                                    wall,
                                    boxId
                                )
                            );
                            boxId++;
                            iMapCol1 = iMapCol2;
                            break;
                        }	
                    }
                }
            }
        }

        return boundingBoxes;
    }

    my.getRandomSpaceByValue = function (map, requiredSpaceValue) {
        let requiredNeighbors = null;
        return getRandomSpaceByValue(map, requiredSpaceValue, requiredNeighbors);
    }
    my.getRandomSpaceByValue = function (map, requiredSpaceValue, requiredNeighbors) {
        let countColumns = map[0].length;
        let countRows = map.length;
        let totalSpaces = countColumns * countRows;
        while (totalSpaces > 0) {
            let randomX = _randomIntFromIntervalInclusive(0, countColumns - 1);
            let randomY = _randomIntFromIntervalInclusive(0, countRows - 1);
            if (map[randomY][randomX] === requiredSpaceValue) {
                // Assume the space is valid:
                let isValidSpace = true;
                // If any neighbors exist, iterate over them;
                if (requiredNeighbors) {
                    requiredNeighbors.forEach(function (neighbor) {
                        if (map[randomY + neighbor.y][randomX + neighbor.x] !== neighbor.spaceValue) {
                            isValidSpace = false;
                            return; // break the forEach;
                        }
                    }, this);
                }
                
                if (isValidSpace === true) {
                    return {
                        "columnIndex": randomX,
                        "rowIndex": randomY
                    };
                }
            }
            totalSpaces--;
        }
        return {
            "columnIndex": null,
            "rowIndex": null
        };
    }

    my.getNodesWithWallUnderneath = function (map) {
        let requireWallUnderneath = [ 
            { "x": 0, "y": 1, "spaceValue": MAZE.MAP_SPACE_WALL } 
        ];
        return my.getValidFreeNodes(map, requireWallUnderneath);
    }

    my.getValidFreeNodes = function (map, requiredNeighbors) {
        let resultNodes = [];
        if (!requiredNeighbors) {
            return resultNodes;
        }
        for (let xColumn = 0; xColumn < map[0].length; xColumn++) {
            for (let yRow = 0; yRow < map.length; yRow++) {
                if (map[yRow][xColumn] === MAZE.MAP_SPACE_FREE) {
                    let isValidSpace = true;
                    requiredNeighbors.forEach(function (neighbor) {
                        if (map[yRow + neighbor.y][xColumn + neighbor.x] !== neighbor.spaceValue) {
                            isValidSpace = false;
                            return; // break the forEach;
                        }
                    }, this);
                    if (isValidSpace) {
                        resultNodes.push(new GridNode(xColumn, yRow, MAZE.MAP_SPACE_FREE))
                    }
                }
            }
        }
        return resultNodes;
    }

    // Finds the farthest node from the given 2 nodes, essentially 
    // forming the largest possible triangle between the three nodes.
    // Takes into account the required neighbor nodes as well, for example a
    // wall node must be below the result node.
    my.getFarthestFreeSpaceTriangle = function (map, node1, node2, nodesWithWallUnderneath) {
        let resultNode = null;
        let graph = new Graph(map);
        let maxAStarTriangleDiff = 0;
        let currentAStarTriangleDiff = 0;
        // for (let xColumn = 0; xColumn < map[0].length; xColumn++) {
        //     for (let yRow = 0; yRow < rowLength; yRow++) {
        //         if (map[yRow][xColumn] === MAZE.MAP_SPACE_FREE) {
        //         }
        //     }
        // }
        nodesWithWallUnderneath.forEach(function (validNode) {
            // if (map[randomY + neighbor.y][randomX + neighbor.x] !== neighbor.spaceValue) {
            //     isValidSpace = false;
            //     return; // break the forEach;
            // }
            let aStar1 = astar.search(
                graph,
                graph.grid[validNode.y][validNode.x],
                graph.grid[node1.y][node1.x]
            );
            let aStar2 = astar.search(
                graph,
                graph.grid[validNode.y][validNode.x],
                graph.grid[node2.y][node2.x]
            );

            currentAStarTriangleDiff = 
                (aStar1.length + aStar2.length) - 
                Math.abs(aStar1.length-aStar2.length);
            if (currentAStarTriangleDiff > maxAStarTriangleDiff) {
                maxAStarTriangleDiff = currentAStarTriangleDiff;
                resultNode = graph.grid[validNode.y][validNode.x];
            }
        }, this);
        return resultNode;
    }

    my.getFarthestFreeSpace = function (map, start) {
        let resultNode = null;
        let graph = new Graph(map);
        let currentMaxAStarPathLength = 0;
        let rowLength = map.length;
        for (let xColumn = 0; xColumn < map[0].length; xColumn++) {
            for (let yRow = 0; yRow < rowLength; yRow++) {
                if (map[yRow][xColumn] === MAZE.MAP_SPACE_FREE) {
                    let currentAStar = astar.search(
                        graph,
                        graph.grid[start.y][start.x],
                        graph.grid[yRow][xColumn]
                    );
                    if (currentAStar.length > currentMaxAStarPathLength) {
                        currentMaxAStarPathLength = currentAStar.length;
                        resultNode = currentAStar[currentAStar.length - 1];
                    }
                }
            }
        }
        return resultNode;
    }

    return my;
}());