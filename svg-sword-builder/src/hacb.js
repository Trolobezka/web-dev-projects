/**
 * Static class for creating HACBs - Horizontal Arrow Combo Boxes.
 */
export default class HACB {
    /**
     * Private class constructor.
     */
    constructor() {
        throw new Error("HACB is a static class, no need for new instance.");
    }

    /**
     * Fills up a HACB div wrapper with two buttons and list of given options.
     * @param {string} wrapperID div wrapper ID
     * @param {Array.<string>} options array of options
     * @param {boolean} addIndices adds indices before options (eg 1., 2., 3., ...)
     * @returns {Element} div wrapper element
     */
    static create(wrapperID, options, addIndices = false) {
        const wrapper = document.getElementById(wrapperID);
        console.assert(wrapper, "HACB.create() failed, cannot find div wrapper with id: " + wrapperID);
        console.assert(options.length > 0, "HACB.create() failed, options length is zero")

        // Create left button
        const btnLeft = document.createElement("button");
        btnLeft.type = "button";
        btnLeft.dataset.dir = "left";
        btnLeft.innerHTML = "&#x25C0";
        wrapper.appendChild(btnLeft);
        btnLeft.addEventListener("click", HACB.#handleClick);

        // Create container for options
        const optionsContainer = document.createElement("div");
        optionsContainer.classList.add("hacb-options");
        wrapper.appendChild(optionsContainer);

        // Create options
        for (let i = 0; i < options.length; i++) {
            const optionDiv = document.createElement("div");
            optionDiv.classList.add("hacb-option");
            optionDiv.dataset.value = options[i].toLowerCase();
            optionDiv.dataset.index = i.toString();
            optionDiv.innerHTML = addIndices ? ((i + 1).toString() + ". ") + options[i] : options[i];
            optionsContainer.appendChild(optionDiv);
        }

        // Set the first option to be active
        optionsContainer.children[0].classList.toggle("hacb-option-active");

        // Create right button
        const btnRight = document.createElement("button");
        btnRight.type = "button";
        btnRight.dataset.dir = "right";
        btnRight.innerHTML = "&#x25B6";
        wrapper.appendChild(btnRight);
        btnRight.addEventListener("click", HACB.#handleClick);

        return wrapper;
    }

    /**
     * Handles click events on HACB left and right buttons. Fires "changed"
     * event on parent HACB div wrapper when user changes the active option.
     */
    static #handleClick() {
        const direction = this.dataset.dir;
        const wrapper = this.parentElement;
        const loop = wrapper.dataset.loop.toLowerCase();
        const currentOption = wrapper.querySelector("div.hacb-options div.hacb-option.hacb-option-active");
        const previousOption = currentOption.previousElementSibling;
        const nextOption = currentOption.nextElementSibling;
        const firstOption = wrapper.querySelector("div.hacb-options div.hacb-option:first-child");
        const lastOption = wrapper.querySelector("div.hacb-options div.hacb-option:last-child");
        const event = new Event("changed");

        // Helper functions for not repeating myself in the IF statement
        function toggleClasses(currentOption, nextOption) {
            currentOption.classList.toggle("hacb-option-active");
            nextOption.classList.toggle("hacb-option-active");
        }
        function dispatchCustomEvent(oldOption, newOption) {
            event["HACB"] = {
                oldElement: oldOption,
                oldValue: oldOption.dataset.value,
                oldIndex: parseInt(oldOption.dataset.index),
                newElement: newOption,
                newValue: newOption.dataset.value,
                newIndex: parseInt(newOption.dataset.index),
                wrapper: wrapper
            };
            wrapper.dispatchEvent(event);
        }

        // Handle left and right buttons separately
        // If loop is false and user cannot move to the next option,
        // "changed" event is not fired
        if (direction === "left" && previousOption) {
            toggleClasses(currentOption, previousOption);
            dispatchCustomEvent(currentOption, previousOption);

        } else if (direction === "right" && nextOption) {
            toggleClasses(currentOption, nextOption);
            dispatchCustomEvent(currentOption, nextOption);

        } else if (direction === "left" && loop === "true") {
            toggleClasses(currentOption, lastOption);
            dispatchCustomEvent(currentOption, lastOption);

        } else if (direction === "right" && loop === "true") {
            toggleClasses(currentOption, firstOption);
            dispatchCustomEvent(currentOption, firstOption);

        } else {
            console.assert(false, "handleClick function failed");
        }
    }
}