// Added functionality to Gios (named below) script to clear a local class folder beforehand, and open the project in atom and live server afterward.

// @name         Clone Github Pullrequest
// @namespace    https://giodamelio.com
// @version      0.2.0
// @description  Gives you the commands to clone a github pull request easily
// @author       Gio d'Amelio
// @match        https://github.com/*/*/pull/*
// @grant        GM_setClipboard
// ==/UserScript==

( function () {
  'use strict';
  // Keep track of the output commands
  const outputCommands = [];

  // Add button to page
  const button = document.createElement( 'button' );
  button.innerHTML = 'Clone Pull Request';
  button.className = 'btn btn-sm';
  document.body
    .getElementsByClassName( 'gh-header-title' )[ 0 ]
    .appendChild( button );

  // When the user clicks the button copy the commands
  button.onclick = function () {
    // Get the user, repo and pull number from the url
    const [ _, user, repo, _1, pullNumber ] = window.location.pathname.split( '/' );

    // Make a request to the github api
    fetch( `https://api.github.com/repos/${user}/${repo}/pulls/${pullNumber}` )
      .then( response => {
        return response.json().then( data => {
          if ( response.status !== 200 ) {
            throw new Error( data.message );
          }
          return data;
        } );
      } )
      .then( data => {
        // Clear grading repo and cd into it
        outputCommands.push( `rm -rf ~/cf/201/* && cd ~/cf/201` );

        // Create the first command to pull the repo
        outputCommands.push(
          `git clone https://github.com/${data.base.repo.owner.login}/${data
            .base.repo.name}`
        );
        outputCommands.push( `cd ${repo}` );

        // You can't clone to the master branch since it already exists,
        // so we choose another name if the made a pull from master
        const localBranchName = data.head.ref === 'master' ?
          'not-master' :
          data.head.ref;

        // Create the command to fetch and checkout the specific pull request
        outputCommands.push( `git fetch origin pull/${data.number}/head:${localBranchName}` );
        outputCommands.push( `git checkout ${localBranchName}  && atom . && live-server` );
        // Join the output commands togather so they can be run
        GM_setClipboard( outputCommands.join( '; ' ) );
        alert( 'Commands copied to clipboard' );
      } )
      .catch( err => {
        alert( `Something went wrong:\n  ${err.message}` );
      } );
  };
} )();
