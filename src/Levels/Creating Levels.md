# Creating Flit and Bob Levels in Tiled
Maps are created in [Tiled](https://www.mapeditor.org/) ([manual](http://doc.mapeditor.org/en/stable/)) and saved as `json` in the `Levels` folder.

## Map Properties

| Property | Value | Description |
|---|---|---|
| Backgrounds | Pipe seperated names of images in the `Levels\Backgrounds\` folder | `BrickTile.svg|Gnome.svg|WallTile.svg|Clouds.svg` |
| debug | true/false | Whether to display the zone and switch information in your level |

## Layer Properties

Setting these properties on a layer will create the relevant layer type in the game

| Property | Values | Description |
|----------|----------|-----------|
| LayerType | `Static` | Creates a static layer |
| | `Dynamic` | Creates a dynamic layer |
| | `Objects` | Create an object layer |

### Special Layers
Some layers have pre-defined behaviour such as the movable Boxes and switches

| Layer Name | Tiled Layer| Description | Values | 
|----------|--|--------|-----------|
| `Sky` | Object | Adds background images _(walls, clouds)_ |  |
| `Boxes` | Object |Creates the stackable boxes |  |
| `Switches` | Tile | Tiles that fire Actions and Effects | Toggle, ShowHide, Injure |
| `Interaction` | Object |Rectangles that define zones for switches | |

#### Sky Images (Object Layer)
Add a point where the `Name` is the filename of the image and the type is `TileSprite` or `Image`. The image will draw from the bottom left.

| Property | Value | Description |
|---|---|---|
| TileSprite | Name of image in the `Levels\Backgrounds\` folder | The image will scroll with the camera |
| Image | Name of image in the `Levels\Backgrounds\` folder | The image stays at the point |

#### Boxes (object Layer)
Boxes block players and must be moved so that Flit or Bob can access areas by climbing on them. 

You just need to add a tile and set the `Name:Box` and the type to

| Property | Value | Description |
|---|---|---|
| `Name` | `Box` | A tile with a name of `Box` will be converted to a box object |
| `Type` | blank, `Flit` or `Bob` | if this is not blank it will create a box that only Flit/Bob can lift |

#### Switches (Tile Layer)
Switches are the graphical representation of effects and actions. They need to come from the `Components` tileset as we map the tiles to actions in the code. 

They should have a matching rectangle in the `Interaction` layer. This allows us to create multiple targets and areas that are affected.

#### Interaction (Object Layer)

__N.B.__ The interaction layer is tied to the switch layer, when an action is executed it looks at the switch layer for the graphics it should change.

The interaction layer sets up areas that effect a player when they enter it. These are defined in Tiled as  `Rectangle` and have `Custom Properties` that tell the game what to do when a user enters the rectangle or presses space whilst inside it.

| Action | Description | Parameters |
|---|---|---|
| Toggle | Toggles the related zone | |
| ShowHide | Show/Hide related zone | |
| Injure | Injure player | |
| Kill | Kill player | |
| Slow | Slow player movement | |
| Fast | Speed player movement | |
| Block | Block player | TRBL |