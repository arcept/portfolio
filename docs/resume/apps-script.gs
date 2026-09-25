/**
 * Résumé download log — Google Apps Script for a Google Sheet.
 *
 * Receives the name and email from the site's résumé dialog (app/about/resume/ResumeDialog.js),
 * appends a row to the sheet, and emails a notification unless the submission is a test
 * (an email containing "+test@", or the name "Test").
 *
 * Setup: see docs/resume/SETUP.md.
 */

const NOTIFY = 'contact@arcept.in'; // who gets the "someone downloaded your résumé" email
const SHEET = 'Downloads';

function doPost(e) {
  const data = JSON.parse(e.postData.contents || '{}');
  const name = String(data.name || '').slice(0, 200);
  const email = String(data.email || '').slice(0, 200);
  const files = String(data.files || 'design').slice(0, 40);
  const test = /\+test@/i.test(email) || name.trim().toLowerCase() === 'test';

  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheetByName(SHEET) || book.insertSheet(SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['When', 'Name', 'Email', 'Files', 'Test', 'Page', 'Referrer']);
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([new Date(), name, email, files, test ? 'yes' : '', String(data.page || ''), String(data.referrer || '')]);

  if (!test) {
    MailApp.sendEmail({
      to: NOTIFY,
      subject: `Résumé downloaded by ${name || 'someone'}`,
      body: `${name} <${email}> downloaded your résumé (${files}).\n\nFrom: ${data.referrer || 'direct'}\n\nThe full log: ${book.getUrl()}`,
    });
  }

  return ContentService.createTextOutput('ok');
}
