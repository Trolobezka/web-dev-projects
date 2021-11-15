import "./helpers.js";
import { SVGManager } from "./svgManager.mjs";

const SETTINGS = {
    svg: null,
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

    SETTINGS.svg = new SVGManager("svg-main", 600, 600);

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
    SETTINGS.svg.loadImage(require("./test.png"))
        .new_addEventListener("click", handleImageClick)
        .new_addEventListener("load", handleImageLoad);
});
window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);

let shiftDown = false;
function handleKeyDown(e) {

    // Decide what to remove (selected or all)
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

    function clean() {
        SETTINGS.svg.points.cleanUp();
        updateInfoForUser();
    }

    if (removeAll) {
        SETTINGS.svg.points.removeAll();
        clean();
    } else if (remove) {
        SETTINGS.svg.points.removeSelected();
        clean();
    }
}

function handleKeyUp(e) {
    if (e instanceof KeyboardEvent && e.key.toLocaleLowerCase() === "shift") {
        shiftDown = false;
    }
}

function handleSVGPointClick(e) {
    SETTINGS.svg.points.select(e.target.parentNode);
}

function handleSVGPointMouseDown(e) {
    e.preventDefault();
}

// https://stackoverflow.com/a/880518/9318084
// function clearSelection() {
//     if (document.selection && document.selection.empty) {
//         document.selection.empty();
//     } else if (window.getSelection) {
//         var sel = window.getSelection();
//         sel.removeAllRanges();
//     }
// }

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
        let dx = 0;
        let dy = 0;
        switch (direction) {
            case "up":
                dy = moveDistance;
                break;
            case "left":
                dx = moveDistance;
                break;
            case "right":
                dx = -1 * moveDistance;
                break;
            case "down":
                dy = -1 * moveDistance;
                break;
            default:
                console.assert("handleControlButtonClick reached unreachable code");
                break;
        }
        SETTINGS.svg.moveViewBox(dx, dy);
    } else if (type === "zoom") {
        let zoomDirection = 1;
        switch (direction) {
            case "plus":
                zoomDirection = 1;
                break;
            case "minus":
                zoomDirection = -1;
                break;
            default:
                console.assert("handleControlButtonClick reached unreachable code");
                break;
        }
        SETTINGS.svg.zoomViewBox2(zoomDirection * zoomAmount);
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
    SETTINGS.svg.updateViewBox();
}

function handleImageClick(e) {
    const pos = e.new_getClickPosition();
    const newX = pos.xOffset * SETTINGS.svg.viewBox.width / SETTINGS.svg.width + SETTINGS.svg.viewBox.x;
    const newY = pos.yOffset * SETTINGS.svg.viewBox.height / SETTINGS.svg.height + SETTINGS.svg.viewBox.y;
    console.log("click position", newX, newY);

    SETTINGS.svg.points.select(null);
    const point = SETTINGS.svg.points.add(newX, newY);
    point.addEventListener("click", handleSVGPointClick);
    point.addEventListener('mousedown', handleSVGPointMouseDown, false);

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