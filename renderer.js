let dictionary = [];
let tags = [];

document.addEventListener('DOMContentLoaded', async (event) => {
    functionalisePrewrittenDropdowns();
    tags = await definitions.getTags();
    dictionary = createDictionaryFrom(await definitions.getDictionary());
    console.log(dictionary);
    console.log(tags);
});

// Get information about dropdown boxes to make them function
function functionalisePrewrittenDropdowns() {
    var dropdownBoxes = document.getElementsByClassName('dropdown');

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

function addOptionToDropdown(dropdown, value, label, checkedState) {
    const dropdownList = dropdown.querySelector('.dropdown-content'); // Get the actual list

    const newLabel = document.createElement('label'); // New container label to name
    
    const newItem = document.createElement('input'); // Adding all innerHTML of the new checkbox
    newItem.type = "checkbox";
    newItem.name = "tag";
    newItem.value = value;
    newItem.classList.add('dropdown-checkbox');
    newItem.checked = checkedState;

    newLabel.appendChild(newItem);
    newLabel.appendChild(document.createTextNode(label));

    const addButton = dropdown.querySelector('.add-new-tag');
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

// Manage the dictionary elements

function createDictionaryFrom(dictionary) {
    var fleshedDictionary = [];
    
    dictionary.forEach((definition) => 
    {
        fleshedDictionary.push( { origin: definition.origin, foreign: definition.foreign, gender: definition.gender, tags: definition.tags, definitionElement: createDefinitionElementFrom(definition) } );
    });

    return fleshedDictionary;
}

function createDefinitionElementFrom(definition) {
    originWords = definition.origin;
    foreignWords = definition.foreign;
    gender = definition.gender;
    definitionTags = definition.tags;
    /*
    <div class="definition-container">
        <div class="metadata-container">

        </div>
        <div class="word-list-container">
            <!-- List of origin words -->
        </div>
        <div class="word-list-container">
            <!-- List of origin words -->
        </div>
        <div class="interaction-elements-container">
            <!-- Edit and delete button -->
        </div>
    </div>  
    */

    definitionDiv = document.createElement('div');
    definitionDiv.classList.add('definition-container');

    metaDataDiv = document.createElement('div');
    metaDataDiv.classList.add('metadata-container');
    metaDataDiv.appendChild(createGenderButton());

    tagDropList = createCheckedDropList(tags, definitionTags);
    metaDataDiv.appendChild(tagDropList); 

    // Add the buttons

    // Actual word definitions
    originWordsDiv = createWordList(originWords);

    foreignWordsDiv = createWordList(foreignWords);
    
    interactionDiv = document.createElement('div');
    interactionDiv.classList.add('interaction-elements-container');
    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.classList.add('definition-btn');

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.classList.add('definition-btn');

    interactionDiv.appendChild(saveButton);
    interactionDiv.appendChild(deleteButton);

    // Add the buttons

    definitionDiv.appendChild(metaDataDiv);
    definitionDiv.appendChild(originWordsDiv);
    definitionDiv.appendChild(foreignWordsDiv);
    definitionDiv.appendChild(interactionDiv);

    return definitionDiv;
}

function createWordList(words) 
{
    listContainer = document.createElement('div');
    listContainer.classList.add('word-list-container');

    words.forEach((word) => {
        wordElement = document.createElement('div');
        wordElement.innerText = word;
        listContainer.appendChild(wordElement);
    });

    return listContainer;
}

function createUncheckedDropList(elements) {
    return createCheckedDropList(elements, []);
}

function createCheckedDropList(elements, checkedElements) {
    dropdown = document.createElement('div');
    dropdown.classList.add('dropdown');

    openListbtn = document.createElement('button');
    openListbtn.classList.add('dropdown-box-button');
    dropdown.appendChild(openListbtn);

    openListbtn.addEventListener('click', (event) => {
        event.stopPropagation(); // Stop the click event being registered as the "unfocus" by document

        // Add or remove dropdown content show
        if (dropList.classList.contains('dropdown-content-show')) {
            dropList.classList.remove('dropdown-content-show');
        } else {
            dropList.classList.add('dropdown-content-show');
        }

        // Declare the dropdown close detection
        const closeDropdown = (event) => {
            if (!dropdown.contains(event.target)) {
                dropList.classList.remove('dropdown-content-show');
            }

            // Remove the event from the document
            document.removeEventListener('click', closeDropdown);
        }
        document.addEventListener('click', closeDropdown);
    });

    dropList = document.createElement('div');
    dropList.classList.add('dropdown-content');
    dropdown.appendChild(dropList);

    addNewbtn = document.createElement('button');
    addNewbtn.class = 'add-new-tag';
    addNewbtn.innerText = 'Add new';

    elements.forEach((element) => {
        addOptionToDropdown(dropdown, element.value, element.label, checkedElements.includes(element.value));
    });

    return dropList;
}

function createGenderButton() {
    const genderSelector = document.createElement('select');
    genderSelector.classList.add('gender-selector');

    genderOptions = ['Masculine', 'Feminine', 'Neuter', 'N/A'];
    genderOptions.forEach((option) => {
        genderOption = document.createElement('option');
        genderOption.value = () => 
        {
            if (option === 'N/A') return option;
            else return option[0].toUpperCase();
        };
        genderOption.innerText = option;
        genderSelector.appendChild(genderOption);
    });

    return genderSelector;
}