/*

Provide default values for user session data. These are automatically added
via the `autoStoreData` middleware. Values will only be added to the
session if a value doesn't already exist. This may be useful for testing
journeys where users are returning or logging in to an existing application.

============================================================================

Example usage:

"full-name": "Sarah Philips",

"options-chosen": [ "foo", "bar" ]

============================================================================

*/

module.exports = {
  "highestPageId": 5,
  "action": "",
  "publish": "GOV.UK",
  "authentication": "email",
  "payments": "no",
  "pages": [
    {
      "pageIndex": 0,
      "type": "personName",
      "input": "single-field",
      "title": "no",
      "long-title": "What’s your name?",
      "additional-guidance": "No",
      "questionOptional": "mandatory",
      "questionSaved": "Yes"
    },
    {
      "pageIndex": 1,
      "type": "email",
      "long-title": "What’s your email address?",
      "additional-guidance": "No",
      "questionOptional": "mandatory",
      "questionSaved": "Yes"
    },
    {
      "pageIndex": 2,
      "type": "phone",
      "long-title": "What’s your phone number?",
      "additional-guidance": "No",
      "questionOptional": "questionOptional",
      "questionSaved": "Yes"
    },
    {
      "pageIndex": 3,
      "type": "address",
      "input": [
        "uk-address"
      ],
      "long-title": "Where did you live?",
      "additional-guidance": "No",
      "questionOptional": "mandatory",
      "questionSaved": "Yes"
    },
    {
      "pageIndex": 4,
      "type": "date",
      "input": "no",
      "long-title": "When did you move here?",
      "additional-guidance": "No",
      "questionOptional": "mandatory",
      "questionSaved": "Yes"
    },
    {
      "pageIndex": 5,
      "type": "date",
      "input": "no",
      "long-title": "When did you leave here?",
      "additional-guidance": "No",
      "questionOptional": "questionOptional",
      "questionSaved": "Yes"
    }
  ],
  "status": "Draft",
  "confirmationTitle": "Your form has been submitted",
  "checkAnswersTitle": "Check your answers before submitting your form",
  formTitle: 'Register to vote',
  isQuestionsComplete: 'no'
}
