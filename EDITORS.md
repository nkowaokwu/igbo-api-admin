# Editors' Guidelines

This is a guide that must be followed exactly for any new edits for words and examples are accepted into the main database.

You are working with **production data**, which means that other editors can see your changes. Remember that if you make an accidental edit, everyone will see those changes.

## Before Editing

- **Refresh the page!** There are numerous editors working through these words. There's a high chance that another person has already made an edit to a word that you're about to edit. Refresh the page to avoid any overwriting conflicts.

## Vocabulary

**Editor -** A user that has access to the Igbo API Editor Platform and is able to edit any WordSuggestion, ExampleSuggestion, or GenericWord documents in the database

**Merger** - A user (typically the project owner) that has the ability to not only edit WordSuggestion, ExampleSuggestion, or GenericWord documents but also has the ability to create new Word and Example documents by merging them from suggestion objects.

# The Collections

Here's a list of descriptions of the purpose of each collection in the platform.

## Words

These are the words that the entire world can see. Editors do NOT have any direct writing permissions to these objects.

You should use these words as a **reference** to double check if a word exists

- If you see something that you would like to add or change in a word, you must create a new WordSuggestion

## Examples

These are the examples that the entire world can see. Editors do NOT have any direct writing permissions to these object.

You should use these examples as a **reference** to double check if an example exists

- If you see something that you would like to add or change in an example, you must create a new ExampleSuggestion

## WordSuggestion

WordSuggestions are **user-created** objects that suggest an edit to either a pre-existing word or suggesting a completely new word.

- Fill out the **entire** form in order to maintain consistency throughout the database
- You can directly editor Word Suggestions but it's recommended that you don't. It's best to either just approve or deny it.

## ExampleSuggestion

ExampleSuggestions are **user-created** objects that suggest an editor either a pre-existing example or suggesting a completely new example

- You can directly editor Example Suggestions but it's recommended that you don't. It's best to either just approve or deny it.

## GenericWords

These are words that come from another dictionary source that we want to merge into the database. These are **NOT user generated**, meaning that user cannot create a new GenericWord that will get placed in the database. Instead, a computer script was ran to grab this information from the Internet.

- At the beginning of this project, there's around 55,000 GenericWords that all came from Google Translate
- These are the documents that you definitely want to directly edit. Once you make all your edits you can approve it.

# Scenarios

The follow is a number of different scenarios that will occur while you edit data. Please read through all of these cases since they will come up while your are editing.

## Generic Words

- **Scenario 1: A Generic Word already exists as a Word**

## Word Suggestions

Merged Word Suggestions will either create a new Word once merged **OR** overwrite an existing Word document. Merging doesn't merge a Word Suggestion into an existing Word, instead it overwrites an existing Example.

- **Scenario 1: A new Word Suggestion that suggests adding a new Word**

    You can tell that a Word Suggestion is suggesting to add a new Word because its `originalWordId` field will be empty. The `originalWordId` is the Id of the word that should be edited once the Word Suggestion is merged.

    Here are the steps that you should take:

    - **Step 1: Validate the provided information**

        Make sure that the information the user provides is correct!

        - The word is spelled correctly
        - The word class (or part of speech) is filled out
        - There's at least one definition, and all definitions are correct
        - The provided variations are correct

    - **Step 2: Check to see if Word Suggestion is already a Word**

        Chances are, the user didn't check to see if the word is already in the database.

        - Double check to see if the Word Suggestion word is already a Word
        - If it's already a word, check to see if the user provided new information that could be included in the Word.
            - If so, then **create a new Word Suggestion that includes all the existing Word information along with the new changes**
            - If not, then **deny the new Word Suggestion**

    - **Step 3: Approve or Deny**
        - Once you feel confident about your changes, you can click the Approve or Deny button and move on to the next document.

- **Scenario 2: A new Word Suggestion that suggests editing an existing Word**

    On the platform, you will see a Word Suggestion with an `originalWordId` filled in with an Id. If you see an Id in that slot, that means a user wants to edit an existing Word object, and you need to keep that in mind while making edits.

    Here are the steps that you should take:

    - **Step 1: Check for the user edits**

        When a user expresses they would like to make an edit to an existing word, that Word Suggestion will contain all the Word's information plus the user's edits.

        - Check all the information, especially the user edits

- **Scenario 3: A new Word Suggestion for a Variation of an existing Word**

    Variations are defined as words with the same meaning but just with different spellings. This helps captures the different dialects present in the language.

    Here are the steps that you should take:

    - **Step 1: Validate the provided information**

        Make sure that the information the user provides is correct!

        - The word is spelled correctly
        - The word class (or part of speech) is filled out
        - There's at least one definition, and all definitions are correct
        - The provided variations are correct
        - **If you know which dialect this variation is spoken in, add that information**

    - **Step 2: Check to see if Word Suggestion is already a Word**

        Chances are, the user didn't already check to see if the word is already in the database.

        - Double check to see if the Word Suggestion word is already a Word
        - If it's already a word, check to see if the user provided new information that could be included in the Word.
            - If so, then **create a new Word Suggestion that includes all the existing Word information along with the new changes**
            - If not, then **deny the new Word Suggestion**

## Example Suggestions

Merged Examples Suggestions will either create a new Example once merged **OR** overwrite an existing Example document. Merging doesn't merge a Example Suggestion into an existing Example, instead it overwrites an existing Example.

- **Scenario 1: A new Example Suggestion that suggests adding a new Example**

    You can tell that an Example Suggestion is suggesting to add a new Example because its `originalExampleId` field will be empty. The `originalExampleId` is the Id of the example that should be edited once the Example Suggestion is merged.

    Here are the steps that you should take:

    - **Step 1: Validate the provided information:**

        Make sure that the information the user provides is correct!

        - The Igbo is grammatically correct and makes sense
        - The English translation is fair and understandable
        - The `associatedWordIds` point to the correct words - these Ids point to words that are found in the example

    - **Step 2: Check to see if a similar or identical Example already exists**

        Chances are, the user didn't check to see if the example is already in the database.

        - Double check to see if there's an identical Example

    If you see an Example that looks very similar to the Example Suggestion, as long as they are different, you can approve the Example Suggestion

- **Scenario 2: A new Example Suggestion that suggests editing an existing Example**

    On the platform, you will see a Example Suggestion with an `originalExampleId` filled in with an Id. If you see an Id in that slot, that means a user wants to edit an existing Example object, and you need to keep that in mind while making edits.

    - **Step 1: Check for user edits**

        When a user expresses they would like to make an edit to an existing example, that Example Suggestion will contain all the Example's information plus the user's edits.

        - Check all the information, especially the user edits

# The Processes

## Linking Documents

It's extremely important to link WordSuggestions and ExampleSuggestions to pre-existing words or examples if these suggestions are meant for updating existing words and examples

- This will make everything easier to track in the backend

## Editors' Notes

These are notes that only editors can see. This will help guide any offline conversations to make sure that people know why something has been approved, denied, or even edited.

## Approvals and Denials

What does it mean to approve or deny something?

✅The word or example doesn't exist in the Words collection

✅Every new word and example must include definitions

✅Use Standard Igbo as much as possible when adding or approving words

🆚If you're not 100% confident with accent marks, don't add any! It's easier to go back and add accent marks than to change pre-existing ones.

🔴Deny the wordSuggestion or exampleSuggestions with matching or similar definitions already exist in the Words and Examples collections

🔴**DO NOT** deny any GenericWord, those are words that are meant to be directly edited by editors

## Weekly Merging Meeting

Every Saturday or Sunday mergers will look through all the approved suggestion documents and merge them into the database.

Merging means that a WordSuggestion, ExampleSuggestion, or GenericWord will turn into a Word or Example document, respectively, that the entire world can see.