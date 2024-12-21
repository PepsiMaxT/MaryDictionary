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

function getCheckedBoxValuesFrom(dropdown) {
    const boxes = dropdown.getElementsByClassName('dropdown-checkbox');

    var checkedList = [];
    Array.from(boxes).forEach((checkbox) => {
        if (checkbox.checked) checkedList.push(checkbox.value);
    });
}

function getDropdownBoxButtonFrom(box) {
    return box.querySelector('.dropdown-box-button');
}

function getDropDownListFrom(box) {
    return box.querySelector('.dropdown-content');
}