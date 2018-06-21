// import { IMockGlobal } from '../global';

// declare const global: IMockGlobal;
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//

// -- This is a parent command --
// Cypress.Commands.add('sendPing', (status: string) => {
//   const msg = JSON.stringify({ payload: { cmd: 'GAME_STATUS', value: status } });
//   if (global.ws) {
//     global.ws.send(msg);
//   }
// });


// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
