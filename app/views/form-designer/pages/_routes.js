const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

/* CREATING A NEW QUESTION
========================== */

// Create a new page or question route - button journeys
router.get('/form-designer/pages/new', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var action = req.session.data.action
  req.session.data.action = undefined

  // remove empty pageData if there is only one object (pageIndex) in array
  const pages = req.session.data.pages.filter(element => {
    if (Object.keys(element).length > 1) {
      return true
    }
    return false
  })
  // Save the pages
  req.session.data.pages = pages

  // reset highestPageId to number of pages
  req.session.data.highestPageId = parseInt(pages.length - 1)

  if (action === 'addRoute') {
    // add a new question route
    res.redirect(`/form-designer/question-routes/choose-question-route`)
  } else {

    var nextPageId = req.session.data.pages.length
  
    if (!pageData) {
      req.session.data.pages.push({
        'pageIndex': nextPageId
      })
    }
    // add a new question
    res.redirect(`/form-designer/pages/${nextPageId}/edit-answer-type`)
  }
})


/* ROUTE TYPE
============= */

// Choose question route type
router.post('/form-designer/question-routes/choose-question-route', function (req, res) {
  var chooseRouteType = req.session.data.chooseRouteType

  const errors = {}

  // if no question text given, then throw an error
  if (!chooseRouteType || !chooseRouteType.length) {
    errors['chooseRouteType'] = {
      text: 'Select the type of question route you want to add',
      href: "#chooseRouteType"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/question-routes/choose-question-route', {
      errors,
      errorList,
      containsErrors
    })
  } else {
    if (chooseRouteType === 'repeating') {
      res.redirect('new-repeat')
    } else {
      res.redirect('new-condition')
    }
  }
})
/* END of choose route type */

// Select where the repeating-route STARTS
router.get('/form-designer/question-routes/new-repeat', function (req, res) {
  var pages = req.session.data.pages
  var repeatStart = req.session.data.repeatStart

  const pagesList = []

  for (let i = 0; i < pages.length; i++) {
    var optional = ''
    if(pages[i]['questionOptional'] == 'questionOptional') {
      optional = ' (optional)'
    }

    var markChecked = ''
    if(repeatStart && (repeatStart.includes(pages[i]['long-title']))) {
      console.log('checked: ' + pages[i]['long-title'])
      markChecked = 'checked'
    }

    pagesList.push({
      value: (pages[i]['pageIndex'] + 1) + ". " + pages[i]['long-title'] + optional,
      text: (pages[i]['pageIndex'] + 1) + ". " + pages[i]['long-title'] + optional,
      checked: markChecked
    })
  }

  return res.render('form-designer/question-routes/new-repeat', {
    pagesList: pagesList
  })
})

router.post('/form-designer/question-routes/new-repeat', function (req, res) {
  var repeatStart = req.session.data.repeatStart

  const errors = {}

  // if no question text given, then throw an error
  if (!repeatStart || !repeatStart.length) {
    errors['repeatStart'] = {
      text: 'Select where you want the route to start',
      href: "#repeatStart"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/question-routes/new-repeat', {
      errors,
      errorList,
      containsErrors
    })
  } else {
    res.redirect('repeat-route-end')
  }
})
/* END of Select where the repeating-route STARTS */

// Select where the repeating-route ENDS
router.get('/form-designer/question-routes/repeat-route-end', function (req, res) {
  var pages = req.session.data.pages
  var repeatStart = req.session.data.repeatStart
  var endRepeat = req.session.data.endRepeat

  const pagesList = [{
    value: 'choose',
    text: 'Choose end question'
  }]

  var temp = false
  for (let i = 0; i < pages.length; i++) {
    // only add pages[i] AFTER we find repeatStart
    if(repeatStart && (repeatStart.includes(pages[i]['long-title']))) {
      temp = true
    }

    var optional = ''
    if(pages[i]['questionOptional'] == 'questionOptional') {
      optional = ' (optional)'
    }

    if((temp === true) && (!repeatStart.includes(pages[i]['long-title']))) {
      var markChecked = ''
      if(endRepeat && (endRepeat.includes(pages[i]['long-title']))) {
        console.log('selected: ' + pages[i]['long-title'])
        markChecked = 'checked'
      }
      
      pagesList.push({
        value: (pages[i]['pageIndex'] + 1) + ". " + pages[i]['long-title'] + optional,
        text: (pages[i]['pageIndex'] + 1) + ". " + pages[i]['long-title'] + optional,
        selected: markChecked
      })
    }
  }

  return res.render('form-designer/question-routes/repeat-route-end', {
    pagesList: pagesList
  })
})

router.post('/form-designer/question-routes/repeat-route-end', function (req, res) {
  var endRepeat = req.session.data.endRepeat

  const errors = {}

  // if no question text given, then throw an error
  if (!endRepeat || !endRepeat.length) {
    errors['endRepeat'] = {
      text: 'Select where you want the route to end',
      href: "#endRepeat"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/question-routes/repeat-route-end', {
      errors,
      errorList,
      containsErrors
    })
  } else {
    res.redirect('../your-questions')
  }
})
/* END of Select where the repeating-route ENDS */


/* ANSWER TYPE
============== */

// Edit answer type - display
router.get('/form-designer/pages/:pageId(\\d+)/edit-answer-type', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  // get the previous page URL
  var previousPage = req.session.data.referer
  // now we can set the back link data (text and url)
  var tempArray = backLink(previousPage, pageIndex, pageData)

  return res.render('form-designer/pages/edit-answer-type', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    previousPageLink: tempArray[0].previousPageLink,
    previousPageText: tempArray[0].previousPageText
  })
})
// Route used to find correct next step - answer type > settings page || edit question page
router.post('/form-designer/pages/:pageId(\\d+)/edit-answer-type', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var type = req.session.data.type
  req.session.data.type = undefined

  var errors = {};

  // if no selection made, then throw an error
  if (!type || !type.length) {
    errors['type'] = {
      text: 'Select the type of answer you need',
      href: "#type"
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/pages/edit-answer-type', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      errors,
      errorList,
      containsErrors
    })
  } else {
    const nextPageId = req.session.data.pages.length

    if (!pageData) {
      req.session.data.pages.push({
        'pageIndex': nextPageId
      })
    } else {
      pageData['type'] = type
    }
    if (type === 'personName') {
      // person's name route
      return res.redirect('edit-settings')
    } else if (type === 'address') {
      // address route
      return res.redirect('edit-settings')
    } else if (type === 'date') {
      // date route
      return res.redirect('edit-settings')
    } else if (type === 'select') {
      // what's your question route
      return res.redirect('edit-select-question')
    } else if (type === 'text') {
      // text route
      return res.redirect('edit-settings')
    } else {
      return res.redirect('edit')
    }
  }
})


/* START selection from a list of options */
// Edit answer type settings - display
router.get('/form-designer/pages/:pageId(\\d+)/edit-select-question', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  // get the previous page URL
  var previousPage = req.session.data.referer
  // now we can set the back link data (text and url)
  var tempArray = backLink(previousPage, pageIndex, pageData)

  return res.render('form-designer/pages/edit-select-question', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    previousPageText: tempArray[0].previousPageText,
    previousPageLink: tempArray[0].previousPageLink
  })
})
// Edit answer type settings - route to what is your question page for select from list answer type
router.post('/form-designer/pages/:pageId(\\d+)/edit-select-question', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  const type = req.session.data.type
  req.session.data.type = undefined

  const complete = req.session.data.isDeclarationComplete

  const errors = {};
  const title = req.session.data['long-title']

  // if no question text given, then throw an error
  if (!title || !title.length) {
    errors['long-title'] = {
      text: 'Enter your question',
      href: "#long-title"
    }
  // otherwise add question text to pageData
  } else {
    pageData['long-title'] = req.session.data['long-title']
  }
  req.session.data['long-title'] = undefined

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/pages/edit-select-question', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      errors,
      errorList,
      containsErrors
    })
  } else {
    const nextPageId = req.session.data.pages.length
    res.redirect('edit-settings')
  }
})
/* END of selection from a list of options */


/* START secondary answer type settings */
// Edit answer type settings - display
router.get('/form-designer/pages/:pageId(\\d+)/edit-settings', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  // get the previous page URL
  var previousPage = req.session.data.referer
  // now we can set the back link data (text and url)
  var tempArray = backLink(previousPage, pageIndex, pageData)

  // overwrite back link IF we are just adding/removing options from ‘selection from a list’
  if (req.session.data.tempSelectStatus === 'No') {
    tempArray[0].previousPageLink = `edit-select-question`
    tempArray[0].previousPageText = 'Back to what’s your question'
  }
  // clear the tempSelectStatus to avoid issues
  req.session.data.tempSelectStatus = undefined

  return res.render('form-designer/pages/edit-settings', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    previousPageText: tempArray[0].previousPageText,
    previousPageLink: tempArray[0].previousPageLink
  })
})
// Edit answer type settings - route used to find correct next step - settings page > edit question page
router.post('/form-designer/pages/:pageId(\\d+)/edit-settings', function (req, res) {
  var action = req.session.data.action
  // clear the action so it doesn't change the next page load
  req.session.data.action = undefined

  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  // Get basic errors
  const errors = {};

  // if select option from list and no, or 1, input is given throw error, else add input to pageData
  var itemList = req.session.data['item-list']
  var listSettings = req.session.data['listSettings']

  req.session.data['item-list'] = undefined
  req.session.data['listSettings'] = undefined

  if (pageData['type'] === 'select') {
    // check for empty values
    const tempList = itemList.filter(element => {
      if (Object.keys(element).length !== 0) {
        return true
      }
      return false
    })

    itemList = tempList
    if (!itemList.length) {
      errors['item-list'] = {
        text: 'Enter at least 2 options',
        href: "#option-0"
      }
    } else if (itemList.length < 2) {
      errors['item-list'] = {
        text: 'Enter at least 2 options',
        href: "#option-0"
      }
    }

    pageData['item-list'] = itemList
    pageData['listSettings'] = listSettings

  } else if (!req.session.data.input || !req.session.data.input.length) {
    // if no input is selected throw error, else add input to pageData
    if (pageData['type'] === 'personName') {
      errors['input'] = {
        text: 'Select how you need to collect the name',
        href: "#input"
      }
    } else if (pageData['type'] === 'address') {
      errors['input'] = {
        text: 'Select the kind of addresses you expect to receive',
        href: "#input"
      }
    } else if (pageData['type'] === 'date') {
      errors['input'] = {
        text: 'Select yes if you’re asking for a date of birth',
        href: "#input"
      }
    } else if (pageData['type'] === 'text') {
      errors['input'] = {
        text: 'Select how much text people will need to provide',
        href: "#input"
      }
    } else {
      errors['input'] = {
        text: 'Select an answer',
        href: "#input"
      }
    }
  } else {
    pageData['input'] = req.session.data.input
  }
  // clear the input to prevent any unwanted issues
  req.session.data.input = undefined

  // if asking for person’s name and title answer not selected throw error, else add input to pageData
  if (pageData['type'] === 'personName') {
    if (!req.session.data.title || !req.session.data.title.length) {
      errors['title'] = {
        text: 'Select yes if you need a title',
        href: "#title"
      }
    } else {
      pageData['title'] = req.session.data.title
    }
  }
  req.session.data.title = undefined

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/pages/edit-settings', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      errors,
      errorList,
      containsErrors
    })
  } else if (action === 'addAnother') {

    const lastItem = itemList.length - 1
    if (itemList[lastItem]) {
      itemList.push("")
    }

    // use tempSelectStatus to check if we have moved forward - this helps for the back link functionality
    req.session.data.tempSelectStatus = 'No'
    return res.redirect('edit-settings')

  } else if (action.includes('removeOption')) {

    // get item position to remove via remove button value
    var remove = action.split("-")
    var itemToRemove = remove.pop()
    // only splice array when item is found
    if (itemToRemove > -1) {
      // if options are now less than 2 add an empty option input
      if (itemList.length <= 2) {
        itemList.push("")
      }
      // 2nd parameter means remove one item only
      itemList.splice(itemToRemove, 1)
    }

    // use tempSelectStatus to check if we have moved forward - this helps for the back link functionality
    req.session.data.tempSelectStatus = 'No'
    return res.redirect('edit-settings')

  } else {

    // use tempSelectStatus to confirm we’ve moved forward - this helps for the back link functionality
    req.session.data.tempSelectStatus = 'Yes'
    return res.redirect('edit')

  }
})
/* END secondary answer type settings */


/* QUESTION
=========== */

/* START editing question text and hint text */
// Edit a user-created question
router.get('/form-designer/pages/:pageId(\\d+)/edit', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  // get the previous page URL
  var previousPage = req.session.data.referer
  // now we can set the back link data (text and url)
  var tempArray = backLink(previousPage, pageIndex, pageData)

  return res.render('form-designer/pages/edit', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    previousPageText: tempArray[0].previousPageText,
    previousPageLink: tempArray[0].previousPageLink
  })
})
// Route used to find correct next step - edit question page > answer type
router.post('/form-designer/pages/:pageId(\\d+)/edit', function (req, res) {
  var action = req.session.data.action
  // clear the action so it doesn't change the next page load
  req.session.data.action = undefined

  var additionalGuidance = req.session.data['additional-guidance']

  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  const errors = {};

  if (!pageData['long-title']) {
    const title = req.session.data['long-title']

    // if no question text given, then throw an error
    if (!title || !title.length) {
      errors['long-title'] = {
        text: 'Enter a question',
        href: "#long-title"
      }
    // otherwise add question text to pageData
    } else {
      pageData['long-title'] = req.session.data['long-title']
    }
    req.session.data['long-title'] = undefined
  }

  // if hint text is added, add it to pageData
  if (req.session.data['hint-text']) {
    pageData['hint-text'] = req.session.data['hint-text']
  }
  req.session.data['hint-text'] = undefined

  // if no additional guidance answer, then throw an error
  if (!additionalGuidance || !additionalGuidance.length) {
    errors['additional-guidance'] = {
      text: 'Select ‘Yes’ to add guidance',
      href: "#additional-guidance"
    }
  // otherwise add question text to pageData
  } else {
    pageData['additional-guidance'] = req.session.data['additional-guidance']
  }
  req.session.data['additional-guidance'] = undefined

  // if question is made optional, add it to pageData
  //reset if question is optional each time the form creator comes back to edit a question, to make sure if they unselect the checkbox it’ll update correctly
  pageData['questionOptional'] = undefined
  if (req.session.data['questionOptional']) {
    pageData['questionOptional'] = req.session.data['questionOptional']
  }
  req.session.data['questionOptional'] = undefined

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/pages/edit', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      errors,
      errorList,
      containsErrors
    })
  } else if (additionalGuidance == 'Yes') {
    return res.redirect(`additional-guidance`)
  } else {
    return res.redirect(`check-question`)
  }
})
/* END editing question text and hint text */


/* START adding additional guidance */
// Add additional guidance
router.get('/form-designer/pages/:pageId(\\d+)/additional-guidance', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var successMessage = req.session.data.successMessage
  req.session.data.successMessage = undefined

  // get the previous page URL
  var previousPage = req.session.data.referer
  // now we can set the back link data (text and url)
  var tempArray = backLink(previousPage, pageIndex, pageData)

  return res.render('form-designer/pages/additional-guidance', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    successMessage,
    previousPageText: tempArray[0].previousPageText,
    previousPageLink: tempArray[0].previousPageLink
  })
})
// Add additional guidance text route
router.post('/form-designer/pages/:pageId(\\d+)/additional-guidance', function (req, res) {
  var action = req.session.data.action
  // clear the action so it doesn't change the next page load
  req.session.data.action = undefined

  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  const errors = {};
  const pageHeading = req.session.data['page-name']
  const guidanceText = req.session.data['additional-guidance-text']

  // if no page heading given, then throw an error
  if (!pageHeading || !pageHeading.length) {
    errors['page-name'] = {
      text: 'Enter a page heading',
      href: "#page-name"
    }
  // otherwise add page heading to pageData
  } else {
    pageData['page-name'] = req.session.data['page-name']
  }
  req.session.data['page-name'] = undefined

  // if no guidance text given, then throw an error
  if (!guidanceText || !guidanceText.length) {
    errors['additional-guidance-text'] = {
      text: 'Enter guidance text',
      href: "#edit-guidance-text"
    }
  // otherwise add guidance text to pageData
  } else {
    pageData['additional-guidance-text'] = req.session.data['additional-guidance-text']
  }
  req.session.data['additional-guidance-text'] = undefined

  // content to display in notification banners
  var previewing = 'Preview your guidance text'

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/pages/additional-guidance', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      errors,
      errorList,
      containsErrors
    })
  } else if(action == 'previewGuidance') {
    req.session.data.successMessage = previewing
    res.redirect('additional-guidance#preview-guidance-text')
  } else {
    res.redirect('check-question')
  }
})
/* END adding additional guidance */


/* REVIEW AND SAVE QUESTION 
=========================== */

// Check your question - middleware
router.use('/form-designer/pages/:pageId(\\d+)/check-question', function (req, res, next) {

  // remove empty pageData if there is only one object (pageIndex) in array
  const pages = req.session.data.pages.filter(element => {
    if (Object.keys(element).length > 1) {
      return true
    }
    return false
  })
  // Save the pages
  req.session.data.pages = pages

  // reset highestPageId to number of pages
  req.session.data.highestPageId = parseInt(pages.length - 1)

  next();
})

// Check your question - display the page
router.get('/form-designer/pages/:pageId(\\d+)/check-question', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var editNextPageId = pageId + 1
  var nextActionText = 'Add a new question'
  var nextActionURL = `../new`

  if (pageId < req.session.data.pages.length - 1) {
    nextActionText = 'Edit next question'
    nextActionURL = `../` + editNextPageId + `/check-question` 
  }

  var editingExistingQuestion = 'No'
  if (pageData && pageData['questionSaved']) {
    editingExistingQuestion = pageData['questionSaved']
  }

  var successMessage = req.session.data.successMessage
  req.session.data.successMessage = undefined

  // get the previous page URL
  var previousPage = req.session.data.referer
  // now we can set the back link data (text and url)
  var tempArray = backLink(previousPage, pageIndex, pageData)

  return res.render('form-designer/pages/check-question', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    successMessage,
    nextActionText,
    nextActionURL,
    editingExistingQuestion,
    previousPageText: tempArray[0].previousPageText,
    previousPageLink: tempArray[0].previousPageLink
  })
})

// Check your question - route used to find correct next step - edit question page > answer type
router.post('/form-designer/pages/:pageId(\\d+)/check-question', function (req, res) {
  var action = req.session.data.action
  // clear the action so it doesn't change the next page load
  req.session.data.action = undefined

  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  if (pageData['questionSaved']) {
    var existingQuestion = true
  }

  // No need to validate if the user wants to delete this page anyway
  if (action === 'deletePage') {
    return res.redirect(`delete`)
  }

  // content to display in notification banners
  var savedNewQuestion = 'Question ' + (parseInt(pageId) + 1) + ' has been saved'
  var saved = 'Your changes have been saved'

  if (existingQuestion) {
    req.session.data.successMessage = saved
  } else {
    req.session.data.successMessage = savedNewQuestion
    if (pageData) {
      pageData['questionSaved'] = req.session.data.questionSaved
      req.session.data.questionSaved = undefined
    }
  }

  if (action === 'savePreview') {
    return res.redirect(`preview-question`)
  } else {
    return res.redirect(req.path)
  }
})


/* PREVIEW QUESTION
=================== */

// Preview question - display
router.get('/form-designer/pages/:pageId(\\d+)/preview-question', function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var successMessage = req.session.data.successMessage
  req.session.data.successMessage = undefined

  var nextActionText = 'Add a new question'
  var nextActionURL = `../new`

  var editNextPageId = pageId + 1
  if (pageId < req.session.data.pages.length - 1) {
    nextActionText = 'Edit next question'
    nextActionURL = `../` + editNextPageId + `/check-question` 
  }

  // get the previous page URL
  var previousPage = req.session.data.referer
  // now we can set the back link data (text and url)
  var tempArray = backLink(previousPage, pageIndex, pageData)

  return res.render('form-designer/pages/preview-question', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    successMessage,
    nextActionText,
    nextActionURL,
    previousPageText: tempArray[0].previousPageText,
    previousPageLink: tempArray[0].previousPageLink
  })
})


/* SUPPORTING FUNCTIONS
======================= */

// Function to get a page back links
function backLink(previousPage, pageIndex, pageData) {
  const array = []

  var previousPageLink = `javascript:window.history.back()`
  var previousPageText = 'Back'

  if (previousPage) {
    if (previousPage.includes('your-questions')) {

      previousPageLink = `/form-designer/clear-empty`
      previousPageText = 'Back to your questions'

    } else if (previousPage.includes(pageIndex + '/check-question')) {

      // This will take users back to check their question - from a change link journey
      previousPageLink = `/form-designer/clear-empty`
      previousPageText = 'Back to your questions'

    } else if (previousPage.includes((pageIndex - 1) + '/check-question')) {

      // This will take users back to the previous question summary page
      previousPageLink = `../` + (pageIndex - 1) + `/check-question`
      previousPageText = 'Back to check question ' + pageIndex

    } else if (previousPage.includes((pageIndex + 1) + '/check-question')) {

      // This will take users back to their questions - avoid a circular journey
      previousPageLink = `/form-designer/clear-empty`
      previousPageText = 'Back to your questions'

    } else if (previousPage.includes('/preview-question')) {

      if (pageIndex > 0) {
        
        // This will take users back to the previous question summary page
        previousPageLink = `../` + (pageIndex - 1) + `/check-question`
        previousPageText = 'Back to check question ' + pageIndex

      } else {

        // This will take users back to their questions - avoid a circular journey
        previousPageLink = `/form-designer/clear-empty`
        previousPageText = 'Back to your questions'

      }

    } else if (previousPage.includes(pageIndex + '/edit-answer-type')) {

      previousPageLink = `edit-answer-type`
      previousPageText = 'Back to what kind of answer you need' 

    } else if (previousPage.includes((pageIndex + 1) + '/edit-answer-type')) {

      previousPageLink = `/form-designer/clear-empty`
      previousPageText = 'Back to your questions'

    } else if (previousPage.includes(pageIndex + '/edit-settings')) {

      previousPageLink = `edit-settings`

      var inputType = pageData.type
      if (inputType === 'personName') {
        previousPageText = 'Back to ask for a person’s name'
      } else if (inputType === 'address') {
        previousPageText = 'Back to what kind of addresses'
      } else if (inputType === 'date') {
        previousPageText = 'Back to ask for a date of birth'
      } else if (inputType === 'text') {
        previousPageText = 'Back to amount of text'
      } else if (inputType === 'select') {
        previousPageText = 'Back to create a list of options'
      } else {
        previousPageText = 'Back to what kind of answer you need'
      }

    } else if (previousPage.includes(pageIndex + '/edit-select-question')) {

      previousPageLink = `edit-select-question`
      previousPageText = 'Back to what’s your question'

    } else if (previousPage.includes(pageIndex + '/edit')) {

      previousPageLink = `edit`
      previousPageText = 'Back to edit question'

    } else if (previousPage.includes(pageIndex + '/additional-guidance')) {

      previousPageLink = `additional-guidance`
      previousPageText = 'Back to add guidance'

    }
  }

  array.push({
    'previousPageLink': previousPageLink,
    'previousPageText': previousPageText
  })

  return array
}

module.exports = router