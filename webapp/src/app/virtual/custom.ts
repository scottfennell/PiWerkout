declare var AFRAME;
declare var THREE;

var proxy = new function() {
    this.exportClass = null;
    this.setClass = function(clss) {
        this.exportClass = clss;
        Object.apply(this, clss);
    } 
    this.isVelocityActive = () => this.exportClass.isVelocityActive();
    this.getPositionDelta = () => this.exportClass.getPositionDelta();
    this.getVelocityDelta = () => this.exportClass.getVelocityDelta();
}

AFRAME.registerComponent('custom-controls', proxy);

export class CustomControls {

    constructor() {
        proxy.setClass(this);
    }

    isVelocityActive() {
        return false;
    }

    getPositionDelta() {
        return THREE.Vector3(0,0,0);
    }

    getVelocityDelta() {
        return THREE.Vector3(0,0,0);
    }


}