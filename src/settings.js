export default class Settings {
    constructor() {
        this.init();
        this.Both = true;
        //Font setting for HUD font
        this.HUDFont = {
            fontSize: '24px',
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
                offsetX: 1,
                offsetY: 1,
                color: '#FFF',
                blur: 1,
                stroke: true,
                fill: true
            }
        };
    }
    init() {
        
    }
}