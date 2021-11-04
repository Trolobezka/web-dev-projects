import HACB from "./hacb";
import SvgSword from "./svgSword";

window.addEventListener("load", () => {

    // Set every part and material to default (first option)
    SvgSword.SVG_ID = "svg-sword";

    SvgSword.changePartType("blade-1");
    SvgSword.changePartType("crossguard-1");
    SvgSword.changePartType("grip-1");
    SvgSword.changePartType("pommel-1");

    SvgSword.changeGradMaterial("grad-blade", "wood");
    SvgSword.changeGradMaterial("grad-crossguard", "wood");
    SvgSword.changeGradMaterial("grad-grip", "wood");
    SvgSword.changeGradMaterial("grad-pommel", "wood");

    // Declare sword parts and materials
    // This can be moved outside the load event for access in other parts of the app
    const materials = ["Wood", "Steel", "Gold", "Obsidian", "Diamond"];
    const bladeTypes = ["Type 1", "Type 2", "Type 3"];
    const bladeMats = materials;
    const crossguardTypes = ["Type 1", "Type 2"];
    const crossguardMats = materials;
    const gripTypes = ["Type 1", "Type 2"];
    const gripMats = materials;
    const pommelTypes = ["Type 1", "Type 2", "Type 3"];
    const pommelMats = materials;

    // Create HACBs
    HACB.create("blade-type", bladeTypes).addEventListener("changed", handlePartTypeChange);
    HACB.create("blade-mat", bladeMats, true).addEventListener("changed", handleMaterialChange);
    HACB.create("crossguard-type", crossguardTypes).addEventListener("changed", handlePartTypeChange);
    HACB.create("crossguard-mat", crossguardMats, true).addEventListener("changed", handleMaterialChange);
    HACB.create("grip-type", gripTypes).addEventListener("changed", handlePartTypeChange);
    HACB.create("grip-mat", gripMats, true).addEventListener("changed", handleMaterialChange);
    HACB.create("pommel-type", pommelTypes).addEventListener("changed", handlePartTypeChange);
    HACB.create("pommel-mat", pommelMats, true).addEventListener("changed", handleMaterialChange);
});

function handlePartTypeChange(event) {
    const partType = event["HACB"].wrapper.id.split("-")[0];
    SvgSword.changePartType(partType + "-" + (event["HACB"].newIndex + 1));
}

function handleMaterialChange(event) {
    const partType = event["HACB"].wrapper.id.split("-")[0];
    SvgSword.changeGradMaterial("grad-" + partType, event["HACB"].newValue);
}

/*
Sources I went through:

StackOverflow:
https://stackoverflow.com/questions/2753732/how-to-access-svg-elements-with-javascript
https://stackoverflow.com/questions/51023172/opera-throws-typeerror-cannot-read-property-appendchild-of-null-when-a-objec
https://stackoverflow.com/questions/21667149/how-to-define-private-constructors-in-javascript
https://stackoverflow.com/questions/21117160/what-is-export-default-in-javascript
https://stackoverflow.com/questions/39694407/adding-javascript-type-hints-for-vscode-monaco-intellisence
https://stackoverflow.com/questions/8407622/set-type-for-function-parameters
https://stackoverflow.com/questions/14611995/how-to-specify-an-array-of-objects-as-a-parameter-or-return-value-in-jsdoc
https://stackoverflow.com/questions/23667208/calc-not-working-within-media-queries
https://stackoverflow.com/questions/7415872/change-color-of-png-image-via-css

Other:
https://lospec.com/palette-list/resurrect-64
https://css-tricks.com/snippets/css/complete-guide-grid
https://sebhastian.com/javascript-create-button
https://www.freecodecamp.org/news/css-media-queries-breakpoints-media-types-standard-resolutions-and-more
https://github.com/google/closure-compiler/wiki/Annotating-JavaScript-for-the-Closure-Compiler
https://medium.com/@trukrs/type-safe-javascript-with-jsdoc-7a2a63209b76
https://dmitripavlutin.com/javascript-classes-complete-guide
*/