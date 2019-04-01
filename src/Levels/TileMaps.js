/**
 * This class holds named mappings and grouping for the tiled tilesets
 */

export default class Enums {
    isPopulated = false;
    constructor(firstgid) {
        if (firstgid) this.isPopulated = true;
        /**
 * The tiles in the component set
 */
        this.Component = {
            SwitchOff: 1,
            SwitchOn: 2,
            StateOn: 3,
            StateOff: 4,
            PressureOff: 5,
            PressueOn: 6,
            StopRightL: 7,
            StopRightM: 8,
            StopRightR: 9,
            StopLeftL: 10,
            StopLeftM: 11,
            StopLeftR: 12
        };
        //remove 1 from the firstgid so the first id matches when we +=
        firstgid--;
        //update the image indexes with the layer firstgid
        for (var propertyName in this.Component) {
            this.Component[propertyName] += firstgid;
        }   
        /**
         * Tiles that activate a stop event
         */
        this.Stops = [
            this.Component.StopRightL,
            this.Component.StopRightM,
            this.Component.StopRightR,
            this.Component.StopLeftL,
            this.Component.StopLeftM,
            this.Component.StopLeftR
        ];
        /**
         * The tiles that activate a switch event
         */
        this.Switches = [
            this.Component.SwitchOff,
            this.Component.SwitchOn,
            this.Component.StateOn,
            this.Component.StateOff,
            this.Component.PressureOff,
            this.Component.PressueOn
        ];
     
    }
    ComponentTilesStops() {
        return this.Stops;
    }
    ComponentTilesSwitches() {
        return this.Switches;
    }
    /** 
     * Get the next state for the switch
     */
    switchState(index) {
        //handle switches
        if (this.Switches.includes(index)) {
            if (index === this.Component.SwitchOff || index === this.Component.SwitchOn)
                return index === this.Component.SwitchOff ? this.Component.SwitchOn : this.Component.SwitchOff;
            if (index === this.Component.StateOff || index === this.Component.StateOn)
                return index === this.Component.StateOff ? this.Component.StateOn : this.Component.StateOff;
            if (index === this.Component.PressureOff || index === this.Component.PressureOn)
                return index === this.Component.PressureOff ? this.Component.PressureOn : this.Component.PressureOff;
            
        }
        return index;
    }
}