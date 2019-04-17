# Code structure
Quick notes to explain the general concepts behind the code

## Interaction.js
The main physics and UI effects are processed here.

`actions`,`effects` and `transitions` are like a dictionary where the property name from Tiled is mapped to the function that processes it.
`action()` is called by the rest of the code to fire the actions,effects and transitions.

If a zone is marked as `Blocks` or `Blocks=Box` the constructor creates the physics associated with it.

## InteractionZone.js
Interaction Zones are used to react when the player or a box enters it. They map the properties from the tiled map and process themselves.

## Level.js
Processes the map and creates the Phaser objects
Handles the player interaction with the world.

## TileMaps.js
Maps the component tiles to strings, handling `firstgid` as this changes when people edit maps in Tiled.
Contains utility methods to decide what a tile is (switch, block activated, light etc.)
