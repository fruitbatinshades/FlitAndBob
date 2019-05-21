
# Phaser notes

## Tile collision
`platforms.forEachTile((tile: Phaser.Tilemaps.Tile) => {tile.collideLeft = false; tile.collideRight = false; tile.collideDown = false});`

## custom separation

```javascript
function separate (immovableGameObj, movableGameObj) {
  var b1 = movableGameObj.body;
  var b2 = immovableGameObj.body;

  // Positive values indicate an overlap
  var dx1 = b1.right - b2.left; // at left edge of b2
  var dx2 = b2.right - b1.left; // at right edge of b2
  var dy1 = b1.bottom - b2.top; // at top edge of b2
  var dy2 = b2.bottom - b1.top; // at bottom edge of b2

  // Ignore negative values
  if (dx1 < 0) dx1 = Infinity;
  if (dx2 < 0) dx2 = Infinity;
  if (dy1 < 0) dy1 = Infinity;
  if (dy2 < 0) dy2 = Infinity;

  // Find smallest overlap
  var min = Math.min(dx1, dx2, dy1, dy2);

  // Move to nearest edge
  if (dx1 === min) {
    b1.x -= min;
  } else if (dx2 === min) {
    b1.x += min;
  } else if (dy1 === min) {
    b1.y -= min;
  } else {
    b1.y += min;
  }
}
```

## Grid Align??
```javascript
Phaser.Actions.GridAlign(gameObjects, {
    width: -1,
    height: -1,
    cellWidth: 1,
    cellHeight: 1,
    position: Phaser.Display.Align.TOP_LEFT,
    x: 0,
    y: 0
});
```

## change random tile

```javascript
getRandomMatrixItem(arr) {
    var random1 = Math.floor((Math.random() * (arr.length)));
    return arr[random1][Math.floor((Math.random() * (arr[random1].length)))];
}

let randomTile;
let changedTile = false;
do {
    //get a random tile
    randomTile = this.getRandomMatrixItem(this.mapLayers.World.layer.data);
    //check its empty, else keep going
    if (randomTile.index === -1) {
        randomTile.index = this.switchIds.Component.Fly;
        //we found an empoty tile and changed it
        changedTile = true;
        break;
    }
} while(!changedTile)
```