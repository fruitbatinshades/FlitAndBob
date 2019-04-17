# Creating Flit and Bob Levels in Tiled
Maps are created in [Tiled](https://www.mapeditor.org/) ([manual](http://doc.mapeditor.org/en/stable/)) and saved as `json` in the `Levels` folder.

## Map Properties

| Property | Value | Description |
|---|---|---|
| Backgrounds | Pipe seperated names of images in the `Levels\Backgrounds\` folder | `BrickTile.svg|Gnome.svg|WallTile.svg|Clouds.svg|Tools.svg` |
| debug | true/false | Whether to display the zone and switch information in your level |

## Layer Properties

Setting these properties on a layer will create the relevant layer type in the game

| Property | Values | Description |
|----------|----------|-----------|
| LayerType | `Static` | Creates a static layer | Just for images (background, over top etc.|
| | `Dynamic` | Creates a dynamic layer | Used only for the Coins and InteractionTiles |
| | `Objects` | Create an object layer | Used only for Boxes and Interaction |

### Special Layers
Some layers have pre-defined behaviour such as the movable Boxes and switches

| Layer Name | Tiled Layer| Description |
|----------|--|--------|
| `Sky` | Object | Adds background images _(walls, clouds)_ |
| `Boxes` | Object |Creates the stackable boxes | 
| `InteractionTiles` | Tile | Tiles that fire Actions and Effects |
| `Interaction` | Object |Rectangles that define zones for switches |

#### Sky Images (Object Layer)
Add a Tiled `point` where the `Name` is the filename of the image and the type is `TileSprite` or `Image`. The image will draw from the bottom left.

| Property | Value | Description |
|---|---|---|
| TileSprite | Name of image in the `Levels\Backgrounds\` folder | The image will scroll with the camera (use for background) |
| Image | Name of image in the `Levels\Backgrounds\` folder | The image stays at the point (use for features) |

#### Boxes (object Layer)
Boxes block players and must be moved so that Flit or Bob can access areas by climbing on them. 

You just need to add a tile and set the `Name:Box` and `Affects` to '', 'flit','bob'

| Property | Value | Description |
|---|---|---|
| `Name` | `Box` | A tile with a name of `Box` will be converted to a box object |
| `Affect` | '', `Flit` or `Bob` | if this is not blank it will create a box that only Flit/Bob can lift |
| `Counter` | integer | Number of times the box can be dropped before it disappears |

#### InteractionTiles (Tile Layer)
InteractionTiles are the graphical representation of effects and actions. They need to come from the `Components` tileset as we map the tiles to actions in the code. 

They should have a matching Tiled rectangle in the `Interaction` layer. This allows us to create multiple targets and areas that are affected. The switch tiles are handled differently and are how the player activates/decativates zones.

#### Interaction (Object Layer)

__N.B.__ The `Interaction` layer is tied to the `InteractionTiles` layer, when an action is executed it looks at the `InteractionTiles` layer for the graphics it should change.

The interaction layer sets up areas that effect a player when they enter it. These are defined in Tiled as  `Rectangle` and have `Custom Properties` that tell the game what to do when a user enters the rectangle or presses space whilst inside it.

##### Properties
These are the properties you enter in the tiled editor

| General | Description | Parameters |
|---|---|---|
| `Affect` | The player affected by the effect | '','Flit,'Bob' |
| `Blocks` | The player cannot pass through | '','Box','TRBL' |
| `GroupKey` | Group tiles together for a switch to affect | A key is used to group zones together  |
| `Target` | Name of zone the action/effect targets | The name of a single zone |
| `Action` | The action for the zone or group |  |
| `Effect` | The effect on the player | The name of the action |
| `Transition` | The visual effect on the zone or group | The name of the transition |
| `ZoneHeight` | Used to adjust the zone height (spikes, bridges etc.) | The height is shrunk to the bottom unless `ZoneHeightAt` is supplied |
| `ZoneHeightAt` | Where the height is adjusted, top or bottom | If set to `T` the zone is shrunk towards the top, default is bottom |

##### Values
These are the values for the property in the tiled editor

| Action | Description | Parameters |
|---|---|---|
| `Toggle` | Toggles the related zone | |
| `ShowHide` | Show/Hide related zone | |

| Effect | Description | Parameters | Target |
|---|---|---|---|
| `Injure` | Injure player |  | `Affect` |
| `Kill` | Kill player | | `Affect` |
| `Slow` | Slow player movement | | `Affect` |
| `Fast` | Speed player movement | | `Affect` |
| `Slippy` | Player slides and can only jump |  | `Affect` |

| Transition | Description | Parameters | Target |
|---|---|---|---|
| `fadeAndDisable` | fades the tiles out and disables the zone |  | `GroupKey` OR `Target` |
| `toggleVisibility` | toggle tile visibility but leave zone |  | `GroupKey` OR `Target` |
| more soon...| | |

#### Various other layers
There are other layers that are used purely for decoration so you can multiple tiles in the same place, such as dirt > grass > flowers

## Testing Maps
There is an example map, excitingly called `Example.json` that shows how you can set up these simple 
properties to create many effects. There are steps, bridges, blockers, simple zones, and grouped zones. I'm sure you will find ways to create new features :) 

Copy the `base.tmx` and rename it, then open this in Tiled and have a play. 

When you are ready to test it `File > Save` and then `File > Export As` and select the file type `json` (Export as json 1.1 in tiled 1.2.3 onwards) and save it to the `Levels` directory.

Run Flit & Bob in your browser and add `?level=YourLevelName` to the url and your map should start up :)

# Something going wrong?
If the zones and switches are not doing what you expect, check the properties are correct. 

If you have `Target` and `GroupKey` both set you will get issues as they conflict atm.