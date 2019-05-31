export class Utils{
    /**
 * Pan the camera and then return to player
 * @param {Phaser.Scene} scene
 * @param {Phaser.Geom.Rectangle} rect 
 */
   static panAndReturn(scene, rect, complete) {
        if (!Phaser.Geom.Rectangle.ContainsRect(scene.cameras.main.worldView, rect)) {
            //stop following else the pan X/Y is incorrect
            scene.cameras.main.stopFollow();
            scene.cameras.main.once('camerapancomplete', () => {
                //pan 2 - will be called once when pan 1 completes
                scene.cameras.main.pan(scene.ActivePlayer.x, scene.ActivePlayer.y, 1000, 'Sine.easeInOut', false, (camera, progress, scrollX, scrollY) => {
                    if (progress === 1) {
                        //restore follow
                        scene.cameras.main.startFollow(scene.ActivePlayer);
                        if (complete) complete();
                    }
                });
            });
            //pan 1 - pan to target
            scene.cameras.main.pan(rect.x + rect.width / 2, rect.y + rect.height / 2, 1000, 'Sine.easeInOut');
        }
    }
    /**
  * Get the bodies surrounding the body passed in (Phaser 3.17.*)
  * N.B. The last item found will be the one set as earlier ones are overwritten
  * @param {Phaser.Physics.Arcade.Body} body The body to look around
  * @param {Array} ignore Bodies to ignore when checking
  * @param {string} typeString Only return objects of this type
  * @param {object} directions Object with boolean directions to check, default = {top, left,right, bottom} (topLeft, top, topRight, left, right, bottomLeft, bottom, bottomRight)
  * @param {number} margin The distance to look
  */
   static getBodiesAround(body, ignore, typeString = null, directions, margin = 5) {
        if (!directions || directions === null) {
            directions = { topLeft: false, top: true, topRight: false, left: true, right: true, bottomLeft: false, bottom: true, bottomRight: false };
        }
        ignore = ignore || [];
        let around = body.gameObject.scene.physics.overlapRect(body.x - margin, body.y - margin, body.width + (margin * 2), body.height + (margin * 2));
        let range = new Phaser.Geom.Rectangle(body.x - margin, body.y - margin, body.width + (margin * 2), body.height + (margin * 2));
        let mm = margin - 1;
        let mp = margin + 1;

        let tl = new Phaser.Geom.Rectangle(Math.floor(body.left) - mp, Math.floor(body.top) - mp, margin, margin);
        let tc = new Phaser.Geom.Rectangle(Math.floor(body.left) + 2, Math.floor(body.top) - mp, Math.floor(body.width) - 4, margin);
        let tr = new Phaser.Geom.Rectangle(Math.floor(body.right) + 1, Math.floor(body.top) - mp, margin, margin);

        let cl = new Phaser.Geom.Rectangle(Math.floor(body.left) - mp, Math.floor(body.top) + 2, margin, Math.floor(body.height) - 6);
        //let cc = new Phaser.Geom.Rectangle(Math.floor(body.left), body.top, body.width, body.height);
        let cr = new Phaser.Geom.Rectangle(Math.floor(body.right) + 1, Math.floor(body.top) + 2, margin, Math.floor(body.height) - 6);

        let bl = new Phaser.Geom.Rectangle(Math.floor(body.left) - mp, Math.floor(body.bottom), margin, margin);
        let bc = new Phaser.Geom.Rectangle(Math.floor(body.left) + 2, Math.floor(body.bottom), Math.floor(body.width) - 4, margin);
        let br = new Phaser.Geom.Rectangle(Math.floor(body.right) + 1, Math.floor(body.bottom), margin, margin);

        let grid = new aroundGrid();

        around.forEach((o) => {
            if (o !== body && !ignore.includes(o)) {
                let oRect = new Phaser.Geom.Rectangle(o.x + 1, o.y + 1, o.width - 2, o.height - 2);
                if (typeString === null || o.gameObject.constructor.name === typeString) {
                    if (!Phaser.Geom.Rectangle.ContainsRect(range, oRect)) { //ignore anything we are overlapping
                        if (directions.topLeft && Phaser.Geom.Intersects.RectangleToRectangle(tl, oRect)) { grid.upLeft.push(o); tl.color = 0xFF0000; }
                        if (directions.top && Phaser.Geom.Intersects.RectangleToRectangle(tc, oRect)) { grid.up.push(o); tc.color = 0xFF0000; }
                        if (directions.topRight && Phaser.Geom.Intersects.RectangleToRectangle(tr, oRect)) { grid.upRight.push(o); tr.color = 0xFF0000; }
                        if (directions.left && Phaser.Geom.Intersects.RectangleToRectangle(cl, oRect)) { grid.left.push(o); cl.color = 0xFF0000; }
                        if (directions.right && Phaser.Geom.Intersects.RectangleToRectangle(cr, oRect)) { grid.right.push(o); cr.color = 0xFF0000; }
                        if (directions.bottomLeft && Phaser.Geom.Intersects.RectangleToRectangle(bl, oRect)) { grid.downLeft.push(o); bl.color = 0xFF0000; }
                        if (directions.bottom && Phaser.Geom.Intersects.RectangleToRectangle(bc, oRect)) { grid.down.push(o); bc.color = 0xFF0000; }
                        if (directions.bottomRight && Phaser.Geom.Intersects.RectangleToRectangle(br, oRect)) { grid.downLeft.push(o); br.color = 0xFF0000; }
                    }
                }
            }

            // if (this.debugOn) {
            //   this.rects.push(new Phaser.Geom.Rectangle(o.x , o.top , o.width , o.height ));
            //   this.rects.push(tl);
            //   this.rects.push(tc);
            //   this.rects.push(tr);
            //   this.rects.push(cl);
            //   this.rects.push(cr);
            //   this.rects.push(bl);
            //   this.rects.push(bc);
            //   this.rects.push(br);
            // }
        });
        return grid;
    }

    static getAbove(body, typeString = null, margin = 5) {
        let f = body.gameObject.scene.physics.overlapRect(body.x + margin, body.top - (margin + 1), body.width - (margin * 2), margin);
        //remove the requesting body
        var filtered = f.filter((o) => (typeString === null || o.gameObject.constructor.name === typeString) && o !== body);
        return filtered;
    }
    static getUnder(body, typeString = null, margin = 5) {
        let f = body.gameObject.scene.physics.overlapRect(body.x + margin, body.bottom, body.width - (margin * 2), margin);
        //remove the requesting body
        var filtered = f.filter((o) => (typeString === null || o.gameObject.constructor.name === typeString) && o !== body);
        return filtered;
    }
    static getRight(body, typeString = null, margin = 5) {
        let f = body.gameObject.scene.physics.overlapRect(body.right + margin, body.top + margin, margin, body.height - (margin * 2));
        //remove the requesting body
        return f.filter((o) => (typeString === null || o.gameObject.constructor.name === typeString) && o !== body);
    }
    static getLeft(body, typeString = null, margin = 5) {
        let f = body.gameObject.scene.physics.overlapRect(body.left - (margin + 1), body.top + margin, margin, body.height - (margin * 2));
        //remove the requesting body
        return f.filter((o) => (typeString === null || o.gameObject.constructor.name === typeString) && o !== body);
    }
    /**
     * Get Bodies and World Tiles in the same place as the body
     * @param {Phaser.Physics.Arcade.Body} body the body to look behind
     * @param {integer} margin No of pixels to overlap
     * @param {boolean} onlyBlocking Only return blocking objects
     * @param {string} typeString  Only return objects of this type
     */
    static nothingBehind(body, margin = 2, onlyBlocking = true, typeString = null) {
        let go = body.gameObject;
        let w = ['dummy'];
        if (go.embedded) return true;

        let f = body.gameObject.scene.physics.overlapRect(body.left + margin, body.top + margin, body.width - (margin * 2), body.height - (margin * 2));

        //check world tiles
        if (go.scene.mapLayers && go.scene.mapLayers.World) {
            w = go.scene.map.getTilesWithinShape(new Phaser.Geom.Rectangle(body.left + margin, body.top + margin, body.width - (margin * 2), body.height - (margin * 2)), { isColliding: true }, go.scene.cameras.main, go.scene.mapLayers.World);
        }
        //remove the requesting body
        f = f.filter((o) => (o !== body && (typeString === null || o.gameObject.constructor.name === typeString)));
        if (onlyBlocking) {
            f = f.filter((o) => o.enabled && o.gameObject.hasOwnProperty('Blocks') && o.gameObject.Blocks !== null);
        }

        return f.length === 0 && w.length === 0;
    }
    /**
     * Check if an object is in physics contact, has any objects or colliding tiles under it
     * @param {Phaser.GameObjects.Sprite} gameObject The game object to check
     * @param {number} margin margin overlap to use
     */
    static nothingUnder(gameObject, margin = 5) {
        //return as soon as the first one is true to save processing
        //check normal physics
        let b = gameObject.body;
        if (b.touching.down || b.blocked.down || b.onFloor()) return false;

        //check for other objects
        let u = this.getUnder(gameObject.body, null, margin);
        if (u.length !== 0 && u.filter((x) => x.enable == true).length !== 0) return false;

        //check world tiles
        if (gameObject.scene.mapLayers && gameObject.scene.mapLayers.World) {
            let tr = new Phaser.Geom.Rectangle(b.x + margin, b.bottom, b.width - (margin * 2), margin);
            let tu = gameObject.scene.map.getTilesWithinShape(tr, { isColliding: true }, gameObject.scene.cameras.main, gameObject.scene.mapLayers.World);

            return tu.length === 0;
        }
        return true;
    }
    /**
     * Get the closest body of the type
     * @param {Phaser.Physics.Arcade.Body} body Body to start with
     * @param {string} typeString The type string, only objects of that type will be returned
     * @param {number} maxDistance Maximum number of pixels to check
     */
    static closestOfType(body, typeString, maxDistance = 1000) {
        var bodies = body.world.bodies.entries.filter((b) => b.gameObject.constructor.name === typeString);

        var min = Number.MAX_VALUE;
        var closest = null;
        var x = body.x;
        var y = body.y;

        bodies.forEach(function (target) {
            var distance = Phaser.Math.Distance.Between(x, y, target.x, target.y);
            if (distance <= maxDistance) {
                if (distance < min) {
                    closest = target;
                    min = distance;
                }
            }
        });

        return closest;
    }  
}
/** Grid of objects - returned from getBodiesAround() */
class aroundGrid {
    constructor() {
        //this._last = '';
        this.upLeft = [];
        this.up = [];
        this.upRight = [];
        this.left = [];
        this.center = [];
        this.right = [];
        this.downLeft = [];
        this.down = [];
        this.downRight = [];
    }
    getFirst(typeString) {
        for (var property in this) {
            if (this.hasOwnProperty(property) && this[property] !== null) {
                for (let i = 0; i < this[property].length; i++) {
                    if (this[property][i].gameObject.constructor.name === typeString)
                        return this[property][i];
                }
            }
        }
    }
    // debug() {
    //   let output = '';
    //   Object.entries(this).forEach(([key, value]) => {
    //     if (value && value !== null)
    //       output += `${key}: ${value.gameObject.name}\n`;
    //   });
    //   if (output !== this._last) {
    //     this._last = output;
    //     console.log(this._last)
    //   }
    // }
}