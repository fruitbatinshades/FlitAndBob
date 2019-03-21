/// <reference path="../../defs/phaser.d.ts" />

/* THIS IS NOT WORKING */

export default class fbisUtils{
    /**
     * Render the currently active checkCollision settings on a body
     * @param {Phaser.GameObjects.Body} object The body to draw collision lines on
     */
    static drawCollisionChecks(object) {
        
        if (!Array.isArray(object)) {
            object = [object];
        }

        for (var i = 0; i < object.length; i++) {
            var entry = object[i];

            if (entry.isParent) {
                var children = entry.getChildren();

                for (var c = 0; c < children.length; c++) {
                    var child = children[c];
                    this.drawCollision(child.body);
                }
            }
            else {
                this.drawCollision(entry.body);
            }
        }
        
    }
    static drawCollision(object) {

        let g = this.getDebugGraphics(object);
        if (!g) {
            console.warn('fbisG found in scene');
        } else {
            g.clear();
            if (object.checkCollision.left) {
                g.lineStyle(5, 0xff0000, 1);
                g.lineBetween(object.left, object.top, object.left, object.bottom);
            }
            if (object.checkCollision.right) {
                g.lineStyle(5, 0x00ff00, 1);
                g.lineBetween(object.right, object.top, object.right, object.bottom);
            }
            if (object.checkCollision.up) {
                g.lineStyle(5, 0x00aaff, 1);
                g.lineBetween(object.left, object.top, object.left + object.width, object.top);
            }
            if (object.checkCollision.down) {
                g.lineStyle(5, 0xffff00, 1);
                g.lineBetween(object.left, object.bottom, object.left + object.width, object.bottom);
            }
        }
    }
    static getDebugGraphics(object) {
        if (object) {
            let s;
            if (object.hasOwnProperty('scene'))
                s = object.scene.scene;
            else if (object.hasOwnProperty('world'))
                s = object.world.scene;
            
            //check if scene has our graphics layer
            if (typeof s === 'undefined') {
                console.error('Scene cannot be infered from the object');
                return;
            }
            let g = s.fbisG;
            if (!g) g = s.add.graphics();

            return g;
        }
    }
    static switchPhysics(object) {
        
    }

    
}