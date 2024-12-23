let dictionary = [];
let tags = [];

document.addEventListener('DOMContentLoaded', async (event) => {
    tags = await definitions.getTags();
    dictionary = createDictionaryFrom(await definitions.getDictionary());

    // Create the drop down to search for tags

    const selectTagsDropdown = createUncheckedDropList(tags);
    selectTagsDropdown.id = 'tag-search';
    getDropdownBoxButtonFrom(selectTagsDropdown).innerText = 'Select tags';

    // Allow more tags to be created

    const addNewbtn = document.createElement('button');
    addNewbtn.classList.add('add-new-tag');
    addNewbtn.innerText = 'Add new';
    dropList = getDropDownListFrom(selectTagsDropdown);
    dropList.appendChild(addNewbtn);
    document.getElementById('placeholder-dropdown').replaceWith(selectTagsDropdown);

    insertAllDefinitionsIntoTable();

    functionaliseAddNewButton();

    addUpdateFunctionsToSearches();
});

function insertAllDefinitionsIntoTable() {
    const dictionaryContainer = document.getElementById('definition-table');
    dictionary.forEach((definition) => {
        insertDefinitionIntoTable(definition, dictionaryContainer);
    });
}

function insertDefinitionIntoTable(definition, table) {
    table.appendChild(definition.definitionElement);
}

function insertDefinitionIntoTableStart(definition, table) {
    table.insertBefore(definition.definitionElement, table.firstChild);
}

function functionaliseAddNewButton() {
    const addNewButton = document.querySelector('.add-new-definition-btn');

    const addNewDefinition = (event) => {
        // Make sure no new additions can be made
        addNewButton.removeEventListener('click', addNewDefinition);

        const newDefinition = createDefinitionObjectFrom({ origin: [], foreign: [], gender: 'N/A', tags: [] }); // Create a new definition entry
        insertDefinitionIntoTableStart(newDefinition, document.getElementById('definition-table')); // Make sure it shows at the top
        switchToEdit(newDefinition); // Make it an editable entry

        // Remove the normal functionalities
        getEditOrSaveButtonFrom(newDefinition.definitionElement).removeEventListener('click', newDefinition.save);
        getDeleteOrCancelButtonFrom(newDefinition.definitionElement).removeEventListener('click', newDefinition.cancel);
        
        // Add the new functionalities
        const overrideSave = (event) => {
            // Remove the functionalities
            getEditOrSaveButtonFrom(newDefinition.definitionElement).removeEventListener('click', overrideSave);
            getDeleteOrCancelButtonFrom(newDefinition.definitionElement).removeEventListener('click', overrideCancel);

            // Add it to the dictionary and save
            // If it fails, add the functionalities back
            dictionary.unshift(newDefinition);
            if (saveEdit(newDefinition)) {
                addNewButton.addEventListener('click', addNewDefinition); // Enable new additions
            } else {
                // Add the functionalities back
                dictionary.splice(0, 1);
                getEditOrSaveButtonFrom(newDefinition.definitionElement).addEventListener('click', overrideSave);
                getDeleteOrCancelButtonFrom(newDefinition.definitionElement).addEventListener('click', overrideCancel);
            }
        }
        getEditOrSaveButtonFrom(newDefinition.definitionElement).addEventListener('click', overrideSave);

        const overrideCancel = (event) => {
            newDefinition.definitionElement.parentNode.removeChild(newDefinition.definitionElement); // Remove the element
            
            // Free up an editing space
            isARowBeingEdited = false;
            rowBeingEdited = null;

            addNewButton.addEventListener('click', addNewDefinition); // Enable new additions
        }
        getDeleteOrCancelButtonFrom(newDefinition.definitionElement).addEventListener('click', overrideCancel);
    }

    addNewButton.addEventListener('click', addNewDefinition );
}

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

    // Declare the dropdown close detection
    const closeDropdown = (event) => {
        if (!dropdown.contains(event.target)) {
            list.classList.remove('dropdown-content-show');

            // Remove the event from the document
            document.removeEventListener('click', closeDropdown);
        }
    }

    btn.addEventListener('click', (event) => {
        // Stop the click event being registered as the "unfocus" by document

        // Add or remove dropdown content show
        if (list.classList.contains('dropdown-content-show')) {
            list.classList.remove('dropdown-content-show');
            event.stopPropagation();
            document.removeEventListener('click', closeDropdown)
        } else {
            list.classList.add('dropdown-content-show');
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
        var newDefinition = createDefinitionObjectFrom(definition);
        fleshedDictionary.push( newDefinition );
        getEditOrSaveButtonFrom(newDefinition.definitionElement).addEventListener('click', newDefinition.edit);
        getDeleteOrCancelButtonFrom(newDefinition.definitionElement).addEventListener('click', newDefinition.delete);
    });

    return fleshedDictionary;
}

function createDefinitionObjectFrom(definition) { 
    var newDefinition = { origin: definition.origin, foreign: definition.foreign, gender: definition.gender, tags: definition.tags, definitionElement: createDefinitionElementFrom(definition) }
    newDefinition.edit = () => { switchToEdit(newDefinition) };
    newDefinition.save = () => { saveEdit(newDefinition) };
    newDefinition.cancel = () => { cancelEdit(newDefinition) };
    newDefinition.delete = () => {
        // Delete the definition
        newDefinition.definitionElement.parentNode.removeChild(newDefinition.definitionElement);
        dictionary.splice(dictionary.indexOf(newDefinition), 1);
    }

    const genderSelector = newDefinition.definitionElement.querySelector('.gender-selector');
    genderSelector.addEventListener('change', () => {
        newDefinition.gender = genderSelector.value;
    });

    const tagDropList = newDefinition.definitionElement.querySelector('.dropdown');
    const tagDropListElements = tagDropList.getElementsByClassName('dropdown-checkbox');
    Array.from(tagDropListElements).forEach((element) => {
        element.addEventListener('change', reloadDictionary);
        element.addEventListener('change', () => { 
            newDefinition.tags = getCheckedBoxValuesFrom(tagDropList);
            dictionaryFunctions.update(getSerializableDictionary(dictionary));
        });
    });

    return newDefinition;
}

function createDefinitionElementFrom(definition) {
    const originWords = definition.origin;
    const foreignWords = definition.foreign;
    const gender = definition.gender;
    const definitionTags = definition.tags;
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

    const definitionDiv = document.createElement('div');
    definitionDiv.classList.add('definition-container');

    const metaDataDiv = document.createElement('div');
    metaDataDiv.classList.add('metadata-container');
    const genderSelector = createGenderButton();
    genderSelector.value = gender;
    metaDataDiv.appendChild(genderSelector);

    const tagDropList = createCheckedDropList(tags, definitionTags);

    metaDataDiv.appendChild(tagDropList); 

    // Add the buttons

    // Actual word definitions
    const originWordsDiv = createWordList(originWords);

    const foreignWordsDiv = createWordList(foreignWords);
    
    const interactionDiv = document.createElement('div');
    interactionDiv.classList.add('interaction-elements-container');
    const editButton = document.createElement('button');
    editButton.innerText = 'Edit';
    editButton.classList.add('definition-btn');

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.classList.add('definition-btn');

    interactionDiv.appendChild(editButton);
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
        wordElement.classList.add('word-element');
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

    genderSelector.addEventListener('change', reloadDictionary);
    genderSelector.addEventListener('change', () => { dictionaryFunctions.update(getSerializableDictionary(dictionary)); });

    return genderSelector;
}

// Editing dictionaries

var isARowBeingEdited = false;
var rowBeingEdited = null;

function switchToEdit(definitionEntry) {
    if (isARowBeingEdited) {
        const cancelButton = getDeleteOrCancelButtonFrom(rowBeingEdited);
        cancelButton.click();
    }

    const originWords = definitionEntry.origin;
    const foreignWords = definitionEntry.foreign;
    const gender = definitionEntry.gender;
    const tags = definitionEntry.tags;

    const definitionElement = definitionEntry.definitionElement;
    isARowBeingEdited = true;
    rowBeingEdited = definitionElement;

    // Replace all the definition divs with input boxes
    const wordListContainers = definitionElement.getElementsByClassName('word-list-container');
    Array.from(wordListContainers).forEach((container) => {
        convertListToInputs(container);
    });

    const editButton = getEditOrSaveButtonFrom(definitionElement);
    editButton.innerText = 'Save';
    editButton.removeEventListener('click', definitionEntry.edit);
    editButton.addEventListener('click', definitionEntry.save);

    const deleteButton = getDeleteOrCancelButtonFrom(definitionElement);
    deleteButton.innerText = 'Cancel';
    deleteButton.removeEventListener('click', definitionEntry.delete);
    deleteButton.addEventListener('click', definitionEntry.cancel);
}

function convertListToInputs(container) {
    // Make an input box remove itself if empty
    const checkForEmptyWord = (event) => {
        if (event.target.value === '') {
            event.target.parentNode.removeChild(event.target);
        }
    }

    const restricInput = (event) => {
        const forbiddenCharacters = ['|', ','];
        if (forbiddenCharacters.includes(event.key)) 
        {
            event.preventDefault();
        }
    };

    // Replace all the word elements with input elements
    const wordElements = container.getElementsByClassName('word-element');
    Array.from(wordElements).forEach((element) => {
        const input = document.createElement('input');
        input.value = element.innerText;
        input.classList.add('word-element');
        input.addEventListener('keydown', restricInput);
        input.addEventListener('blur', checkForEmptyWord);
        container.replaceChild(input, element);
    });

    const newWordInput = document.createElement('input');
    newWordInput.type = 'text';
    newWordInput.classList.add('word-element');

    const onNonEmptyInput = (event) => {
        if (/^[a-zA-Z0-9\s!"#$%&'()*+\-./:;<=>?@[\\\]^_`{}~]$/.test(event.key)) {
            event.target.removeEventListener('keydown', onNonEmptyInput);
            event.target.addEventListener('blur', checkForEmptyWord);
            const replacementNewInput = document.createElement('input');
            replacementNewInput.type = 'text';
            replacementNewInput.classList.add('word-element');
            replacementNewInput.addEventListener('keydown', restricInput);
            replacementNewInput.addEventListener('keydown', onNonEmptyInput);
            container.appendChild(replacementNewInput);
        }
    };

    newWordInput.addEventListener('keydown', restricInput);
    newWordInput.addEventListener('keydown', onNonEmptyInput);
    container.appendChild(newWordInput);
}

function saveEdit(definitionEntry) {
    // Get the new words
    var newOriginWords = Array.from(definitionEntry.definitionElement.getElementsByClassName('word-list-container')[0].getElementsByTagName('input')).map((element) => element.value);
    newOriginWords = newOriginWords.slice(0, -1); // Remove the last element as it is always empty
    var newForeignWords = Array.from(definitionEntry.definitionElement.getElementsByClassName('word-list-container')[1].getElementsByTagName('input')).map((element) => element.value);
    newForeignWords = newForeignWords.slice(0, -1); // Remove the last element as it is always empty

    if (!newOriginWords.length > 0 || !newForeignWords.length > 0) {
        createPopUp(document.getElementById('overarching-container'), 'Both the origin and foreign word lists must have at least one word', [{text: 'OK'}]);
        return false;
    }

    // Create new word lists
    const newOriginDiv = createWordList(newOriginWords);
    const newForeignDiv = createWordList(newForeignWords);

    // Replace the input boxes with the new word elements
    const allWordDivs = definitionEntry.definitionElement.getElementsByClassName('word-list-container');
    allWordDivs[0].replaceWith(newOriginDiv);
    allWordDivs[1].replaceWith(newForeignDiv);

    // Swap the buttons
    const saveButton = getEditOrSaveButtonFrom(definitionEntry.definitionElement);
    saveButton.innerText = 'Edit';
    saveButton.removeEventListener('click', definitionEntry.save);
    saveButton.addEventListener('click', definitionEntry.edit);

    const cancelButton = getDeleteOrCancelButtonFrom(definitionEntry.definitionElement);
    cancelButton.innerText = 'Delete';
    cancelButton.removeEventListener('click', definitionEntry.cancel);
    cancelButton.addEventListener('click', definitionEntry.delete);

    // Update the dictionary
    definitionEntry.origin = newOriginWords;
    definitionEntry.foreign = newForeignWords;

    isARowBeingEdited = false;
    rowBeingEdited = null;
    dictionaryFunctions.update(getSerializableDictionary(dictionary));
    reloadDictionary();

    return true;
}

function cancelEdit(definitionEntry) {
    // Get the original words
    const oldOriginDiv = createWordList(definitionEntry.origin);
    const oldForeignDiv = createWordList(definitionEntry.foreign);

    // Replace the input boxes with the old word elements
    const allWordDivs = definitionEntry.definitionElement.getElementsByClassName('word-list-container');
    allWordDivs[0].replaceWith(oldOriginDiv);
    allWordDivs[1].replaceWith(oldForeignDiv);

    // Swap the buttons
    const saveButton = getEditOrSaveButtonFrom(definitionEntry.definitionElement);
    saveButton.innerText = 'Edit';
    saveButton.removeEventListener('click', definitionEntry.save);
    saveButton.addEventListener('click', definitionEntry.edit);

    const cancelButton = getDeleteOrCancelButtonFrom(definitionEntry.definitionElement);
    cancelButton.innerText = 'Delete';
    cancelButton.removeEventListener('click', definitionEntry.cancel);
    cancelButton.addEventListener('click', definitionEntry.delete);

    isARowBeingEdited = false;
    rowBeingEdited = null;
    reloadDictionary();
}

// Accessing definitionElement elements

function getEditOrSaveButtonFrom(definitionElement) {
    return definitionElement.getElementsByClassName('definition-btn')[0];
};

function getDeleteOrCancelButtonFrom(definitionElement) {
    return definitionElement.getElementsByClassName('definition-btn')[1];
}

// Searching through 

function reloadDictionary() {
    const originSearchTerm = getOriginSearch();
    const foreignSearchTerm = getForeignSearch();
    const genderSearchTerm = getGenderSearch();
    const tagSearchTerms = getTagSearches();

    dictionary.forEach((entry) => {
        if ((originSearchTerm === '' || arrayContainsWordContainingSubstring(entry.origin, originSearchTerm)) && 
                 (foreignSearchTerm === '' || arrayContainsWordContainingSubstring(entry.foreign, foreignSearchTerm)) && 
                 (genderSearchTerm === 'any' || entry.gender == genderSearchTerm) &&
                 (tagSearchTerms.length === 0 || compareTags(tagSearchTerms, entry.tags))) entry.definitionElement.classList.remove('hide-item');
        else if (entry.definitionElement === rowBeingEdited) {
            entry.definitionElement.classList.remove('hide-item');
        }
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

async function createPopUp(divToFreeze, message, buttonList) {
    const popUp = document.createElement('div');
    popUp.classList.add('popup');
    
    const closePopUp = (event) => {
        popUp.parentNode.removeChild(popUp);
        divToFreeze.style.pointerEvents = 'auto';
    }

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('popup-message');
    messageDiv.innerText = message;
    popUp.appendChild(messageDiv);

    const buttonDiv = document.createElement('div');
    buttonList.forEach((buttonElement) => {
        const button = document.createElement('button');
        button.classList.add('popup-button')
        button.innerText = buttonElement.text;
        if (buttonElement.action != null) button.addEventListener('click', buttonElement.action);
        button.addEventListener('click', closePopUp);

        buttonDiv.appendChild(button);
    });
    popUp.appendChild(buttonDiv);

    divToFreeze.parentNode.appendChild(popUp);
    divToFreeze.style.pointerEvents = 'none';
}

function getSerializableDictionary(dictionary) {
    return dictionary.map(entry => ({
        origin: entry.origin,
        foreign: entry.foreign,
        gender: entry.gender,
        tags: entry.tags
    }));
}