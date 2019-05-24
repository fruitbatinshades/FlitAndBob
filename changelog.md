# Version 0.1
## Major refactor for physics updates and box handling. 
**General**
Events now bind to custom event emmiter (`levelEvents`) rather than the scene, this resolves issues after scene restart.

**Boxes**
Changed the way checks are done. Now using `sceneUpdate` to process box handling and rendering when carried.
Added `getRelatives` to box and using that to update other boxes. This resolves an issue where you couldn't pick up a box that was previously under another
Stopped unbinding `sceneUpdate` when a box destructs else you could no longer pick up boxes

**index.js utils**
`getBodiesAround` now takes `typeString` to filter returned bodies
Added `closestOfType` which finds the closest object of `typeString`
Added `getFirst` to `AroundGrid`

