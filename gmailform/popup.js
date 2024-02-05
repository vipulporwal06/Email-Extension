// emailvalidation


// popup.js
document.addEventListener('DOMContentLoaded', () => {
  let sendEmailButton = document.getElementById('sendEmailButton');

  sendEmailButton.addEventListener('click', () => {
    let subjectEmailInput = document.getElementById('subjectEmail');
    let recipientEmailsInput = document.getElementById('recipientEmails');
    let subjectEmailInput1 = subjectEmailInput.value.split(',');
    let recipientEmails = recipientEmailsInput.value.split(',');

    // Validate each email address
    if (validateEmails(recipientEmails)) {
      // Proceed with sending the email
      alert('Email sent successfully!');
      setTimeout(() => {
        location.reload();
      }, 900);

      chrome.identity.getAuthToken({ interactive: true }, function (token) {
        if (!chrome.runtime.lastError) {
          // Fetch the content of another HTML file
          fetch('index.html')
            .then(response => response.text())
            .then(indexHtml => {
              // Continue with sending the email and attaching the HTML file
              recipientEmails.forEach(recipient => {
                sendEmail(token, indexHtml, recipient,subjectEmailInput1);
              });
            })
            .catch(error => console.error('Error loading index.html:', error));
        }
      });
    } else {
      alert('Invalid email address/es. Please check and try again.');
    }
  });
});

// Function to validate email addresses
function validateEmails(emails) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emails.every(email => emailRegex.test(email.trim()));
}

function sendEmail(token, flyerHtml, recipientEmails , subjectEmail) {
  // Greetings and content of the email
  const helloMessage = '<b>Hello,</b>';
  const thankYouMessage = '<b>Thanks & Regards,<br> Vipul Porwal';
  // Create a MIME message with the HTML file as an attachment
  let message = [
    `From: Vipul Porwal <vipul.porwal@dotvik.com>`,
    `To: ${recipientEmails}`,
    `Subject: ${subjectEmail}`,
    'Content-Type: multipart/mixed; boundary="boundary"',
    '',
    '--boundary',
    'Content-Type: text/html; charset="UTF-8"',
    '',
    `${helloMessage}\n\n${flyerHtml}\n\n${thankYouMessage}`, 
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
    .then(data => console.log('Email sent:', data))
    .catch(error => console.error('Error sending email:', error));
  console.log('Email sent to ${recipientEmail}');
}