export default class Settings {
    constructor() {
        this.init();
        this.Both = true;
        //Font setting for HUD font
        this.HUDFont = {
            fontSize: '30px',
            strokeThickness: 1,
            fill: '#ffffff',
            shadow: {
                offsetX: 1,
                offsetY: 1,
                color: '#000',
                blur: 2,
                stroke: true,
                fill: false
            }
        };
        this.debugFont = {
            fontSize: '16px',
            fill: '#000',
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#aaa',
                blur: 2,
                stroke: true,
                fill: true
            }
        };
    }
    init() {
        
    }
}