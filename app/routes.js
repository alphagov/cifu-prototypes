//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

// Add your routes here
const path = require('path')
const sessionDataDefaults = require('./data/session-data-defaults.js')
const returningSessionDataDefaults = require('./data/returning-session-data-defaults')
const returningSessionDataDefaultsA11y = require('./data/returning-session-data-defaults-a11y')

/* MARKDOWN
=========== */

// Markdown support
const markdown = require('@lfdebrux/nunjucks-markdown')

// Used to add govuk classes to “additional guidance” markdown for end user view (Runner)
const { marked } = require('marked');
const GovukHTMLRenderer = require('govuk-markdown')
const renderer = new GovukHTMLRenderer()

// Disable bold and italic formatting
renderer.strong = text => text
renderer.em = text => text

marked.setOptions({
  renderer
})

// One time setup
router.use(markdown.setupPlugin(marked.parse))

// Used for setting the pageIndex in req.session.data.pages to match the order of the pages.
// Should be used after any operation that reorders pages.
setPageIndexToArrayPosition = (page, index) => {
  page.pageIndex = index
  page['index'] = index
  return page
}

/* ROUTES FOR EXAMPLE FORMS
=========================== */

// Run this code when a form is submitted to '/example-2/eligibility-check-answer'
router.post('/example-2/eligibility-check-answer', function (req, res) {
  // Make a variable and give it the value from 'where-do-you-live'
  var whereDoYouLive = req.session.data['where-do-you-live']

  // Check whether the variable matches a condition
  if (whereDoYouLive == 'Northern Ireland') {
    // Send user to ineligible page
    res.redirect('/example-2/ineligible')
  } else {
    // Send user to next page
    res.redirect('/example-2/question-1')
  }
})
// Run this code when a form is submitted to '/example-2/save-progress-check'
router.post('/example-2/save-progress-check', function (req, res) {
  // Make a variable and give it the value from 'save-progress'
  var saveProgress = req.session.data['save-progress']

  // Check whether the variable matches a condition
  if (saveProgress == 'no') {
    // Send user to ineligible page
    res.redirect('/example-2/task-list')
  } else {
    // Send user to next page
    res.render('example-2/save-progress-check')
  }
})

// =====================================
// ROUTES FOR FORM DESIGNER
// =====================================

// Set a value to use in the back button to return to previous page
router.use('/form-designer/*', function (req, res, next) {

  const referer = req.headers.referer ?? '';
  // Should validate the referer URL is part of our application
  req.session.data.referer = referer

  next();
})

/* ==============
Create a new form
================= */

// Middleware name your form
router.use('/form-designer/name-your-form', function (req, res, next) {

  // get the previous page URL
  var previousPage = req.session.data.referer

  // set the default back link
  var previousPageLink = `your-form`
  var previousPageText = 'Back to create a form'

  if (previousPage) {
    // set the GOV.UK Forms home back link
    if (previousPage.includes('your-forms')) {
      previousPageLink = `your-forms`
      previousPageText = 'Back to your forms'
    }
  }

  // make back link available in the view
  req.session.data.previousPageLink = previousPageLink
  req.session.data.previousPageText = previousPageText

  next();
})

// Name your form - GET
router.get('/form-designer/name-your-form', function (req, res) {
  return res.render('form-designer/name-your-form', {
    previousPageText: req.session.data.previousPageText,
    previousPageLink: req.session.data.previousPageLink
  })
})

// Edit form name, handling validation errors
router.post('/form-designer/name-your-form', function (req, res) {
  const { formTitle } = req.session.data

  const errors = {};
  // if the formTitle is blank, then error
  if (!formTitle || !formTitle.length) {
    errors['formTitle'] = {
      text: 'Enter a form name',
      href: "#form-title"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/name-your-form', { errors, errorList, containsErrors })
  } else {

    // remove temporary back link details
    req.session.data.previousPageLink = undefined
    req.session.data.previousPageText = undefined

    // set a success message for saving
    req.session.data.successMessage = 'Your form name has been saved'
    res.redirect('your-form')
  }
})

// Your form task list page - used to load and clear out success pageData
// could we also add timer to the notification banner here?
// .govuk-notification-banner__header
router.get('/form-designer/your-form', function (req, res) {

  var successMessage = req.session.data.successMessage
  req.session.data.successMessage = undefined

  // Check which tasks are complete
  // Do some checks to see how many sections are "Completed" 
  var sections = 0
  // if form has a title completed = sections =+ 1 
  if (req.session.data['formTitle']) {
    sections = sections + 1 
  }
  // if questions are marked as completed = sections =+ 1 
  if (req.session.data['isQuestionsComplete'] === 'yes') {
    sections = sections + 1 
  }
  // if declaration marked complete = sections =+ 1 
  if (req.session.data['isDeclarationComplete'] === 'yes') {
    sections = sections + 1 
  }
  // if what happens next completed = sections =+ 1 
  if (req.session.data['confirmationNext']) {
    sections = sections + 1
  }

  // we won’t count optional tasks as part of the number of compelted tasks

  // if completed forms email address is set = sections =+ 1 
  if (req.session.data['formsEmail'] && req.session.data['confirmationCode']) {
    sections = sections + 1 
  }
  // if completed forms email has been confirmed = sections =+ 1 
  if (req.session.data['confirmationCode']) {
    sections = sections + 1 
  }
  
  // if privacy information link added = sections =+ 1 
  if (req.session.data['privacyInformation']) {
    sections = sections + 1 
  }
  // if support contact details added = sections =+ 1 
  if (req.session.data['supportDetails']) {
    sections = sections + 1 
  }

  return res.render('form-designer/your-form', {
    successMessage: successMessage,
    sections: sections
  })
})

// something about deleting a draft form
// Delete draft form - display
router.get('/form-designer/delete-draft', function (req, res) {
  var action = req.session.data.action

  if (action === 'deleteDraft') {
    res.redirect(`/form-designer/delete-draft-form`)
  }
})

// Delete draft form - button journeys
router.post('/form-designer/delete-draft-form', function (req, res) {
  var deleteDraftForm = req.session.data.deleteDraftForm
  req.session.data.deleteDraftForm = undefined

  const errors = {}
  // if no option is selected, then error
  if (!deleteDraftForm?.length) {
    errors.deleteDraftForm = {
      text: 'Select yes if you want to delete this form',
      href: "#deleteDraftForm"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0

  if(containsErrors) {
    return res.render('form-designer/delete-draft-form', {
      errors,
      errorList,
      containsErrors
    })
  } else if (deleteDraftForm === 'yes') {
    // delete all the things
    req.session.data.status = undefined

    req.session.data.formTitle = undefined
    req.session.data.pages = undefined
    req.session.data.isDeclarationComplete = undefined
    req.session.data.checkAnswersDeclaration = undefined
    req.session.data.confirmationNext = undefined

    req.session.data.formsEmail = undefined
    req.session.data.confirmationCode = undefined

    req.session.data.privacyInformation = undefined
    req.session.data.supportDetails = undefined
    req.session.data.emailSupport = undefined
    req.session.data.phoneSupport = undefined
    req.session.data.onlineSupportLink = undefined
    req.session.data.onlineSupportText = undefined

    req.session.data.makeFormLive = undefined

    req.session.data.action = undefined

    res.redirect(`/form-designer/your-forms`)
  } else {
    res.redirect(`/form-designer/your-form`)
  }

})


/* =====
Adding pages to a form
===== */

// .get method to remove empty pages where no answer type has been chosen
// could be removed if we fix the "/pages/new" .get method below
router.get('/form-designer/clear-empty', function (req, res) {
  // remove empty pageData if there is only one object (pageIndex) in array
  const pages = req.session.data.pages.filter(element => {
    if (Object.keys(element).length > 2) {
      return true
    }
    return false
  })
  // Save the pages
  req.session.data.pages = pages

  // reset highestPageId to number of pages
  req.session.data.highestPageId = parseInt(pages.length - 1)

  // remove empty groupData if there is only one object (groupIndex) in array
  const groups = req.session.data.groups.filter(element => {
    if (Object.keys(element).length > 3) {
      return true
    }
    return false
  })
  // Save the groups
  req.session.data.groups = groups

  // reset highestPageId to number of groups
  req.session.data.highestGroupId = parseInt(groups.length - 1)

  return res.redirect(`/form-designer/your-questions`)
})

// Your form task list page - used to load and clear out success pageData
/* TODO: this breaks the re-ordering buttons by overwriting the pageOrder from scratch. Need to find a way to avoid this, but still make sure we add new questions on load */
/*
1. Get current pagesOrder 
2. Compare the objects in the array to see if page or group is missing
3. If new group or page add this to pagesOrder
4. Otherwise, if this is the first time generating the pagesOrder do the while loop
*/
router.use('/form-designer/your-questions', function (req, res, next) {
  var { groups, pages } = req.session.data

  // create new tempArray - to be combined group and page lists
  const newPagesOrder = []
  // try a loop over the pages
  let i = 0;
  let index = 0;
  while (i < pages.length) {
    // if “addToGroup” is not null
    if (pages[i].addToGroup != null) {
      // set group to be the group found associated to the page
      var group = groups.find(function(element) { return element.groupIndex == pages[i].addToGroup })
      // set temporary array of pages to associated with this group
      var groupPages = []
      // using this group, check if the next questions are also in the same group
      // this will start the loop where we are and should only go to the end of the pages added 
      while (i < pages.length && pages[i].addToGroup == group.groupIndex) { 
        // add page to group, if “addToGroup” is the same as the “groupIndex”
        groupPages.push(pages[i]);
        // increment loop count
        i++;
      }
      // push group into “newPagesOrder” array with associated pages within it
      newPagesOrder.push({ 'index': index, 'group': group, 'pages': groupPages })
    } else {
      // push page into “newPagesOrder” array
      newPagesOrder.push({ 'index': index, 'page': pages[i] })
      // increment loop count
      i++;
    }
    index++;
  }

  // set new “pagesOrder” array in session data so we can use it elsewhere
  req.session.data.pagesOrder = newPagesOrder

  next();
})
// could we also add timer to the notification banner here?
// .govuk-notification-banner__header
router.get('/form-designer/your-questions', function (req, res) {
  var { pagesOrder, successMessage } = req.session.data
  req.session.data.successMessage = undefined

  return res.render('form-designer/your-questions', {
    pagesOrder: pagesOrder,
    successMessage: successMessage
  })
})
// Route for user marking questions as complete
router.post('/form-designer/your-questions', function (req, res) {
  const { isQuestionsComplete, pages, action } = req.session.data

  // clear the action
  req.session.data.action = undefined

  // content to display in notification banners
  var saved = 'Your questions have been saved'
  var savedAndComplete = 'Your questions have been saved and marked as complete'

  const errors = {}
  // are there questions added to the form, if so check to see if we have answered the mark as complete question
  if ((pages.length > 0) && (action == 'continue')) {
    // if no option is selected, then error
    if (!isQuestionsComplete?.length) {
      errors.isQuestionsComplete = {
        text: 'Select yes if you have finished adding and editing your questions',
        href: "#isQuestionsComplete"
      }
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/your-questions', { errors, errorList, containsErrors })
  } else {
    // what action has been selected 
    if (action == 'addQuestion') {
      if (req.session.data.addJourney == 'addAnother1') {
        // add another answer journey - pre question version (Prototype 1 / Option 4 on Mural board)
        res.redirect(`/form-designer/groups/group-or-question`)
      } else {
        // add a new question
        res.redirect(`/form-designer/pages/new`)
      }
    } else if (action == 'addRoute') {
      // add a new question route
      res.redirect(`/form-designer/question-routes/new-condition`)
    } else if (action =='continue') {
      // save and continue
      if(isQuestionsComplete === 'yes') {
        // set a success message for saving and marking as complete
        req.session.data.successMessage = savedAndComplete
      } else {
        // set a success message for saving
        req.session.data.successMessage = saved
      }
      // back to “create your form” task list
      res.redirect('/form-designer/your-form')
    }
  }
})


/* =====
Managing questions in a form
===== */

// Delete user selected question
getDeleteQuestion = function (req, res) {
  const pageIndex = parseInt(req.params.pageId, 10)
  const pageData = req.session.data.pages[pageIndex]

  const groupIndex = parseInt(req.params.groupIndex, 10)
  const groupData = req.session.data.groups[groupIndex]

  if(!(pageIndex in req.session.data.pages)) {
    throw Error('Page not found');
  }

  res.render('form-designer/pages/delete.html', {
    pageData,
    groupData
  })
}
router.get('/form-designer/pages/:pageId/delete', getDeleteQuestion)
router.get('/form-designer/groups/:groupId/pages/:pageId/delete', getDeleteQuestion)
// Route used to delete question
deleteQuestion = function (req, res) {
  const { action } = req.session.data
  const shouldDelete = req.session.data.delete
  const pageIndex = parseInt(req.params.pageId, 10)

  // clear actions
  req.session.data.action = undefined
  req.session.data.delete = undefined

  if(!(pageIndex in req.session.data.pages)) {
    throw Error('Page not found');
  }

  const errors = {};
  if (!shouldDelete || !shouldDelete.length) {
    errors['delete'] = {
      text: 'Select yes if you want to delete this question',
      href: "#delete"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/pages/delete', {
      errors,
      errorList,
      containsErrors
    })
  } else if(action === 'delete' && shouldDelete === 'Yes') {
    // Create an array of pages without the one we want to remove
    const pages = req.session.data.pages
      .filter(element => parseInt(element.pageIndex, 10) !== pageIndex)
      .map(setPageIndexToArrayPosition)

    // Save the pages
    req.session.data.pages = pages
    return res.redirect('/form-designer/clear-empty')
  } else if(action === 'delete' && shouldDelete  === 'No') {
    return res.redirect(`./check-question`)
  } else {
    return res.redirect(req.path)
  }
}
router.post('/form-designer/pages/:pageId/delete', deleteQuestion)
router.post('/form-designer/groups/:groupId/pages/:pageId/delete', deleteQuestion)


// Route used by the reordering buttons in your-questions.html
reorder = function (req, res) {
  const { pageId, direction } = req.params
  const newArrayPosition = direction === 'down' ? parseInt(pageId) + 1 : parseInt(pageId) - 1
  const { pagesOrder } = req.session.data

  const pageToMove = pagesOrder.splice(pageId, 1)[0]
  pagesOrder.splice(newArrayPosition, 0, pageToMove)

  // content to display in notification banners
  var successMessage = ''
  if (Object.hasOwn(pageToMove, 'group')) {
    successMessage = '‘' + pageToMove.group.groupName + '’' + ' has moved ' + direction + ' to position ' + (parseInt(newArrayPosition) + 1)
  } else {
    successMessage = '‘' + pageToMove.page['long-title'] + '’' + ' has moved ' + direction + ' to number ' + (parseInt(newArrayPosition) + 1)
  }

  req.session.data.pagesOrder = pagesOrder.map(setPageIndexToArrayPosition)

  req.session.data.successMessage = successMessage
  res.redirect('/form-designer/clear-empty')
}
router.get('/form-designer/pages/:pageId/reorder/:direction', reorder)


/* =====
Optional tasks
===== */

// Route used to check payment link is added, handling validation errors
router.post('/form-designer/payment/add-payment-link', function (req, res) {
  const errors = {};
  const { paymentLink,tempPaymentLink } = req.session.data
  var temp = tempPaymentLink

  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  }

  if (!paymentLink?.length) {
    if (temp.length) {
      // set a success message for removing a link
      req.session.data.successMessage = 'Your payment link has been removed'
      req.session.data.tempPaymentLink = undefined
    }
    // If the user hasn’t entered a payment URL at all, don’t error - check incase we need to remove it
    req.session.data.paymentLink = undefined
  } else if (isValidUrl(paymentLink) === false) {
    // If payment link input given and does not look like a URL throwback error
    errors['paymentLink'] = {
      text: 'Enter a GOV.UK Pay payment link',
      href: "#payment-link"
    }
  } else {
    // set a success message for saving
    req.session.data.successMessage = 'Your payment link has been saved'
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/payment/add-payment-link', { errors, errorList, containsErrors })
  } else {
    res.redirect('../your-form')
  }
})


/* =====
Managing additional pages in a form
===== */

// Route used to check Declaration is complete - Check your answers (CYA)
router.post('/form-designer/pages/check-answers/edit', function (req, res) {
  const action = req.session.data.action
  req.session.data.action = undefined

  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  const errors = {};
  const complete = req.session.data.isDeclarationComplete
  const declarationContent = req.session.data.checkAnswersDeclaration

  // content to display in notification banners
  var saved = 'Your declaration has been saved'
  var savedAndComplete = 'Your declaration has been saved and marked as complete'

  // if no selection made, then throw an error
  if (!complete || !complete.length) {
    errors['isDeclarationComplete'] = {
      text: 'Select yes if you want to mark this task as complete',
      href: "#isDeclarationComplete"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if (action === 'update') {
    // set a success message for saving
    req.session.data.successMessage = saved
    return res.render('form-designer/pages/check-answers/edit', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      successMessage: saved
    })
  } else if(containsErrors) {
    return res.render('form-designer/pages/check-answers/edit', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      errors,
      errorList,
      containsErrors
    })
  } else {
    if(complete === 'yes') {
      // set a success message for saving
      req.session.data.successMessage = savedAndComplete
    } else {
      // set a success message for saving
      req.session.data.successMessage = saved
    }
    return res.redirect('../../your-form')
  }
})

// Route used to check What happens next (WHN) content has been added
router.post('/form-designer/pages/confirmation/edit', function (req, res) {
  const action = req.session.data.action
  req.session.data.action = undefined

  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  const errors = {};
  const whatHappensNext = req.session.data.confirmationNext

  // content to display in notification banners
  var saved = 'Your information about what happens next has been saved'

  // if no selection made, then throw an error
  if (!whatHappensNext || !whatHappensNext.length) {
    errors['confirmationNext'] = {
      text: 'Enter some information about what happens next',
      href: "#confirmationNext"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/pages/confirmation/edit', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      errors,
      errorList,
      containsErrors
    })
  } else if (action === 'update') {
    return res.render('form-designer/pages/confirmation/edit', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      successMessage: saved
    })
  } else {
    // set a success message for saving
    req.session.data.successMessage = saved
    return res.redirect('../../your-form')
  }
})


/* =====
Page previews
===== */

// Renders the in-page preview, set to a specific page
router.get('/form-designer/pages/:pageId/preview', function (req, res) {
  req.session.data.action = undefined
  var pageId = req.params.pageId
  var pageIndex = parseInt(pageId)
  var pageData = req.session.data.pages[pageIndex]

  res.render('form-designer/pages/preview', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData
  })
})

// This is just for convience to the new-tab preview for this page
router.get('/form-designer/pages/:pageId/view', function (req, res) {
  return res.redirect(`/form-designer/view/${req.params.pageId}`)
})

// Routing for new-tab page previews, set to a specific page
router.post('/form-designer/preview/:pageId(\\d+)', function (req, res) {
  var cya = req.session.data.cya
  req.session.data.cya = undefined
  var pageId = req.params.pageId
  var pageIndex = parseInt(pageId)
  var pageData = req.session.data.pages[pageIndex]
  const isLastQuestionPage = pageIndex === (req.session.data.pages.length - 1)

  var repeatQuestion = pageData.repeatQuestion ? pageData.repeatQuestion : null

  if(repeatQuestion === 'Yes') {
    // if this is a single repeating question go to summary of answers listed
    return res.redirect(`${pageIndex}` + '/page-repeat-summary')
  } else if(isLastQuestionPage || cya === 'true') {
    // if last question in form OR user clicked on change link from CYA, then go to CYA
    return res.redirect('check-answers')
  } else {
    return res.redirect(`${pageIndex + 1}`)
  }
})

// Renders the new-tab page preview, set to a specific page
router.get('/form-designer/preview/:pageId(\\d+)', function (req, res) {
  var pageId = req.params.pageId
  var pageIndex = parseInt(pageId)
  var pageData = req.session.data.pages[pageIndex]
  const isLastQuestionPage = pageIndex === (req.session.data.pages.length - 1)

  var repeatQuestion = pageData.repeatQuestion ? pageData.repeatQuestion : null

  if (pageData) {
    var markdownContent = pageData['additional-guidance-text']
  }

  res.render('form-designer/preview/page', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    pageRepeats: repeatQuestion,
    isLastQuestionPage,
    markdownContent: markdownContent
  })
})

// Renders the new-tab page preview, set to a specific page
router.get('/form-designer/preview/:pageId(\\d+)/page-repeat-summary', function (req, res) {
  var pageId = req.params.pageId
  var pageIndex = parseInt(pageId)
  var pageData = req.session.data.pages[pageIndex]
  const isLastQuestionPage = pageIndex === (req.session.data.pages.length - 1)

  var repeatQuestion = pageData.repeatQuestion ? pageData.repeatQuestion : null

  console.log(repeatQuestion)

  if (pageData) {
    var markdownContent = pageData['additional-guidance-text']
  }

  res.render('form-designer/preview/page-repeat-summary', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    pageRepeats: repeatQuestion,
    isLastQuestionPage,
    markdownContent: markdownContent
  })
})

// Routing for new-tab page previews, set to a specific page
router.post('/form-designer/preview/:pageId(\\d+)/page-repeat-summary', function (req, res) {
  var addAnother = req.session.data.addAnother
  var cya = req.session.data.cya
  req.session.data.cya = undefined
  var pageId = req.params.pageId
  var pageIndex = parseInt(pageId)
  var pageData = req.session.data.pages[pageIndex]
  const isLastQuestionPage = pageIndex === (req.session.data.pages.length - 1)

  var minLoop = pageData.minLoop ? pageData.minLoop : null
  var maxLoop = pageData.maxLoop ? pageData.maxLoop : null

  if(addAnother === 'yes') {
    return res.redirect(`../${pageIndex}`)
  } else if(isLastQuestionPage || cya === 'true') {
    // if last question in form OR user clicked on change link from CYA, then go to CYA
    return res.redirect('../check-answers')
  } else {
    return res.redirect(`../${pageIndex + 1}`)
  }
})


/* =====
Routing for setting an email steps
===== */

// Renders the page which asks for form submissions email address, handling validation errors
router.post('/form-designer/completed-forms-email/set-completed-forms-email', function (req, res) {
  const errors = {};
  const { formsEmail } = req.session.data

  // If the formsEmail is blank, create an error to be displayed to the user
  if (!formsEmail?.length) {
    errors.formsEmail = {
      text: 'Enter an email address',
      href: "#forms-email"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/completed-forms-email/set-completed-forms-email', { errors, errorList, containsErrors })
  } else {
    req.session.data.confirmationCode = undefined
    res.redirect('confirmation-code-sent')
  }
})

// Renders the page to ask for an email confirmation code, handling validation errors
router.post('/form-designer/completed-forms-email/enter-email-confirmation-code', function (req, res) {
  const errors = {};
  const { confirmationCode } = req.session.data

  // If the confirmation code is blank, create an error to be displayed to the user
  if (!confirmationCode?.length) {
    errors.confirmationCode = {
      text: 'Enter the confirmation code',
      href: "#confirmation-code"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/completed-forms-email/enter-email-confirmation-code', { errors, errorList, containsErrors })
  } else {
    req.session.data.currentFormsEmail = undefined
    res.redirect('email-confirmation')
  }
})

// Renders the page which asks to confirm wanting to change submission email address, handling validation errors
router.post('/form-designer/completed-forms-email/change-email-address', function (req, res) {
  const errors = {};
  const { formsEmail, newFormsEmail } = req.session.data

   // If the newFormsEmail is blank, create an error to be displayed to the user
   if (!newFormsEmail?.length) {
    errors.newFormsEmail = {
      text: 'Enter an email address',
      href: "#forms-email"
    }
  } else {

    if (newFormsEmail === formsEmail) {
      req.session.data.newFormsEmail = undefined
    } else {
      req.session.data.currentFormsEmail = formsEmail
      req.session.data.formsEmail = newFormsEmail
      req.session.data.newFormsEmail = undefined
    }

  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/completed-forms-email/change-email-address', { errors, errorList, containsErrors })
  } else {
    if (newFormsEmail && (newFormsEmail != formsEmail)) {
      res.redirect('confirmation-code-sent')
    } else {
      res.redirect('completed-forms-email')
    }
  }
})

// Renders the page to play back entered email and asks for email confirmation code, handling validation errors
router.post('/form-designer/completed-forms-email/completed-forms-email', function (req, res) {
  const errors = {};
  const { formsEmail, currentFormsEmail, confirmationCode } = req.session.data

  if (formsEmail.includes(formsEmail)) {
    req.session.data.oldFormsEmail = req.session.data.currentFormsEmail
    req.session.data.currentFormsEmail = formsEmail
  }

  // If the confirmation code is blank, create an error to be displayed to the user
  if (!confirmationCode?.length) {
    errors.confirmationCode = {
      text: 'Enter the confirmation code',
      href: "#confirmation-code"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/completed-forms-email/completed-forms-email', { errors, errorList, containsErrors })
  } else {
      req.session.data.oldFormsEmail = undefined
      req.session.data.currentFormsEmail = req.session.data.formsEmail
      res.redirect('email-confirmation')
  }
})

// Renders the page which asks to cancel new email change, handling validation errors
router.post('/form-designer/completed-forms-email/cancel-new-email-change', function (req, res) {
  const errors = {};
  const { cancelNewEmail } = req.session.data

  // If no selection, create an error to be displayed to the user
  if (!cancelNewEmail || !cancelNewEmail.length) {
    errors['cancelNewEmail'] = {
      text: 'Select yes if you want to cancel changing the email address',
      href: "#cancel-new-email"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/completed-forms-email/cancel-new-email-change', { errors, errorList, containsErrors })
  } else {
    req.session.data.cancelNewEmail = undefined
    if(cancelNewEmail === 'yes') {
      // set success message
      req.session.data.successMessage = 'Change of email address has been cancelled'
      req.session.data.formsEmail = req.session.data.currentFormsEmail
      req.session.data.currentFormsEmail = undefined
      req.session.data.newFormsEmail = undefined
      res.redirect('completed-forms-email')
    } else {
      res.redirect('completed-forms-email')
    }
  }
})


/* =====
Provide privacy and contact details
===== */

// Renders the page for creator to add privacy information link, handling validation errors
router.post('/form-designer/provide-link-to-privacy-information', function (req, res) {
  const errors = {};
  const { privacyInformation } = req.session.data

  // If the user haven't selected yes or no
  if (!privacyInformation?.length) {
    errors['privacyInformation'] = {
      text: 'Enter a link',
      href: "#privacy-information"
    }
  }
  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/provide-link-to-privacy-information', { errors, errorList, containsErrors })
  } else {
    // set a success message for saving
    req.session.data.successMessage = 'Your privacy information link has been saved'
    res.redirect('your-form')
  }
})

// Renders the page for creator to add support contacts, handling validation errors
router.post('/form-designer/provide-support-details', function (req, res) {
  const errors = {};
  const { supportDetails, emailSupport, phoneSupport, onlineSupportLink, onlineSupportText } = req.session.data

  // If the user hasn't selected an option
  if (!supportDetails?.length) {
    errors['supportDetails'] = {
      text: 'Select at least one option',
      href: "#support-details"
    }
  }
  // If the user has selected email but hasn't entered an email
  if (supportDetails?.includes('email') && !emailSupport?.length) {
    errors['emailSupport'] = {
      text: 'Enter an email address',
      href: "#email-support"
    }
  }
  // If the user has selected telephone but hasn't entered any detail
  if (supportDetails?.includes('phone') && !phoneSupport?.length) {
    errors['phoneSupport'] = {
      text: 'Enter the phone number and its opening times',
      href: "#email-support"
    }
  }
  // If the user has selected online but hasn't entered a link
  if (supportDetails?.includes('online') && !onlineSupportLink?.length) {
    errors['onlineSupportLink'] = {
      text: 'Enter a link',
      href: "#email-support"
    }
  }
  // If the user has selected online but hasn't entered any descriptive text for the link
  if (supportDetails?.includes('online') && !onlineSupportText?.length) {
    errors['onlineSupportText'] = {
      text: 'Enter an online contact link description',
      href: "#email-support"
    }
  }
  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/provide-support-details', { errors, errorList, containsErrors })
  } else {
    // set a success message for saving
    req.session.data.successMessage = 'Your contact details for support have been saved'
    res.redirect('your-form')
  }
})


/* =====
Make your form live
===== */

// Renders the page to confirm making form Live, handling validation errors
router.post('/form-designer/make-your-form-live', function (req, res) {
  const errors = {};
  const { makeFormLive } = req.session.data

  // If the user haven't selected yes or no
  if (!makeFormLive || !makeFormLive.length) {
    errors['makeFormLive'] = {
      text: 'Select no if you do not want to make your form live yet',
      href: "#makeFormLive"
    }
  }
  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/make-your-form-live', { errors, errorList, containsErrors })
  } else {
    if(makeFormLive === 'yes') {
      req.session.data.status = "Live"
      res.redirect('form-is-live')
    } else {
      res.redirect('your-form')
    }
  }
})


/* =====
Editing a live forms
===== */

// Renders the page which asks to confirm editing live questions/form, handling validation errors
router.post('/form-designer/are-you-sure-you-want-to-edit-live-questions', function (req, res) {
  const errors = {};
  const { editLiveQuestions } = req.session.data

  // If the changeFormsEmail has selection, create an error to be displayed to the user
  if (!editLiveQuestions || !editLiveQuestions.length) {
    errors['editLiveQuestions'] = {
      text: 'Select no if you do not want to edit your questions',
      href: "#editLiveQuestions"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if(containsErrors) {
    res.render('form-designer/are-you-sure-you-want-to-edit-live-questions', { errors, errorList, containsErrors })
  } else {
    if(editLiveQuestions === 'yes') {
      res.redirect('/form-designer/clear-empty')
    } else {
      res.redirect('your-form')
    }
  }
})


/* =====
Pre-filled form journeys
===== */

// Uses return data for dummy "Take your pet abroad" form
router.get('/form-designer/returning', (req, res) => {
  req.session.data = returningSessionDataDefaultsA11y
  res.redirect('/form-designer/your-forms')
})
// Uses return data for IS example "Amendment form: redundancy claim for holiday pay" form
router.get('/form-designer/returning-again', (req, res) => {
  req.session.data = returningSessionDataDefaults
  res.redirect('/form-designer/your-forms')
})


/* =====
Prototype functions
===== */

// Function to remove individual data items, for basic testing
router.get('/prototype-admin/show-data', (req, res, next) => {
  const removeKey = req.session.data.action
  req.session.data[removeKey] = undefined
  next()
})

/* Use the routes file in pages for adding and editing questions */
router.use('/pages', require('./views/form-designer/pages/\_routes'))

/* Use the routes file in groups for adding and editing groups */
router.use('/groups', require('./views/form-designer/groups/\_routes'))

/* Use the routes file in product-pages for groups and members routes */
router.use('/product-pages', require('./views/product-pages/\_routes'))

module.exports = router