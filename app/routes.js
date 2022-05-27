const express = require('express')
const { setPageIndexToArrayPosition } = require('../lib/utils.js')
const returningSessionDataDefaults = require('./data/returning-session-data-defaults')
const router = express.Router()

// ROUTES FOR EXAMPLE FORMS

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

// ROUTES FOR FORM DESIGNER
//

router.use('/form-designer/*', function (req, res, next) {
  const referer = req.headers.referer ?? '';
  req.session.data.referer = referer
  next();
})

router.get('/form-designer/pages/new', function (req, res) {
  const nextPageId = parseInt(req.session.data.highestPageId) + 1
  res.redirect(`/form-designer/pages/${nextPageId}/edit`) 
})

// Renders the page editor, set to a specific page
router.get('/form-designer/pages/:pageId/edit', function (req, res) {
  var action = req.session.data.action
  var pageId = req.params.pageId
  var editNextPageId = parseInt(pageId) + 1

  // Update the 'Highest page Id'
  req.session.data.highestPageId = req.session.data.pages.length
  var createNextPageId = parseInt(req.session.data.highestPageId) + 1

  // If user is creating a page from the check your answers page...
  if (pageId == 'check-answers' && action == 'createNextPage') {
    res.redirect(`/form-designer/pages/${ createNextPageId}/edit`)

    // If user is updating the check your answers page...
  } else if (
    pageId == 'check-answers' &&
    (action == 'update' || action == '')
  ) {
    res.render('form-designer/pages/edit-check-answers-page')

    // If user is creating a page from the confirmation page...
  } else if (pageId == 'confirm' && action == 'createNextPage') {
    res.redirect('/form-designer/edit-page/' + createNextPageId)

    // If user is updating the confirmation page...
  } else if (pageId == 'confirm' && (action == 'update' || action == '')) {
    res.render('form-designer/pages/edit-confirmation-page')

    // If user is updating the start page...
  } else if (pageId == 0 && (action == 'update' || action == '')) {
    res.render('form-designer/edit-start-page')

    // If user pressed the 'Create next page' button...
  } else if (action == 'createNextPage') {
    req.session.data.action = undefined
    res.redirect(`/form-designer/pages/new`)

    // If user pressed the 'Edit next page' button...
  } else if (action == 'editNextPage') {
    // reset the action to avoid a loop
    req.session.data.action = ''

    res.redirect(`/form-designer/pages/${editNextPageId}`)

    // If user pressed the 'Update preview' button or back link...
  } else if (action === 'deletePage') {
    // reset the action to avoid a loop
    req.session.data.action = ''
    return res.redirect(`delete`)
  } else {
    // If user pressed the 'Update preview' button or back link...
    var pageIndex = parseInt(pageId) - 1
    var pageData = req.session.data.pages[pageIndex]

    res.render('form-designer/pages/edit', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      editingExistingQuestion: req.session.data.pages[pageIndex] !== undefined
    })
  }
})

// Route used to delete question
router.get('/form-designer/pages/:pageId/delete', function (req, res) {
  const { action } = req.session.data
  const pageIndex = parseInt(req.params.pageId, 10) - 1
  const pageData = req.session.data.pages[pageIndex]

  if(!(pageIndex in req.session.data.pages)) {
    throw Error('Page not found');
  }

  if(action === 'delete' && req.session.data.delete === 'Yes') {
    // Create an array of pages without the one we want to remove
    const pages = req.session.data.pages
      .filter(element => parseInt(element.pageIndex, 10) !== pageIndex)
      .map(setPageIndexToArrayPosition)

    // Save the pages
    req.session.data.pages = pages
    // Update the highestPageId so when user creates a new question after
    // deleting the right id is used
    req.session.data.highestPageId = req.session.data.pages.length

    // Reset the state so they can be reused
    req.session.data.action = undefined
    req.session.data.delete = undefined
    return res.redirect('/form-designer/form-index')
  } else if(action === 'delete' && req.session.data.delete === 'No') {
    // Reset the state so they can be reused
    req.session.data.action = undefined
    req.session.data.delete = undefined
    return res.redirect(`/form-designer/pages/${pageIndex + 1}/edit`)
  } else {

    res.render('form-designer/pages/delete.html', {
      pageData
    })
  }
})

router.get('/form-designer/pages/:pageId/view', function (req, res) {
  return res.redirect(`/form-designer/view/${req.params.pageId}`)
});

// Route used by the reordering buttons in form-index.html
router.get('/form-designer/pages/:pageId/reorder/:direction', function (
  req,
  res
) {
  const { pageId, direction } = req.params
  const newArrayPosition = direction === 'down' ? pageId : pageId - 2
  const { pages } = req.session.data

  const pageToMove = pages.splice(pageId - 1, 1)[0]
  pages.splice(newArrayPosition, 0, pageToMove)

  req.session.data.pages = pages.map(setPageIndexToArrayPosition)

  res.redirect('/form-designer/form-index')
})

// Renders the in-page preview, set to a specific page
router.get('/form-designer/pages/:pageId/page-preview', function (req, res) {
  req.session.data.action = ''
  var pageId = req.params.pageId
  var pageIndex = parseInt(pageId) - 1
  var pageData = req.session.data.pages[pageIndex]

  res.render('form-designer/page-preview', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData
  })
})

router.get('/form-designer/view/start', function (req, res) {
  return res.render('form-designer/view/start.html')
})

router.get('/form-designer/view/check-answers', function (req, res) {
  return res.render('form-designer/view/check-answers.html')
})

router.get('/form-designer/view/confirm', function (req, res) {
  return res.render('form-designer/view/confirm.html')
})

// Renders the new-tab page preview, set to a specific page
router.get('/form-designer/view/:pageId', function (req, res) {
  req.session.data.action = ''
  var pageId = req.params.pageId
  
  var pageIndex = parseInt(pageId) - 1
  var pageData = req.session.data.pages[pageIndex]

  res.render('form-designer/view/page-preview-new-tab', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData
  })
})

// Renders the page which asks for form name, handling validation errors
router.post('/form-designer/form-create-a-form', function (req, res) {
  const errors = {};
  const { formTitle } = req.session.data

  // If the formTitle is blank, create an error to be displayed to the user
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
    res.render('form-designer/form-create-a-form', { errors, errorList, containsErrors })
  } else {
    res.redirect('form-index')
  }
})

router.get('/form-designer/returning', (req, res) => {
  req.session.data = returningSessionDataDefaults 
  res.redirect('/form-designer/form-list')
})

module.exports = router
