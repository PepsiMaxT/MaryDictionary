let dictionary = [];
let tags = [];

document.addEventListener('DOMContentLoaded', async (event) => {
    tags = await definitions.getTags();
    dictionary = createDictionaryFrom(await definitions.getDictionary());

    const selectTagsDropdown = createUncheckedDropList(tags);
    selectTagsDropdown.id = 'tag-search';
    getDropdownBoxButtonFrom(selectTagsDropdown).innerText = 'Select tags';
    document.getElementById('placeholder-dropdown').replaceWith(selectTagsDropdown);

    const dictionaryContainer = document.getElementById('definition-table');
    dictionary.forEach((definition) => {
        dictionaryContainer.appendChild(definition.definitionElement);
    });

    addUpdateFunctionsToSearches();
});

function addUpdateFunctionsToSearches() {
    const originSearch = document.getElementById('origin-search');
    originSearch.addEventListener('input', reloadDictionary); // on input change
    
    const foreignSearch = document.getElementById('foreign-search');
    foreignSearch.addEventListener('input', reloadDictionary); // on input change
    
    const genderSearch = document.getElementById('gender-select');
    genderSearch.addEventListener('change', reloadDictionary); // on gender change
    
    const tagSearch = document.getElementById('tag-search');
    const tagSearchBoxes = tagSearch.getElementsByClassName('dropdown-checkbox');
    Array.from(tagSearchBoxes).forEach((checkbox) => {
        checkbox.addEventListener('change', reloadDictionary); // on a changed selection
    });

    const strictSearchCheck = document.querySelector('.strict-search-check');
    strictSearchCheck.addEventListener('change', reloadDictionary);
}

// Get information about dropdown boxes to make them function
function functionalisePrewrittenDropdowns() {
    var dropdownBoxes = document.getElementsByClassName('dropdown');

    Array.from(dropdownBoxes).forEach((box) => {
        functionaliseDropdown(box);
    });
}

function functionaliseDropdown(dropdown) {
    const btn = getDropdownBoxButtonFrom(dropdown);
    const list = getDropDownListFrom(dropdown);

    btn.addEventListener('click', (event) => {
        event.stopPropagation(); // Stop the click event being registered as the "unfocus" by document

        // Add or remove dropdown content show
        if (list.classList.contains('dropdown-content-show')) {
            list.classList.remove('dropdown-content-show');
            document.removeEventListener('click', closeDropdown)
        } else {
            list.classList.add('dropdown-content-show');
        }

        // Declare the dropdown close detection
        const closeDropdown = (event) => {
            if (!dropdown.contains(event.target)) {
                list.classList.remove('dropdown-content-show');

                // Remove the event from the document
                document.removeEventListener('click', closeDropdown);
            }
        }
        document.addEventListener('click', closeDropdown);
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

    return checkedList;
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
    genderSelector = createGenderButton();
    genderSelector.value = gender;
    metaDataDiv.appendChild(genderSelector);

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
    openListbtn.innerText = 'Tags';
    dropdown.appendChild(openListbtn);

    dropList = document.createElement('div');
    dropList.classList.add('dropdown-content');
    dropdown.appendChild(dropList);

    addNewbtn = document.createElement('button');
    addNewbtn.classList.add('add-new-tag');
    addNewbtn.innerText = 'Add new';
    dropList.appendChild(addNewbtn);

    elements.forEach((element) => {
        addOptionToDropdown(dropdown, element, element, checkedElements.includes(element));
    });

    functionaliseDropdown(dropdown);
    return dropdown;
}

function createGenderButton() {
    const genderSelector = document.createElement('select');
    genderSelector.classList.add('gender-selector');

    genderOptions = ['Masculine', 'Feminine', 'Neuter', 'N/A'];
    genderOptions.forEach((option) => {
        genderOption = document.createElement('option');
        if (option === 'N/A') genderOption.value = option;
        else genderOption.value = option[0];
        genderOption.innerText = option;
        genderSelector.appendChild(genderOption);
    });

    return genderSelector;
}

// Searching through 

function reloadDictionary() {
    originSearchTerm = getOriginSearch();
    foreignSearchTerm = getForeignSearch();
    genderSearchTerm = getGenderSearch();
    tagSearchTerms = getTagSearches();

    dictionary.forEach((entry) => {
        if ((originSearchTerm === '' || arrayContainsWordContainingSubstring(entry.origin, originSearchTerm)) && 
            (foreignSearchTerm === '' || arrayContainsWordContainingSubstring(entry.foreign, foreignSearchTerm)) && 
            (genderSearchTerm === 'any' || entry.gender == genderSearchTerm) &&
            (tagSearchTerms.length === 0 || compareTags(tagSearchTerms, entry.tags))) entry.definitionElement.classList.remove('hide-item');
        else entry.definitionElement.classList.add('hide-item');

    });
}

function getOriginSearch() {
    return document.getElementById('origin-search').value;
}

function getForeignSearch() {
    return document.getElementById('foreign-search').value;
}

function getGenderSearch() {
    return document.getElementById('gender-select').value;
}

function getTagSearches() {
    return getCheckedBoxValuesFrom(document.getElementById('tag-search'));
}

function compareTags(tagsToSearch, tagsList) {
    var strict = document.querySelector('.strict-search-check').checked;
    if (strict) return tagsToSearch.every(element => tagsList.includes(element));
    else return tagsToSearch.some(element => tagsList.includes(element));
}

// General functions
function arrayContainsWordContainingSubstring(array, substring) {
    result = array.some((element) => element.includes(substring));
    return result;
}