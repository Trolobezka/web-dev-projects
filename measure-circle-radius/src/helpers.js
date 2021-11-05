SVGElement.prototype.new_setAttributes = function (attributes) {
    console.assert(attributes, "svgAddAttributes failed, attributes must be defined");

    let skipNext = false;
    for (const [key, value] of Object.entries(attributes)) {
        if (skipNext) {
            skipNext = false;
            continue;
        }
        const nsKey = key + "-ns";
        let ns = null;
        if (nsKey in attributes) {
            ns = attributes[nsKey];
            skipNext = true;
        }
        this.setAttributeNS(ns, key, value);
    }

    return this;
};

SVGElement.prototype.new_addEventListener = function (e, f) {
    this.addEventListener(e, f);
    return this;
}

SVGElement.prototype.new_appendInto = function (target) {

    let destination = null;
    if (typeof(target) === "string") {
        destination = document.querySelector(target);
    } else if (target instanceof SVGElement) {
        destination = target;
    }
    
    if (destination) {
        destination.appendChild(this);
    } else {
        throw new Error("Cannot find target element: " + target);
    }

    return this;
}

PointerEvent.prototype.new_getClickPosition = function () {
    return {
        // Viewport
        x: this.x,
        y: this.y,
        xClient: this.clientX,
        yClient: this.clientY,
        // Element
        xOffset: this.offsetX,
        yOffset: this.offsetY,
        xLayer: this.layerX,
        yLayer: this.layerY,
        // Page
        xPage: this.pageX,
        yPage: this.pageY,
    };
}