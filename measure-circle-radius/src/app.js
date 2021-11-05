import "./helpers.js";

class SVGPoint {
    element = null;
    x = 0;
    y = 0;

    set transform(value) {
        this.element.attributes["transform"].value = value;
    }
    get transform() {
        return this.element.attributes["transform"].value;
    }

    static createTransform(x, y, scale) {
        return `translate(${x},${y}) scale(${scale})`;
    }

    constructor(element, x, y) {
        this.element = element;
        this.x = x;
        this.y = y;
    }
}

const SETTINGS = {
    svg: {
        id: "svg-main",
        width: 600,
        height: 600,
        get ratio() {
            return this.width / this.height;
        },
        viewBox: {
            x: 0,
            y: 0,
            width: 600,
            height: 600
        },
        get zoom() {
            return this.width / this.viewBox.width;
        },
        points: {
            instances: [],
            templateID: "point-template",
            containerID: "points-container",
            defaultScale: 1.5,
            selected: null,
            needsCleanUp: false
        }
    },
    image: {
        loaded: false,
        width: 0,
        height: 0
    },
    controls: {
        arrowsIDs: ["up", "left", "right", "down"],
        zoomIDs: ["plus", "minus"],
        movementInverted: false,
        mouseDown: false,
        mouseDownButton: null,
        previousFrameTime: -1,
        mouseWasDown: false
    }
};

// Exposing settings object for browser console
window["SETTINGS"] = SETTINGS;

window.addEventListener("load", () => {

    // Add event listeners to control buttons
    SETTINGS.controls.arrowsIDs.forEach(id => {
        document.querySelector("button#move-" + id).addEventListener("mousedown", handleControlButtonMouseDown);
        document.querySelector("button#move-" + id).addEventListener("mouseup", handleControlButtonMouseUp);
    });
    SETTINGS.controls.zoomIDs.forEach(id => {
        document.querySelector("button#zoom-" + id).addEventListener("mousedown", handleControlButtonMouseDown);
        document.querySelector("button#zoom-" + id).addEventListener("mouseup", handleControlButtonMouseUp);
    });
    document.querySelector("input#move-invert").addEventListener("click", handleCheckboxClick);
    document.querySelector("input#move-invert").click();
    document.querySelector("button#control-delete").addEventListener("click", handleKeyDown);

    // Create image inside the SVG
    const imageURL = require("./test.png");
    const svgImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
    svgImage.new_setAttributes({
        "href": imageURL,
        "href-ns": "http://www.w3.org/1999/xlink",
        "x": "0",
        "y": "0",
        "visibility": "visible"
    }).new_addEventListener("click", handleImageClick)
        .new_addEventListener("load", handleImageLoad)
        .new_appendInto("body svg g#image-container");
});
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

let shiftDown = false;
function handleKeyDown(e) {

    // Decide what to remove (selected / all)
    let remove = false;
    let removeAll = false;
    if (e instanceof KeyboardEvent && e.key.toLocaleLowerCase() === "shift") {
        shiftDown = true;
        return;
    } else if (e instanceof MouseEvent && e.target.id === "control-delete") {
        remove = true;
        if (shiftDown) {
            removeAll = true;
        }
    } else if (e instanceof KeyboardEvent && e.key.toLocaleLowerCase() === "delete") {
        remove = true;
    }

    console.log(remove, removeAll);

    function clean() {
        SETTINGS.svg.points.selected = null;
        SETTINGS.svg.points.needsCleanUp = true;
        pointInstancesCleanUp();
        updateInfoForUser();
    }

    if (removeAll && SETTINGS.svg.points.instances.length > 0) {
        // console.log(SETTINGS.svg.points.instances[0].element.parentNode);
        SETTINGS.svg.points.instances[0].element.parentNode.textContent = "";
        clean();
    } else if (remove && SETTINGS.svg.points.selected) {
        SETTINGS.svg.points.selected.remove();
        clean();
    }

    // if ((e instanceof KeyboardEvent && e.key.toLocaleLowerCase() === "delete") ||
    //     (e instanceof MouseEvent && e.target.id === "control-delete")) {
    //     if (SETTINGS.svg.points.selected) {
    //         SETTINGS.svg.points.selected.remove();
    //         SETTINGS.svg.points.selected = null;
    //         SETTINGS.svg.points.needsCleanUp = true;

    //         pointInstancesCleanUp();
    //         updateInfoForUser();
    //     }
    // }
}

function handleKeyUp(e) {
    if (e instanceof KeyboardEvent && e.key.toLocaleLowerCase() === "shift") {
        shiftDown = false;
    }
}

// Remove deleted points from instance array in settings object
function pointInstancesCleanUp() {
    if (SETTINGS.svg.points.needsCleanUp) {
        for (let i = SETTINGS.svg.points.instances.length - 1; i >= 0; i--) {
            const point = SETTINGS.svg.points.instances[i];
            if (!document.body.contains(point.element)) {
                console.log("deleting", point);
                SETTINGS.svg.points.instances.splice(i, 1);
            }
        }
        SETTINGS.svg.points.needsCleanUp = false;
    }
}

function svgChangePointsScale(scale) {
    for (let i = SETTINGS.svg.points.instances.length - 1; i >= 0; i--) {
        const point = SETTINGS.svg.points.instances[i];
        if (SETTINGS.svg.points.needsCleanUp && !document.body.contains(point.element)) {
            console.log("deleting", point);
            SETTINGS.svg.points.instances.splice(i, 1);
            continue;
        }
        point.transform = SVGPoint.createTransform(point.x, point.y, scale);
    }
    SETTINGS.svg.points.needsCleanUp = false;
}

function svgAddPoint(x, y) {
    const container = document.querySelector("svg g#" + SETTINGS.svg.points.containerID);
    const template = document.querySelector("svg g#" + SETTINGS.svg.points.templateID);
    if (container && template) {
        const currentScale = SETTINGS.svg.points.defaultScale / SETTINGS.svg.zoom;
        const point = template.cloneNode(true);
        point.removeAttribute("id");
        point.attributes["transform"].value = SVGPoint.createTransform(x, y, currentScale);
        SETTINGS.svg.points.instances.push(new SVGPoint(point, x, y));
        point.addEventListener("click", handleSVGPointClick);
        point.addEventListener('mousedown', handleSVGPointMouseDown, false);
        container.appendChild(point);
        return point;
    }
}

function handleSVGPointClick(e) {
    svgPointSelect(e.target.parentNode);
}

function handleSVGPointMouseDown(e) {
    e.preventDefault();
}

function svgPointSelect(point) {
    // Remove "selected" class from currently selected point
    if (SETTINGS.svg.points.selected) {
        SETTINGS.svg.points.selected.classList.remove("selected");
    }
    // If new point is different then the last one, update selection
    if (SETTINGS.svg.points.selected != point && point) {
        SETTINGS.svg.points.selected = point;
        SETTINGS.svg.points.selected.classList.toggle("selected");
    } else {
        SETTINGS.svg.points.selected = null;
    }
}

// https://stackoverflow.com/a/880518/9318084
function clearSelection() {
    if (document.selection && document.selection.empty) {
        document.selection.empty();
    } else if (window.getSelection) {
        var sel = window.getSelection();
        sel.removeAllRanges();
    }
}

/* ================= SVG VIEW MANIPULATION ================= */

/**
 * Changes x and y of the SVG's viewBox
 * @param {number} dx delta x
 * @param {number} dy delta y
 */
function moveViewBox(dx, dy) {
    SETTINGS.svg.viewBox.x += dx;
    SETTINGS.svg.viewBox.y += dy;
    updateViewBox();
}

/**
 * Changes width and height of the SVG's viewBox,
 * default zooming center is the center of the SVG
 * @param {number} dw delta width
 * @param {number} dh delta height
 * @param {number} rcx relative center x (from 0 to 1)
 * @param {number} rcy relative center y (from 0 to 1)
 */
function zoomViewBox(dw, dh, rcx = 0.5, rcy = 0.5) {
    SETTINGS.svg.viewBox.x -= dw * rcx;
    SETTINGS.svg.viewBox.y -= dh * rcy;
    SETTINGS.svg.viewBox.width += dw;
    SETTINGS.svg.viewBox.height += dh;
    updateViewBox();
}

/**
 * Updates SVG's viewBox attribute with values from SETTINGS object
 */
function updateViewBox() {
    if (SETTINGS.svg.viewBox.width < 0) {
        SETTINGS.svg.viewBox.width = 0;
    }
    if (SETTINGS.svg.viewBox.height < 0) {
        SETTINGS.svg.viewBox.height = 0;
    }

    const svgElement = document.getElementById(SETTINGS.svg.id);
    if (svgElement) {
        svgElement.attributes["viewBox"].value =
            SETTINGS.svg.viewBox.x + " " +
            SETTINGS.svg.viewBox.y + " " +
            SETTINGS.svg.viewBox.width + " " +
            SETTINGS.svg.viewBox.height;
    }
}

/* ================= EVENT HANDLERS - CONTROLS ================= */

function handleControlButtonMouseDown(e) {
    if (SETTINGS.controls.mouseDown) {
        return;
    }
    SETTINGS.controls.mouseDown = true;
    SETTINGS.controls.mouseDownButton = e.target;
    window.requestAnimationFrame(moveStep);

    function moveStep(frameTime) {
        if (SETTINGS.controls.mouseDown) {
            if (SETTINGS.controls.previousFrameTime > 0) {
                const e = { target: SETTINGS.controls.mouseDownButton };
                const delta = (frameTime - SETTINGS.controls.previousFrameTime) / 1000;
                handleControlButtonClick(e, delta);
            }
            SETTINGS.controls.previousFrameTime = frameTime;
            window.requestAnimationFrame(moveStep);
        }
    }
}

function handleControlButtonMouseUp(e) {
    SETTINGS.controls.mouseDown = false;
    SETTINGS.controls.mouseDownButton = null;
    SETTINGS.controls.previousFrameTime = -1;
    SETTINGS.controls.mouseWasDown = true;
}

function handleControlButtonClick(e, delta = -1) {
    if (SETTINGS.controls.mouseWasDown) {
        SETTINGS.controls.mouseWasDown = false;
        return;
    }

    const IDParts = e.target.id.split("-");
    const type = IDParts[0];
    const direction = IDParts[1];

    let moveDistance = 200;
    moveDistance = moveDistance / SETTINGS.svg.zoom;
    if (delta > 0) {
        moveDistance *= delta;
    }
    if (SETTINGS.controls.movementInverted) {
        moveDistance *= -1;
    }
    const zoomAmount = 15 / SETTINGS.svg.zoom;

    if (type === "move") {
        switch (direction) {
            case "up":
                moveViewBox(0, moveDistance);
                break;
            case "left":
                moveViewBox(moveDistance, 0);
                break;
            case "right":
                moveViewBox(-1 * moveDistance, 0);
                break;
            case "down":
                moveViewBox(0, -1 * moveDistance);
                break;
            default:
                console.assert("handleControlButtonClick reached unreachable code");
                break;
        }
    } else if (type === "zoom") {
        switch (direction) {
            case "plus":
                zoomViewBox(-1 * zoomAmount, -1 * zoomAmount / SETTINGS.svg.ratio);
                break;
            case "minus":
                zoomViewBox(zoomAmount, zoomAmount / SETTINGS.svg.ratio);
                break;
            default:
                console.assert("handleControlButtonClick reached unreachable code");
                break;
        }
        svgChangePointsScale(SETTINGS.svg.points.defaultScale / SETTINGS.svg.zoom);
    } else {
        console.assert("handleControlButtonClick reached unreachable code");
    }
}

function handleCheckboxClick(e) {
    SETTINGS.controls.movementInverted = e.target.checked;
}

/* ================= EVENT HANDLERS - IMAGE ================= */

function handleImageLoad(e) {
    SETTINGS.image.loaded = true;

    // Read image size
    const bbox = e.target.getBoundingClientRect();
    SETTINGS.image.width = bbox.width;
    SETTINGS.image.height = bbox.height;

    // Read SVG size and update it's viewBox
    SETTINGS.svg.width = parseInt(document.getElementById(SETTINGS.svg.id).attributes["width"].value);
    SETTINGS.svg.height = parseInt(document.getElementById(SETTINGS.svg.id).attributes["height"].value);
    SETTINGS.svg.viewBox.x = -1 * (SETTINGS.svg.width - SETTINGS.image.width) / 2;
    SETTINGS.svg.viewBox.y = -1 * (SETTINGS.svg.height - SETTINGS.image.height) / 2;
    SETTINGS.svg.viewBox.width = SETTINGS.svg.width;
    SETTINGS.svg.viewBox.height = SETTINGS.svg.height;
    updateViewBox();
}

function handleImageClick(e) {
    const pos = e.new_getClickPosition();
    const newX = pos.xOffset * SETTINGS.svg.viewBox.width / SETTINGS.svg.width + SETTINGS.svg.viewBox.x;
    const newY = pos.yOffset * SETTINGS.svg.viewBox.height / SETTINGS.svg.height + SETTINGS.svg.viewBox.y;
    console.log("click position", newX, newY);
    svgAddPoint(newX, newY);
    svgPointSelect(null);

    updateInfoForUser();
}

function updateInfoForUser() {
    let text = "";
    switch (SETTINGS.svg.points.instances.length) {
        case 0:
            text = "You need at least 3 more points!";
            break;
        case 1:
            text = "You need at least 2 more points!";
            break;
        case 2:
            text = "You need at least 1 more point!";
            break;
        default:
            text = "Add more points for better accuracy!";
            break;
    }
    document.getElementById("info-for-user").innerHTML = text;
}