declare var AFRAME;
declare var THREE;


AFRAME.registerComponent('custom-controls', {
    isVelocityActive: function () {
        return Math.random() < 0.25;
    },
    getPositionDelta: function () {
        return new THREE.Vector3(0, 0, 0);
    },
    getVelocityDelta: function () {
        return new THREE.Vector3(0, 0.1, 0);
    }
});

export class CustomControls {

}