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
| `InteractionTiles` | Tile | Tiles that fire Actions and Effects | Toggle, ShowHide, Injure |
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
| `Affect` | `Flit` or `Bob` | if this is not blank it will create a box that only Flit/Bob can lift |
| `Counter` | integer | Number of times the box can be dropped before it disappears |

#### InteractionTiles (Tile Layer)
InteractionTiles are the graphical representation of effects and actions. They need to come from the `Components` tileset as we map the tiles to actions in the code. 

They should have a matching rectangle in the `Interaction` layer. This allows us to create multiple targets and areas that are affected.

The switch tiles are handled differently and are how the player activates/decativates zones.

#### Interaction (Object Layer)

__N.B.__ The `Interaction` layer is tied to the `InteractionTiles` layer, when an action is executed it looks at the `InteractionTiles` layer for the graphics it should change.

The interaction layer sets up areas that effect a player when they enter it. These are defined in Tiled as  `Rectangle` and have `Custom Properties` that tell the game what to do when a user enters the rectangle or presses space whilst inside it.

##### Properties
These are the properties you enter in the tiled editor

| General | Description | Parameters |
|---|---|---|
| Affect | The player affected by the effect | '','Flit,'Bob' |
| Blocks | The player cannot pass through | '','Box','TRBL' |
| GroupKey | Group tiles together for a switch to affect |  |
| Target | Name of zone the action/effect targets |  |
| Action | The action for the zone or group |  |
| Effect | The effect on the player | |
| Transition | The visual effect on the zone or group | |
| ZoneHeight | Used to adjust the zone height (spikes, bridges etc.) | The height is shrunk to the bottom unless `ZoneHeightAt` is supplied |
| ZoneHeightAt | The visual effect on the zone or group | If set to `T` the zone is shrunk towards the top |

##### Values
These are the values for the property in the tiled editor

| Action | Description | Parameters |
|---|---|---|
| **Toggle** | Toggles the related zone | |
| **ShowHide** | Show/Hide related zone | |


| Effect | Description | Parameters |
|---|---|---|
| **Injure** | Injure player | |
| **Kill** | Kill player | |
| **Slow** | Slow player movement | |
| **Fast** | Speed player movement | |
| **Slippy** | Player slides and can only jump |  |

| Transition | Description | Parameters |
|---|---|---|
| **fadeAndDisable** | fades the tiles out and disables the zone |  |
| **toggleVisibility** | toggle tile visibility but leave zone |  |

## Testing Maps
There is an example map, excitingly called `Example.json` that shows how you can set up these simple 
properties to create many effects. There are steps, bridges, blockers, simple zones, and grouped zones. I'm sure you will find ways to create new features :) 

Copy the `base.tmx` and rename it, then open this in Tiled and have a play. 

When you are ready to test it `File > Save` and then `File > Export As` and select the file type `json` and save it to the `Levels` directory.

Run Flit & Bob in your browser and add `?level=YourLevelName` to the url and your map should start up :)

