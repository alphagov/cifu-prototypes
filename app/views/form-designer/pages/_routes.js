const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

/* CREATING A NEW QUESTION
========================== */

// Create a new page or question route - button journeys
newPage = function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var repeatQuestion = undefined
  if ((req.session.data.groupQuestions) && (req.session.data.groupQuestions == 'newQuestionRepeats')) {
    repeatQuestion = 'Yes'
  }

  var groupId = req.params.groupId ? parseInt(req.params.groupId, 10) : null
  
  /* Can we change this to remove empty pageData if question isn’t marked as "questionSaved": "Yes" */
  // remove empty pageData if there is only one object (pageIndex) in array
  const pages = req.session.data.pages.filter(element => {
    if (Object.hasOwn(element, 'questionSaved')) {
      return true
    }
    return false
  })
  // Save the pages
  req.session.data.pages = pages

  // reset highestPageId to number of pages
  req.session.data.highestPageId = parseInt(pages.length - 1)

  var nextPageId = req.session.data.pages.length

  if (!pageData) {
    req.session.data.pages.push({
      'pageIndex': nextPageId,
      'addToGroup': groupId,
      'repeatQuestion': repeatQuestion
    })
  }

  if (groupId != null) {
    // add a new question to this group
    res.redirect(`/form-designer/groups/${groupId}/pages/${nextPageId}/edit-answer-type`)
  } else {
    // add a new question
    res.redirect(`/form-designer/pages/${nextPageId}/edit-answer-type`)
  }
}
router.get('/form-designer/pages/new', newPage)
router.get('/form-designer/groups/:groupId(\\d+)/pages/new', newPage)


/* ANSWER TYPE
============== */

// Edit answer type - display 
editAnswerTypeGet = function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var groupId = req.params.groupId ? parseInt(req.params.groupId, 10) : null
  var groupData = req.session.data.groups[groupId]

  // get the previous page URL
  var previousPage = req.session.data.referer
  // now we can set the back link data (text and url)
  var tempArray = backLink(previousPage, pageIndex, pageData)

  return res.render('form-designer/pages/edit-answer-type', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    groupData: groupData,
    previousPageLink: tempArray[0].previousPageLink,
    previousPageText: tempArray[0].previousPageText
  })
}
router.get('/form-designer/pages/:pageId(\\d+)/edit-answer-type', editAnswerTypeGet)
router.get('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/edit-answer-type', editAnswerTypeGet)

// Route used to find correct next step - answer type > settings page || edit question page
editAnswerType = function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var groupId = req.params.groupId ? parseInt(req.params.groupId, 10) : null 

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
        'pageIndex': nextPageId,
        'addToGroup': groupId
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
}
router.post('/form-designer/pages/:pageId(\\d+)/edit-answer-type', editAnswerType)
router.post('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/edit-answer-type', editAnswerType)


/* START selection from a list of options */
// Edit answer type settings - display
editSelectQuestionGet = function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var groupId = req.params.groupId ? parseInt(req.params.groupId, 10) : null
  var groupData = req.session.data.groups[groupId]

  // get the previous page URL
  var previousPage = req.session.data.referer
  // now we can set the back link data (text and url)
  var tempArray = backLink(previousPage, pageIndex, pageData)

  return res.render('form-designer/pages/edit-select-question', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    groupData: groupData,
    previousPageText: tempArray[0].previousPageText,
    previousPageLink: tempArray[0].previousPageLink
  })
}
router.get('/form-designer/pages/:pageId(\\d+)/edit-select-question', editSelectQuestionGet)
router.get('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/edit-select-question', editSelectQuestionGet)

// Edit answer type settings - route to what is your question page for select from list answer type
editSelectQuestion = function (req, res) {
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
}
router.post('/form-designer/pages/:pageId(\\d+)/edit-select-question', editSelectQuestion)
router.post('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/edit-select-question', editSelectQuestion)
/* END of selection from a list of options */


/* START secondary answer type settings */
// Edit answer type settings - display
editSettingsGet = function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var groupId = req.params.groupId ? parseInt(req.params.groupId, 10) : null
  var groupData = req.session.data.groups[groupId]

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
    groupData: groupData,
    previousPageText: tempArray[0].previousPageText,
    previousPageLink: tempArray[0].previousPageLink
  })
}
router.get('/form-designer/pages/:pageId(\\d+)/edit-settings', editSettingsGet)
router.get('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/edit-settings', editSettingsGet)

// Edit answer type settings - route used to find correct next step - settings page > edit question page
editSettings = function (req, res) {
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
}
router.post('/form-designer/pages/:pageId(\\d+)/edit-settings', editSettings) 
router.post('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/edit-settings', editSettings) 
/* END secondary answer type settings */


/* QUESTION
=========== */

/* START editing question text and hint text */
// Edit a user-created question
editQuestionGet = function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var groupId = req.params.groupId ? parseInt(req.params.groupId, 10) : null
  var groupData = req.session.data.groups[groupId]

  // get the previous page URL
  var previousPage = req.session.data.referer
  // now we can set the back link data (text and url)
  var tempArray = backLink(previousPage, pageIndex, pageData)

  return res.render('form-designer/pages/edit', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    groupData: groupData,
    previousPageText: tempArray[0].previousPageText,
    previousPageLink: tempArray[0].previousPageLink
  })
}
router.get('/form-designer/pages/:pageId(\\d+)/edit', editQuestionGet)
router.get('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/edit', editQuestionGet)

// Route used to find correct next step - edit question page > answer type
editQuestion = function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var additionalGuidance = req.session.data['additional-guidance']
  var { questionOptional } = req.session.data

  var repeatQuestion = req.session.data.repeatQuestion ? req.session.data.repeatQuestion : null

  var repeatQ = req.session.data.groupQuestions ? req.session.data.groupQuestions : null
  if (repeatQ && repeatQ == 'newQuestionRepeats') {
    pageData['repeatQuestion'] = 'Yes'
    pageData['minLoop'] = req.session.data.minLoop ? req.session.data.minLoop : 1
    req.session.data.minLoop = undefined
    pageData['maxLoop'] = req.session.data.maxLoop ? req.session.data.maxLoop : 99
    req.session.data.maxLoop = undefined
  }

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
  }
  req.session.data['long-title'] = undefined

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

  /* IF we are on Add another journey / prototype 1 then we need to hide the optional question */
  /*
  if (pageData['type'] != 'select') and ((data.groupQuestions != 'newQuestionRepeats') or (pageData.repeatQuestion != 'Yes')
    don’t show optional question
  else 
    show optional question
  */

  if ((pageData.type != 'select') && (req.session.data.addJourney) && ((!pageData.repeatQuestion) || (pageData.repeatQuestion != 'Yes'))) {
    // if mandatory or optional hasn’t been selecgted, then throw an error
    if (!questionOptional || !questionOptional.length) {
      errors['questionOptional'] = {
        text: 'Select ‘mandatory’ if people have to answer this question',
        href: "#questionOptional"
      }
    } else {
      pageData['questionOptional'] = questionOptional
    }
    req.session.data['questionOptional'] = undefined
  }




  if ((req.session.data.addJourney) && (req.session.data.addJourney == 'addAnother2')) {
    // if no additional guidance answer, then throw an error
    if (!repeatQuestion || !repeatQuestion.length) {
      errors['repeatQuestion'] = {
        text: 'Select ‘Yes’ to let people answer this question more than once',
        href: "#repeatQuestion"
      }
    // otherwise add question text to pageData
    } else {
      pageData['repeatQuestion'] = repeatQuestion
    }
    req.session.data['repeatQuestion'] = undefined
}

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
    // if user needs to add detailed guidance go here first
    return res.redirect(`additional-guidance`)
  } else if (repeatQuestion == 'Yes') {
    // else if user wants to repeat question go to check if it is part of a set or single question
    return res.redirect(`add-to-set`)
  } else {
    // if no detailed guidance, and no repeat then go to check question page
    return res.redirect(`check-question`)
  }
}
router.post('/form-designer/pages/:pageId(\\d+)/edit', editQuestion)
router.post('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/edit', editQuestion)
/* END editing question text and hint text */


/* START adding additional guidance */
// Add additional guidance
additionalGuidanceGet = function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var groupId = req.params.groupId ? parseInt(req.params.groupId, 10) : null
  var groupData = req.session.data.groups[groupId]

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
    groupData: groupData,
    successMessage,
    previousPageText: tempArray[0].previousPageText,
    previousPageLink: tempArray[0].previousPageLink
  })
}
router.get('/form-designer/pages/:pageId(\\d+)/additional-guidance', additionalGuidanceGet)
router.get('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/additional-guidance', additionalGuidanceGet)

// Add additional guidance text route
additionalGuidance = function (req, res) {
  var action = req.session.data.action
  // clear the action so it doesn't change the next page load
  req.session.data.action = undefined

  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]
  
  var repeatQuestion = pageData.repeatQuestion ? pageData.repeatQuestion : null

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
    if ((req.session.data.addJourney == 'addAnother2') && (repeatQuestion == 'Yes')) {
      // if user selected to repeat question go to check if it is part of a set or single question
      return res.redirect(`add-to-set`)
    } else {
      // otherwise go to check question
      res.redirect('check-question')
    }
  }
}
router.post('/form-designer/pages/:pageId(\\d+)/additional-guidance', additionalGuidance)
router.post('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/additional-guidance', additionalGuidance)
/* END adding additional guidance */


/* START add question to set */
// GET add-to-set page
addToSetGet = function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  return res.render('form-designer/pages/add-to-set', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData
  })
}
router.get('/form-designer/pages/:pageId(\\d+)/add-to-set', addToSetGet)
router.get('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/add-to-set', addToSetGet)
// POST add-to-set page
addToSetPost = function (req, res) {
  var { addToSet } = req.session.data
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var groupId = req.session.data.groups.length

  const errors = {};

  // if no minimum loop has been provided, then throw an error
  if (!addToSet || !addToSet.length) {
    errors['addToSet'] = {
      text: 'Select ‘Yes’ if you want to add this question to a set',
      href: "#addToSet"
    }
  } else {
    pageData['addToSet'] = req.session.data.addToSet
  }
  req.session.data.addToSet = undefined

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/pages/add-to-set', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      errors,
      errorList,
      containsErrors
    })
  } else {
    if (addToSet == 'Yes') {
      if (req.session.data.groups.length > 0) {
        // if there are existing question sets go to list page
        res.redirect(`/form-designer/pages/${pageId}/choose-group`)
      } else {
        // otherwise go to add a new set
        res.redirect(`/form-designer/pages/${pageId}/groups/${groupId}/new`)
      }
    } else {
      res.redirect('add-loop')
    }
  }
}
router.post('/form-designer/pages/:pageId(\\d+)/add-to-set', addToSetPost)
router.post('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/add-to-set', addToSetPost)

// GET add-loop page
addLoopGet = function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  return res.render('form-designer/pages/add-loop', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData
  })
}
router.get('/form-designer/pages/:pageId(\\d+)/add-loop', addLoopGet)
// POST add-loop page
addLoop = function (req, res) {
  var { minLoop, maxLoop } = req.session.data
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  const errors = {};

  // if no minimum loop has been provided, then throw an error
  if (!minLoop || !minLoop.length) {
    errors['minLoop'] = {
      text: 'Enter the minimum number of times this question needs to be answered',
      href: "#minimum-loop"
    }
  } else {
    pageData['minLoop'] = minLoop
  }
  req.session.data.minLoop = undefined

  // if no minimum loop has been provided, then throw an error
  if (!maxLoop || !maxLoop.length) {
    errors['maxLoop'] = {
      text: 'Enter the maximum number of times this question can be answered',
      href: "#maximum-loop"
    }
  } else {
    pageData['maxLoop'] = maxLoop
  }
  req.session.data.maxLoop = undefined

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/pages/add-loop', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      errors,
      errorList,
      containsErrors
    })
  } else {
    res.redirect('check-question')
  }
}
router.post('/form-designer/pages/:pageId(\\d+)/add-loop', addLoop)

// GET - render group/choose-group page
chooseGroup = function (req, res) {
  var { groups, pages } = req.session.data
  var groupId = parseInt(req.params.groupId, 10)
  var groupData = req.session.data.groups[groupId]

  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  return res.render('form-designer/groups/choose-group', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    groups: groups,
    groupData: groupData
  })
}
router.get('/form-designer/pages/:pageId(\\d+)/choose-group', chooseGroup)
// POST groups/choose-group page
editGroupPost = function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var groupId = req.session.data.addToGroup
  var groupData = req.session.data.groups[groupId]

  var action = req.session.data.action

  const errors = {};

  // if no set name given, then throw an error
  if ((action != 'addNewGroup') && (!groupId || !groupId.length)) {
    errors['groupId'] = {
      text: 'Select the question set to add this question to or create a new set',
      href: "#addToGroup"
    }
  } else {
    pageData['addToGroup'] = groupId
  }
  req.session.data.addToGroup = undefined

  // get the previous page URL
  var previousPage = req.session.data.referer.split('/')
  previousPage = previousPage[previousPage.length - 1]

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/groups/choose-group', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      groupData: groupData,
      errors,
      errorList,
      containsErrors
    })
  } else {
    if (action === 'addNewGroup') {
      res.redirect(`/form-designer/groups/new`)
    } else {
      res.redirect(`/form-designer/pages/${pageId}/check-question?referrer=` + previousPage )
    }
  }
}
router.post('/form-designer/pages/:pageId(\\d+)/choose-group', editGroupPost)
router.post('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/choose-group', editGroupPost)


// Create a new group
// Create a new question set (group) - button journeys
router.get('/form-designer/pages/:pageId(\\d+)/groups/:groupId(\\d+)/new', function (req, res) { 
  var pageId = parseInt(req.params.pageId, 10)

  var groupId = parseInt(req.params.groupId, 10)
  var groupData = req.session.data.groups[groupId]

  // remove empty groupData if there is only one object (groupId) in array
  const groups = req.session.data.groups.filter(element => {
    if (Object.keys(element).length > 1) {
      return true
    }
    return false
  })
  // Save the groups
  req.session.data.groups = groups

  // reset highestGroupId to number of groups
  req.session.data.highestGroupId = parseInt(groups.length - 1)

  var nextGroupId = req.session.data.groups.length

  if (!groupData) {
    req.session.data.groups.push({
      'groupIndex': nextGroupId
    })
  }
  // add a new question set (group)
  res.redirect(`/form-designer/pages/${pageId}/groups/${groupId}/edit-group`)
})
// GET - render groups/edit-group page
editGroup = function (req, res) {
  var groupId = parseInt(req.params.groupId, 10)
  var groupData = req.session.data.groups[groupId]

  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  return res.render('form-designer/groups/edit-group', {
    pageId: pageId,
    pageIndex: pageIndex,
    pageData: pageData,
    groupData: groupData
  })
}
router.get('/form-designer/pages/:pageId(\\d+)/groups/:groupId(\\d+)/edit-group', editGroup)
router.get('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/edit-group', editGroup)
// POST groups/edit-group page
editGroupPost = function (req, res) {
  var { groupName, minLoop, maxLoop } = req.session.data
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var groupId = parseInt(req.params.groupId, 10)
  var groupData = req.session.data.groups[groupId]

  const errors = {};

  // if no set name given, then throw an error
  if (!groupName || !groupName.length) {
    errors['groupName'] = {
      text: 'Give your question set a name',
      href: "#group-name"
    }
  } else {
    pageData['addToGroup'] = groupId
    groupData['groupName'] = groupName
  }
  req.session.data.groupName = undefined

  // if no minimum loop has been provided, then throw an error
  if (!minLoop || !minLoop.length) {
    errors['minLoop'] = {
      text: 'Enter the minimum number of times this question needs to be answered',
      href: "#minimum-loop"
    }
  } else {
    groupData['minLoop'] = minLoop
  }
  req.session.data.minLoop = undefined

  // if no minimum loop has been provided, then throw an error
  if (!maxLoop || !maxLoop.length) {
    errors['maxLoop'] = {
      text: 'Enter the maximum number of times this question can be answered',
      href: "#maximum-loop"
    }
  } else {
    groupData['maxLoop'] = maxLoop
  }
  req.session.data.maxLoop = undefined

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  // If there are errors on the page, redisplay it with the errors
  if(containsErrors) {
    return res.render('form-designer/groups/edit-group', {
      pageId: pageId,
      pageIndex: pageIndex,
      pageData: pageData,
      groupData: groupData,
      errors,
      errorList,
      containsErrors
    })
  } else {
    res.redirect(`/form-designer/pages/${pageId}/check-question`)
  }
}
router.post('/form-designer/pages/:pageId(\\d+)/groups/:groupId(\\d+)/edit-group', editGroupPost)
router.post('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/edit-group', editGroupPost)

/* END add question to set */


/* REVIEW AND SAVE QUESTION 
=========================== */

// Check your question - middleware
checkQuestionUse = function (req, res, next) {

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
}
router.use('/form-designer/pages/:pageId(\\d+)/check-question', checkQuestionUse)
router.use('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/check-question', checkQuestionUse)

// Check your question - display the page
checkQuestionGet = function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var groupId = req.params.groupId ? parseInt(req.params.groupId, 10) : null
  var groupData = req.session.data.groups[groupId]

  var editNextPageId = pageId + 1
  var nextActionText = 'Add a question'
  var nextActionURL = `../new`

  if ((req.session.data.addJourney == 'addAnother1') && (pageData.addToGroup == null)) {
    // start from the what do you want to add - single question, repeating question or question set
    nextActionURL = `/form-designer/groups/group-or-question`
  }

  if ((req.session.data.addJourney == 'addAnother1') && (pageData.addToGroup != null)) {
    var nextActionText = 'Add a question to this set'
  }

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
    groupData: groupData,
    successMessage,
    nextActionText,
    nextActionURL,
    editingExistingQuestion,
    previousPageText: tempArray[0].previousPageText,
    previousPageLink: tempArray[0].previousPageLink
  })
}
router.get('/form-designer/pages/:pageId(\\d+)/check-question', checkQuestionGet)
router.get('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/check-question', checkQuestionGet)

// Check your question - route used to find correct next step - edit question page > answer type
checkQuestion = function (req, res) {
  var action = req.session.data.action
  // clear the action so it doesn't change the next page load
  req.session.data.action = undefined

  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var groupId = req.params.groupId ? parseInt(req.params.groupId, 10) : null

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

  if (action === 'completeSet') {
    return res.redirect(`/form-designer/groups/${groupId}/check-group`)
  } else if (action === 'savePreview') {
    return res.redirect(`preview-question`)
  } else {
    return res.redirect(req.path)
  }
}
router.post('/form-designer/pages/:pageId(\\d+)/check-question', checkQuestion)
router.post('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/check-question', checkQuestion)


/* PREVIEW QUESTION
=================== */

// Preview question - display
previewQuestionGet = function (req, res) {
  var pageId = parseInt(req.params.pageId, 10)
  var pageIndex = pageId
  var pageData = req.session.data.pages[pageIndex]

  var groupId = req.params.groupId ? parseInt(req.params.groupId, 10) : null
  var groupData = req.session.data.groups[groupId]

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
    groupData: groupData,
    successMessage,
    nextActionText,
    nextActionURL,
    previousPageText: tempArray[0].previousPageText,
    previousPageLink: tempArray[0].previousPageLink
  })
}
router.get('/form-designer/pages/:pageId(\\d+)/preview-question', previewQuestionGet)
router.get('/form-designer/groups/:groupId(\\d+)/pages/:pageId(\\d+)/preview-question', previewQuestionGet)


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