/**
 * Static class for changing sword parts and materials in the sword SVG.
 */
export default class SvgSword {
    /**
     * Private class constructor.
     */
    constructor() {
        throw new Error("SvgSword is a static class, no need for new instance.");
    }

    /**
     * @type {string} static ID of sword SVG element
     */
    static SVG_ID = "";

    /**
     * Changes sword part material by changing linearGradient stop classes.
     * Every sword part has gradient with two stops (light and dark color).
     * @param {string} gradID linearGradient ID
     * @param {string} materialName material name
     */
    static changeGradMaterial(gradID, materialName) {
        const svgElement = document.getElementById(SvgSword.SVG_ID);
        const svgDoc = svgElement.contentDocument;
        const gradElement = svgDoc.getElementById(gradID);
    
        // Change class of light stop
        const currMatClassLight = gradElement.children[0].classList[0];
        gradElement.children[0].classList.remove(currMatClassLight);
        gradElement.children[0].classList.add(materialName + "-light");
    
        // Change class of dark stop
        const currMatClassDark = gradElement.children[1].classList[0];
        gradElement.children[1].classList.remove(currMatClassDark);
        gradElement.children[1].classList.add(materialName + "-dark");
    }
    
    /**
     * Changes active sword part by toggling "active" classes on <g> elements
     * inside the SVG.
     * @param {string} partID sword part ID
     */
    static changePartType(partID) {
        const svgElement = document.getElementById(SvgSword.SVG_ID);
        const svgDoc = svgElement.contentDocument;
        const nextPartType = svgDoc.getElementById(partID);
        const wrapper = nextPartType.parentElement;
        const currentPartType = wrapper.querySelector("g.active");
    
        currentPartType.classList.toggle("active");
        nextPartType.classList.toggle("active");
    }

}