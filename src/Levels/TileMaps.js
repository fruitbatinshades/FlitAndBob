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
            PressureOn: 6,
            StopRightL: 7,
            StopRightM: 8,
            StopRightR: 9,
            StopLeftL: 10,
            StopLeftM: 11,
            StopLeftR: 12,
            Arrow: 16,
            PlantPot1: 25,
            PlantPot2: 26,
            Stone1: 27,
            Stone2: 28,
            Box1: 29,
            Box2: 30,
            Shroom: 31,
            Fly: 32,
            BigStoneA: 33,
            BigStoneB: 34,
            Honey: 35,
            Fizz: 36
        };
        //annoyinglly this has to come from the spritesheet so do not add firstGid :(
        this.Boxes = [
            this.Component.PlantPot1 - 1,
            this.Component.PlantPot2 - 1,
            this.Component.Stone1 -1,
            this.Component.Stone2 -1,
        ]

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
            this.Component.PressureOff,
            this.Component.PressureOn
        ];
        this.Lights = [
            this.Component.StateOn,
            this.Component.StateOff
        ];
        /** Items that are collectable */
        this.Collectables = [
            this.Component.Fly,
            this.Component.Shroom,
            this.Component.Honey,
            this.Component.Fizz
        ];
    }
    contains(value) {
        return Object.keys(this.Component).find(key => this.Component[key] === value);
    }
    ComponentTilesStops() {
        return this.Stops;
    }
    ComponentTilesSwitches() {
        return this.Switches;
    }
    tileType(value) {
        return {
            isSwitch: this.isSwitch(value),
            isStop: this.isStop(value),
            isLight: this.isLight(value),
            isBlockActivated: this.isBlockActivated(value)
        };
        
    }
    isLight(value) {
        return this.Lights.indexOf(value) !== -1;
    }
    isSwitch(value) {
        return this.Switches.indexOf(value) !== -1;
    }
    isBlockActivated(value) {
        return value === this.Component.PressureOff || value === this.Component.PressureOn;
    }
    isStop(index) {
        return this.Stops.indexOf(index) !== -1;
    }
    /** 
     * Get the next state for the switch or light and update the zone switch status
     */
    switchState(index, zone) {
        //handle switches
        let newIndex = index;
        
        if (this.isSwitch(index)) {
            if (index === this.Component.SwitchOff || index === this.Component.SwitchOn)
                newIndex = (index === this.Component.SwitchOff ? this.Component.SwitchOn : this.Component.SwitchOff);
            if (index === this.Component.PressureOff || index === this.Component.PressureOn)
                newIndex  = (index === this.Component.PressureOff ? this.Component.PressureOn : this.Component.PressureOff);
            
            if (zone) {
                zone.switchOn = (newIndex === this.Component.SwitchOn || newIndex === this.Component.StateOn || newIndex === this.Component.PressureOn);
            }
        } else if (this.isLight(index)) {
            if (index === this.Component.StateOff || index === this.Component.StateOn)
                newIndex = (index === this.Component.StateOff ? this.Component.StateOn : this.Component.StateOff);
        }
        
        return newIndex;
    }
}