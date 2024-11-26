const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()

/* ORGANISATION ADMIN VIEWS
=========================== */

// Your groups
router.get('/product-pages/org-admin/your-groups', function (req, res) {
  const { groupsList } = req.session.data

  if (req.session.data.upgradeNotification === false) {
    upgradeNotification = false
  } else {
    upgradeNotification = true
  }

  return res.render('product-pages/org-admin/your-groups', {
    upgradeNotification,
    groupsList: groupsList
  })
})

// Name your group
router.post('/product-pages/org-admin/create-new-group', function (req, res) {
  const errors = {};
  const { groupName, groupsList } = req.session.data

  var groupURL = groupName.replaceAll(' ', '-')

  // If the user hasn’t entered a name for their group
  if (!groupName || !groupName.length) {
    errors['groupName'] = {
      text: 'Enter a name for the group',
      href: "#group-name"
    }
  } else {
    groupsList.push({
      "groupName": groupName,
      "createdBy": "Firstname Lastname",
      "groupStatus": "Trial",
      "formsList": []
    })
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if (containsErrors) {
    res.render('product-pages/org-admin/create-new-group', { errors, errorList, containsErrors })
  } else {
    res.redirect(groupURL + '/your-forms')
  }
})

// Edit members of this group
router.get('/product-pages/org-admin/:groupForms/edit-members', function (req, res) {
  const { groupMembers } = req.session.data
  var { action } = req.session.data

  var successMessage = req.session.data.successMessage
  req.session.data.successMessage = undefined

  // IF we are removing a user, render new groupMembers and a successMessage
  if (action.includes('removeUser')) {
    // get the person position to remove via remove button value
    var remove = action.split("-") // splits the ‘action’ value into 2
    var personToRemove = remove.pop() // sets personToRemove value to the loop.index0 we passed through

    // only splice array when item is found
    if (personToRemove > -1) {
      var removeUserName = groupMembers[personToRemove]['userName'] // temp set the person’s name we are removing to show in the success message
      groupMembers.splice(personToRemove, 1) // 2nd parameter means remove one item only
    }

    successMessage = removeUserName + ' has been removed from this group'
    req.session.data.action = undefined // reset the action to avoid issues
  }

  // IF we are removing a user, render new groupMembers and a successMessage
  if (action.includes('changeUserType')) {
    // get the person position to remove via change button value
    var userAction = action.split("-") // splits the ‘action’ value into 2
    var personToUpdate = userAction.pop() // sets personToUpdate value to the loop.index0 we passed through
    
    // only splice array when item is found
    if (personToUpdate > -1) {
      var updateUserName = groupMembers[personToUpdate]['userName'] // temp set the person’s name we are changing to show in the success message
      var updateUserType = groupMembers[personToUpdate]['userType'] // temp set the person’s permissions we are changing to show in the success message

      // change userType from current
      if (updateUserType === 'Group admin') {
        groupMembers[personToUpdate]['userType'] = 'Editor'
        successMessage = updateUserName + ' is now an editor'
      } else {
        groupMembers[personToUpdate]['userType'] = 'Group admin'
        successMessage = updateUserName + ' is now a group admin'
      }
    }

    req.session.data.action = undefined // reset the action to avoid issues
  }


  return res.render('product-pages/org-admin/edit-members', {
    groupMembers: groupMembers, // return the list of users
    successMessage
  })
})

// Add an editor or group admin to this group
router.post('/product-pages/org-admin/:groupForms/add-new-member', function (req, res) {
  const errors = {}
  const { emailToAdd } = req.session.data
  const { userRoleToAdd } = req.session.data
  const { groupMembers } = req.session.data
  const { formsUsers } = req.session.data

   // if the user hasn’t selected a role for this user throw and error
  if (!userRoleToAdd) {
    errors['userRoleToAdd'] = {
      text: 'Select the role they should have in this group',
      href: "#userRoleToAdd"
    }
  }

  // If there are any errors with the email input we should show a specific error message
  if (!emailToAdd || !emailToAdd.length) {
    errors['emailToAdd'] = {
      // if the email has been left blank
      text: 'Enter an email address',
      href: "#add-email"
    }
  } else if (!emailToAdd.includes('gov.uk') || !emailToAdd.includes('@')) {
    // if the email doesn’t include gov.uk in it, or isn’t an email format (doesn’t include an ‘@’ symbol)
    errors['emailToAdd'] = {
      text: 'Enter an email address in the correct format, like name@example.gov.uk',
      href: "#add-email"
    }
  } else if (!emailToAdd.includes('@digital.cabinet-office.gov.uk')) {
    // if the email isn’t a digital.cabinet-office.gov.uk email
    errors['emailToAdd'] = {
      text: 'Enter an email address from your organisation',
      href: "#add-email"
    }
  } else if (!formsUsers.filter(key => key.userEmail === emailToAdd).length > 0) {
    // if the email doesn’t have a Forms account
    errors['emailToAdd'] = {
      text: 'This person does not have a GOV.UK Forms account',
      href: "#add-email"
    }
  } else {
    // look to see if the user already has a Forms account ('fromsUsers' in session-data-defaults.js)
    var person = formsUsers.findIndex(key => key.userEmail === emailToAdd)
    // check if they are already a member of this group ('groupMembers' default session-data-defaults.js / session.data.groupMembers)
    var alreadyExists = groupMembers.findIndex(key => key.userEmail === emailToAdd)

    // if they are NOT already part of the group add them
    if (alreadyExists < 0) {
      var personName = formsUsers[person]['userName']
      var personEmail = formsUsers[person]['userEmail']
      var personOrganisation = formsUsers[person]['userOrg']
      
      // if this person isn’t in your organisation - but has the same email?? 
      if (!personOrganisation.includes('Cabinet Office')) {
        errors['emailToAdd'] = {
          text: 'This person has a different organisation set for their GOV.UK Forms account',
          href: "#add-email"
        }
      } else {
        if (userRoleToAdd) {
          groupMembers.push({
            'userName': personName,
            'userEmail': personEmail,
            'userType': userRoleToAdd
          })
        }
        req.session.data.successMessage = personName + ' has been added to this group and we’ve sent them an email to let them know'
      }
    } else {
      // if the email doesn’t have a Forms account throw and error
      errors['emailToAdd'] = {
        text: 'This person is already a member of this group',
        href: "#add-email"
      }
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if (containsErrors) {
    res.render('product-pages/org-admin/add-new-member', { errors, errorList, containsErrors })
  } else {
    res.redirect('edit-members')
  }
})

// Upgrade this group question page
router.get('/product-pages/org-admin/:groupForms/upgrade-group', function (req, res) {
  return res.render('product-pages/org-admin/upgrade-group')
})
// Upgrade this group
router.post('/product-pages/org-admin/:groupForms/upgrade-group', function (req, res) {
  const errors = {};
  const { upgradeGroupAnswer } = req.session.data

  // If the user hasn’t entered a name for their group
  if (!upgradeGroupAnswer) {
    errors['upgradeGroupAnswer'] = {
      text: 'Select yes if you want to upgrade this group',
      href: "#upgradeGroupAnswer"
    }
  }

  if (upgradeGroupAnswer === 'Yes') {
    req.session.data.successMessage = 'This group is now active'
    // get the groupsList
    const { groupsList } = req.session.data
    // find the group being made active
    var groupToEdit = req.params.groupForms
    for (x = 0; x < groupsList.length; x++) {
      if (groupsList[x].groupName === groupToEdit.replace('-', ' ')) {
        // change the groupStatus to be “Active”
        groupsList[x].groupStatus = 'Active'
      }
    }
  } else {
    req.session.data.successMessage = undefined
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if (containsErrors) {
    res.render('product-pages/org-admin/upgrade-group', { errors, errorList, containsErrors })
  } else {
    res.redirect('your-forms')
  }
})

// Your forms
router.get('/product-pages/org-admin/:groupForms/your-forms', function (req, res) {
  var groupForms = req.params.groupForms
  var successMessage = req.session.data.successMessage
  req.session.data.successMessage = undefined

  return res.render('product-pages/org-admin/your-forms', {
    groupForms: groupForms,
    successMessage
  })
})



/* GROUP ADMIN VIEWS
==================== */

// Name your group
router.post('/product-pages/group-admin/create-new-group', function (req, res) {
  const errors = {};
  const { groupName } = req.session.data

  // If the user hasn’t entered a name for their group
  if (!groupName || !groupName.length) {
    errors['groupName'] = {
      text: 'Enter a name for the group',
      href: "#group-name"
    }
  }

  
  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if (containsErrors) {
    res.render('product-pages/group-admin/create-new-group', { errors, errorList, containsErrors })
  } else {
    res.redirect('your-forms')
  }
})

// Edit members of this group
router.get('/product-pages/group-admin/edit-members', function (req, res) {
  const { groupMembers } = req.session.data
  var { action } = req.session.data

  var successMessage = req.session.data.successMessage
  req.session.data.successMessage = undefined

  // IF we are removing a user, render new groupMembers and a successMessage
  if (action.includes('removeUser')) {
    // get the person position to remove via remove button value
    var remove = action.split("-") // splits the ‘action’ value into 2
    var personToRemove = remove.pop() // sets personToRemove value to the loop.index0 we passed through

    // only splice array when item is found
    if (personToRemove > -1) {
      // 2nd parameter means remove one item only
      var removeUserName = groupMembers[personToRemove]['userName']
      groupMembers.splice(personToRemove, 1)
    }

    successMessage = removeUserName + ' has been removed from this group'
    req.session.data.action = undefined // reset the action to avoid issues
  }
  return res.render('product-pages/group-admin/edit-members', {
    groupMembers: groupMembers, // return the list of users
    successMessage
  })
})

// Add an editor to this group
router.post('/product-pages/group-admin/add-new-member', function (req, res) {
  const errors = {};
  const { emailToAdd } = req.session.data
  const { groupMembers } = req.session.data
  const { formsUsers } = req.session.data

  // If there are any errors with the email input we should show a specific error message
  if (!emailToAdd || !emailToAdd.length) {
    errors['emailToAdd'] = {
      // if the email has been left blank
      text: 'Enter an email address',
      href: "#add-email"
    }
  } else if (!emailToAdd.includes('gov.uk') || !emailToAdd.includes('@')) {
    // if the email doesn’t include gov.uk in it, or isn’t an email format (doesn’t include an ‘@’ symbol)
    errors['emailToAdd'] = {
      text: 'Enter an email address in the correct format, like name@example.gov.uk',
      href: "#add-email"
    }
  } else if (!emailToAdd.includes('@cabinet-office.gov.uk')) {
    // if the email isn’t a cabinet-office.gov.uk email
    errors['emailToAdd'] = {
      text: 'Enter an email address from your organisation',
      href: "#add-email"
    }
  } else if (!formsUsers.filter(key => key.userEmail === emailToAdd).length > 0) {
    // if the email doesn’t have a Forms account
    errors['emailToAdd'] = {
      text: 'This person does not have a GOV.UK Forms account',
      href: "#add-email"
    }
  } else {
    // look to see if the user already has a Forms account ('fromsUsers' in session-data-defaults.js)
    var person = formsUsers.findIndex(key => key.userEmail === emailToAdd)
    // check if they are already a member of this group ('groupMembers' default session-data-defaults.js / session.data.groupMembers)
    var alreadyExists = groupMembers.findIndex(key => key.userEmail === emailToAdd)

    // if they are NOT already part of the group add them
    if (alreadyExists < 0) {
      var personName = formsUsers[person]['userName']
      var personEmail = formsUsers[person]['userEmail']
      var personOrganisation = formsUsers[person]['userOrg']
      
      // if this person isn’t in your organisation - but has the same email?? 
      if (!personOrganisation.includes('Cabinet Office')) {
        errors['emailToAdd'] = {
          text: 'This person has a different organisation set for their GOV.UK Forms account',
          href: "#add-email"
        }
      } else {
        groupMembers.push({
          'userName': personName,
          'userEmail': personEmail,
          'userType': 'Editor'
        })
        req.session.data.successMessage = personName + ' has been added to this group and we’ve sent them an email to let them know'
      }
    } else {
      // if the email doesn’t have a Forms account throw and error
      errors['emailToAdd'] = {
        text: 'This person is already a member of this group',
        href: "#add-email"
      }
    }
  }

  // Convert the errors into a list, so we can use it in the template
  const errorList = Object.values(errors)
  // If there are no errors, redirect the user to the next page
  // otherwise, show the page again with the errors set
  const containsErrors = errorList.length > 0
  if (containsErrors) {
    res.render('product-pages/group-admin/add-new-member', { errors, errorList, containsErrors })
  } else {
    res.redirect('edit-members')
  }
})

module.exports = router
