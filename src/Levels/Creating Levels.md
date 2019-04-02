# Creating Flit and Bob Levels in Tiled
Most things are standard but we are using object properties to create backgrounds and interaction objects
## Layer Properties

Setting these properties on a layer will create the relevant layer type in the game

| Property | Values | Description |
|----------|----------|-----------|
| LayerType | Static | Creates a static layer |
| | Dynamic | Creates a dynamic layer |
| | Objects | Create an object layer |

### Special Layers
Some layers have pre-defined behaviour such as the movable Boxes and switches

| Layer Name | Tiled Layer| Values | Description |
|----------|--|--------|-----------|
| Sky | Object |Adds background images | TileSprite or Image |
| Boxes | Object |Creates the stackable boxes |  |
| Switches | Tile | Tiles that fire Actions and Effects | Toggle, ShowHide, Injure |
| Interaction | Object |Rectangles that define zones for switches | The rectangles should be over the switch tiles|

#### Sky Images
Add a point where the `Name` is the filename of the image and the type is `TileSprite` or `Image`. The image will draw from the bottom left.

#### Boxes
Boxes are a key feature. You just need to add a tile and set the `Name:Box`

#### Switches
Switches are the graphical representation of effects and actions. They need to come from the `Components` tileset as we map the tiles to actions in the code. 

They should have a matching rectangle in the `Interaction` layer. This allows us to create multiple targets and areas that are affected.

#### Interaction

| Action | Description | Parameters |
|---|---|---|
| Toggle | Toggles the related zone | |
| ShowHide | Show/Hide related zone | |
| Injure | Injure player | |
| Kill | Kill player | |
| Slow | Slow player movement | |
| Fast | Speed player movement | |
| Block | Block player | TRBL |