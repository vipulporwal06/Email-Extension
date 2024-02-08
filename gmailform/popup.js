// popup.js
document.addEventListener('DOMContentLoaded', () => {
  let sendEmailButton = document.getElementById('sendEmailButton');

  sendEmailButton.addEventListener('click', () => {
    let subjectEmailInput = document.getElementById('subjectEmail');
    let messageEmailInput = document.getElementById('messageEmail');
    let recipientEmailsInput = document.getElementById('recipientEmails');
    let subjectEmailInput1 = subjectEmailInput.value.split(',');
    let messageEmailInput1 = messageEmailInput.value.split(',');
    let recipientEmails = recipientEmailsInput.value.split(',');

    // Validate each email address
    if (validateEmails(recipientEmails)) {
      // Proceed with sending the email
      alert('Email sent successfully!');
      setTimeout(() => {
        location.reload();
      }, 900);

      chrome.identity.getAuthToken({ interactive: true }, function (token) {
        console.log(token)
        if (!chrome.runtime.lastError) {
          // Store the token in local storage
          storeTokenLocally(token);

          // Fetch the content of another HTML file
          fetch('index.html')
            .then(response => {
              if (!response.ok) {
                throw new Error(`Failed to fetch 'index.html': ${response.statusText}`);
              }
              return response.text();
            })
            .then(indexHtml => {
              // Continue with sending the email and attaching the HTML file
              recipientEmails.forEach(recipient => {
                sendEmail(token, indexHtml, recipient, subjectEmailInput1, messageEmailInput1);
              });
            })
            .catch(error => console.error('Error loading index.html:', error));
        }
      });
    } else {
      alert('Invalid email address. Please check and try again.');
    }
  });
});

// Function to validate email addresses
function validateEmails(emails) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emails.every(email => emailRegex.test(email.trim()));
}

// Function to store token in local storage
function storeTokenLocally(token) {
  chrome.storage.local.set({ 'authToken': token }, function () {
    console.log('Token stored:', token);
  });
}

// Function to send email
function sendEmail(token, flyerHtml, recipientEmails, subjectEmail, messageEmail) {
  // Greetings and content of the email
  const thankYouMessage = '<b>Thanks & Regards,<br> Vipul Porwal';
  // Create a MIME message with the HTML file as an attachment

  flyerHtml = flyerHtml.replace('${emailid}', encodeURIComponent(recipientEmails));
  let message = [
    `From: Vipul Porwal <vipul.porwal@dotvik.com>`,
    `To: ${recipientEmails}`,
    `Subject: ${subjectEmail}`,
    `Message: ${messageEmail}`,
    'Content-Type: multipart/mixed; boundary="boundary"',
    '',
    '--boundary',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    `${messageEmail}<br><br>\n\n${flyerHtml}\n\n${thankYouMessage}`,
    '',
    '--boundary',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
  ].join('\r\n');

  // Send the email using the Gmail API
  fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    async: true,
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: btoa(message)
    }),
  })
    .then(response => response.json())
    .then(data => {
      console.log(`Email sent to ${recipientEmails}`);
    })
    .catch(error => console.error('Error sending email:', error));
}
