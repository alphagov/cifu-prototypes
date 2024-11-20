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

  // Insert values here

  highestPageId: 0,
  pages: [],

  highestGroupId: 0,
  groups: [],

  pagesOrder: [],

  action: '',
  publish: 'GOV.UK',
  authentication: 'email',
  payments: 'no',
  status: 'Draft',
  confirmationTitle: 'Your form has been submitted',
  checkAnswersTitle: 'Check your answers before submitting your form',

  personNameQuestionHint: 'Ask the question the way you would in person. For example, ‘What’s your name?’',
  personNameHintHint: 'You can add a short hint to help people answer the question. For example, you might need to ask people to enter their name as it’s written on an official document such as a passport or driving licence.',
  personNameInputTypeTitle: 'Name fields',

  companyNameQuestionHint: 'Ask the question the way you would in person. For example, ‘What’s the name of the organisation?’',
  companyNameHintHint: 'You can add a short hint to help people answer the question. For example, you might need to ask people to enter the registered name of their company.',

  emailQuestionHint: 'Ask the question the way you would in person. For example, ‘What’s your email address?’',
  emailHintHint: 'You could use hint text to tell people how you’ll use their email address. For example, ‘We’ll only use your email address to contact you about your application.’',

  phoneQuestionHint: 'Ask the question the way you would in person. For example, ‘What’s your phone number?’',
  phoneHintHint: 'You can add a short hint to help people answer the question. For example, ‘You can provide either a home or mobile phone number.’',

  ninoQuestionHint: 'Ask the question the way you would in person. For example, ‘What’s your National Insurance number?’',
  ninoHintHint: 'You can add a short hint to help people answer the question. For example, ‘It’s on your National Insurance card, benefit letter, payslip or P60. For example, QQ 12 34 56 C.’',

  addressQuestionHint: 'Ask the question the way you would in person. For example, ‘What’s your address?’',
  addressHintHint: 'You could use hint text to tell people how you’ll use their address. For example, ‘We’ll send your licence to this address.’',
  addressInputTypeTitle: 'Address type',

  dobQuestionHint: 'Ask the question the way you would in person. For example, ‘What’s your date of birth?’',
  dobHintHint: 'You can add a short hint to help people answer the question. For a date of birth question you could use ‘For example, 27 3 1998’.',
  dateQuestionHint: 'Ask the question the way you would in person. For example, ‘What date was your passport issued?’',
  dateHintHint: 'You can add a short hint to help people answer the question. For a date question you could use ‘For example, 27 3 2007’.',
  dateOfBirthInputTypeTitle: 'Date of birth',

  selectionOneOptionQuestionHint: 'Ask the question the way you would in person. For example, ‘What country do you live in?’',
  selectionOneOptionHintHint: 'You can add a short hint to help people answer the question. For a question where people can only select one answer you might want to use ‘Select one option’.',
  selectionMultipleOptionsQuestionHint: 'Ask the question the way you would in person. For example, ‘Which of these countries have you lived in?’',
  selectionMultipleOptionsHintHint: 'You can add a short hint to help people answer the question. For a question where people can select more than one answer you might want to use ‘Select all that apply’.',

  numberQuestionHint: 'Ask the question the way you would in person. For example, ‘How many holiday days do you get a year?’',
  numberHintHint: 'You can add a short hint to help people answer the question. For example, ‘Do not include bank holidays’.',

  textSingleLineQuestionHint: 'Ask the question the way you would in person. For example, ‘What’s your reference number?’',
  textSingleLineHintHint: 'You can add a short hint to help people answer the question. For example, you could say what format the answer should be in or where to find it.',

  textMultipleLinesQuestionHint: 'Ask the question the way you would in person. For example, ‘Why do you want to apply for this role?’',
  textMultipleLinesHintHint: 'You can add a short hint to help people answer the question. For example, you could give a bit more detail about the information you need.',
  textLengthInputTypeTitle: 'Length'
}
