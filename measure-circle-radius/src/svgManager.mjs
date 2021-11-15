export class SVGManager {
    id = "";
    width;
    height;
    viewBox = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    };
    imageContainerID = "image-container";
    points = null;

    get ratio() {
        return this.width / this.height;
    };
    get zoom() {
        return this.width / this.viewBox.width;
    }

    constructor(id, width, height) {
        this.id = id;
        this.width = width;
        this.viewBox.width = width;
        this.height = height;
        this.viewBox.height = height;

        this.points = new SVGPointContainer(this);
    }

    loadImage(url) {
        const svgImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
        return svgImage.new_setAttributes({
            "href": url,
            "href-ns": "http://www.w3.org/1999/xlink",
            "x": "0",
            "y": "0",
            "visibility": "visible"
        }).new_appendInto(`svg#${this.id} g#${this.imageContainerID}`);
    }

    /**
     * Changes x and y of the SVG's viewBox
     * @param {number} dx delta x
     * @param {number} dy delta y
     */
    moveViewBox(dx, dy) {
        this.viewBox.x += dx;
        this.viewBox.y += dy;
        this.updateViewBox();
    }

    /**
     * Changes width and height of the SVG's viewBox,
     * default zooming center is the center of the SVG
     * @param {number} dw delta width
     * @param {number} dh delta height
     * @param {number} rcx relative center x (from 0 to 1)
     * @param {number} rcy relative center y (from 0 to 1)
     */
    zoomViewBox(dw, dh, rcx = 0.5, rcy = 0.5) {
        this.viewBox.x -= dw * rcx;
        this.viewBox.y -= dh * rcy;
        this.viewBox.width += dw;
        this.viewBox.height += dh;
        this.updateViewBox();
        this.points.updateScale();
    }

    zoomViewBox2(zoomAmount) {
        this.zoomViewBox(-1 * zoomAmount, -1 * zoomAmount / this.ratio);
    }

    /**
     * Updates SVG's viewBox attribute with values from SETTINGS object
     */
    updateViewBox() {
        if (this.viewBox.width < 0) {
            this.viewBox.width = 0;
        }
        if (this.viewBox.height < 0) {
            this.viewBox.height = 0;
        }

        const svgElement = document.getElementById(this.id);
        if (svgElement) {
            svgElement.attributes["viewBox"].value =
                this.viewBox.x + " " +
                this.viewBox.y + " " +
                this.viewBox.width + " " +
                this.viewBox.height;
        }
    }
}

export class SVGPointContainer {
    svgManagerReference = null;
    instances = [];
    templateID = "point-template";
    containerID = "points-container";
    defaultScale = 1.5;
    selected = null;
    needsCleanUp = false;

    get currentScale() {
        return this.defaultScale / this.svgManagerReference.zoom;
    }

    constructor(svgManRef) {
        this.svgManagerReference = svgManRef;
    }

    add(x, y) {
        const container = document.querySelector("svg g#" + this.containerID);
        const template = document.querySelector("svg g#" + this.templateID);
        if (container && template) {
            const point = template.cloneNode(true);
            point.removeAttribute("id");
            point.attributes["transform"].value = SVGPoint.createTransform(x, y, this.currentScale);
            this.instances.push(new SVGPoint(point, x, y));
            // point.addEventListener("click", handleSVGPointClick);
            // point.addEventListener('mousedown', handleSVGPointMouseDown, false);
            container.appendChild(point);
            return point;
        }
        return null;
    }

    getOrRemove(index) {
        const point = this.instances[index];
        if (this.needsCleanUp && (point.removed || !document.body.contains(point.element))) {
            console.log("deleting", point);
            this.instances.splice(index, 1);
            return null;
        }
        return point;
    }

    select(point) {
        // Remove "selected" class from currently selected point
        if (this.selected) {
            this.selected.classList.remove("selected");
        }
        // If new point is different then the last one, update selection
        if (point && this.selected != point) {
            this.selected = point;
            this.selected.classList.toggle("selected");
        } else {
            this.selected = null;
        }
    }

    removeSelected() {
        if (this.selected) {
            this.selected.remove();
            this.selected = null;
            this.needsCleanUp = true;
        }
    }

    removeAll() {
        if (this.instances.length > 0) {
            this.instances[0].element.parentNode.textContent = "";
            this.selected = null;
            this.needsCleanUp = true;
        }
    }

    changeScale(scale) {
        for (let i = this.instances.length - 1; i >= 0; i--) {
            const point = this.getOrRemove(i);
            if (point) {
                point.transform = SVGPoint.createTransform(point.x, point.y, scale);
            }
        }
        this.needsCleanUp = false;
    }

    updateScale() {
        this.changeScale(this.currentScale);
    }

    cleanUp() {
        if (this.needsCleanUp) {
            for (let i = this.instances.length - 1; i >= 0; i--) {
                this.getOrRemove(i);
            }
            this.needsCleanUp = false;
        }
    }
}

export class SVGPoint {
    element = null;
    x = 0;
    y = 0;
    removed = false;

    set transform(value) {
        this.element.attributes["transform"].value = value;
    }
    get transform() {
        return this.element.attributes["transform"].value;
    }

    constructor(element, x, y) {
        this.element = element;
        this.x = x;
        this.y = y;
    }

    static createTransform(x, y, scale) {
        return `translate(${x},${y}) scale(${scale})`;
    }
}