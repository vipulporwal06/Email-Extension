// popup.js

document.addEventListener('DOMContentLoaded', () => {
  let sendEmailButton = document.getElementById('sendEmailButton');

  sendEmailButton.addEventListener('click', () => {
    alert('Email sent successfully!');
    setTimeout(() => {
      location.reload();
    }, 900);
    
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
      if (!chrome.runtime.lastError) {
        let recipientEmails = document.getElementById('recipientEmails').value.split(',');
        console.log(recipientEmails);
        // Fetch the content of another HTML file
        fetch('index.html')
        .then(response => response.text())
        .then(indexHtml => {
          // Continue with sending the email and attaching the HTML file
          recipientEmails.forEach(recipient => {
          sendEmail(token, indexHtml, recipient);
          })    
        })
          .catch(error => console.error('Error loading index.html:', error));     
      }
    });
  });
});

function sendEmail(token, flyerHtml, recipientEmails) {
  // Greetings and content of the email
  const helloMessage = '<b>Hello,</b>';
  const thankYouMessage = '<b>Thanks & Regards,<br> Vipul Porwal';
  // Create a MIME message with the HTML file as an attachment
  let message = [
    `From: Vipul Porwal <vipul.porwal@dotvik.com>`,
    `To: ${recipientEmails}`,
    'Subject: AIS Flyer',
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