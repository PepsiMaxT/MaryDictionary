document.addEventListener('DOMContentLoaded', (event) => {
    functionaliseDropdowns();
});

// Get information about dropdown boxes to make them function
function functionaliseDropdowns() {
    var dropdownBoxes = document.getElementsByClassName('dropdown');
    console.log(dropdownBoxes);

    Array.from(dropdownBoxes).forEach((box) => {
        const btn = getDropdownBoxButtonFrom(box);
        const list = getDropDownListFrom(box);

        btn.addEventListener('click', (event) => {
            event.stopPropagation(); // Stop the click event being registered as the "unfocus" by document

            // Add or remove dropdown content show
            if (list.classList.contains('dropdown-content-show')) {
                list.classList.remove('dropdown-content-show');
            } else {
                list.classList.add('dropdown-content-show');
            }

            // Declare the dropdown close detection
            const closeDropdown = (event) => {
                if (!box.contains(event.target)) {
                    list.classList.remove('dropdown-content-show');
                }

                // Remove the event from the document
                document.removeEventListener('click', closeDropdown);
            }
            document.addEventListener('click', closeDropdown);
        });
    });
}

function addOptionToDropdown(dropdown, value, label) {
    const dropdownList = dropdown.querySelector('.dropdown-content'); // Get the actual list

    const newLabel = document.createElement('label'); // New container label to name
    
    const newItem = document.createElement('input'); // Adding all innerHTML of the new checkbox
    newItem.type = "checkbox";
    newItem.name = "tag";
    newItem.value = value;
    newItem.classList.add('dropdown-checkbox');

    newLabel.appendChild(newItem);
    newLabel.appendChild(document.createTextNode(label));

    const addButton = dropdown.querySelector('#add-new-tag');
    dropdownList.insertBefore(newLabel, addButton); // Keep the add new button at the end
}

function getDropdownBoxButtonFrom(box) {
    return box.querySelector('.dropdown-box-button');
}

function getDropDownListFrom(box) {
    return box.querySelector('.dropdown-content');
}

function getCheckedBoxValuesFrom(dropdown) {
    const boxes = dropdown.getElementsByClassName('dropdown-checkbox');

    var checkedList = [];
    Array.from(boxes).forEach((checkbox) => {
        if (checkbox.checked) checkedList.push(checkbox.value);
    });
}