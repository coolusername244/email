document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#unarchive').addEventListener('click', unarchive);
  document.querySelector('#compose-form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');
});


function load_mailbox(mailbox) {

  // Hide reply/archive/unarchive buttons
  const buttons = document.querySelectorAll('.btn-success');
  buttons.forEach((button) => {
    button.style.display = 'none';
  })
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#email-view').innerHTML = "";
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Make GET request to retrieve emails in specified mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);
    emails.forEach((email) => {

      // BUILD HTML RESPONSE
      // Create elements  
      const listGroup = document.createElement('div');
      const listGroupItem = document.createElement('div');
      const row = document.createElement('div');
      const col3First = document.createElement('div');
      const col6 = document.createElement('div');
      const col3Second = document.createElement('div');

      // Add classes to elements
      listGroup.className = 'list-group';
      listGroupItem.classList.add('list-group-item', 'list-group-item-action');
      row.className = 'row';
      col3First.className = 'col-3';
      col6.className = 'col-6';
      col3Second.className = 'col-3';
      if (email.read === true) {
        listGroupItem.classList.add('list-group-item-dark');
      } else {
        col3First.classList.add('bold');
        col6.classList.add('bold');
      }
        
      // Add content to elements
      col3First.innerHTML = email.sender;
      col6.innerHTML = email.subject;
      col3Second.innerHTML = email.timestamp;

      // Put elements together
      listGroup.appendChild(listGroupItem);
      listGroupItem.appendChild(row);
      row.append(col3First, col6, col3Second);

      // Add event listner to open an email
      listGroup.addEventListener('click', () => open_email(email, mailbox))

      // Return to DOM
      document.querySelector('#emails-view').append(listGroup);

    });
  })
  .catch((error) => {
    // Future implimentation - add custom 400/404 pages
    console.log(error);
  });
}


function open_email(email, mailbox) {

  // Update email.read to true once email is opened
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  if (mailbox === 'inbox') {
    document.querySelector('#reply').style.display = 'inline-block';
    document.querySelector('#reply').addEventListener('click', () => reply(email));
    document.querySelector('#archive').style.display = 'inline-block';
    document.querySelector('#archive').addEventListener('click', () => archive(email));
  } else if (mailbox === 'archive') {
    document.querySelector('#reply').style.display = 'inline-block';
    document.querySelector('#unarchive').style.display = 'inline-block';
    document.querySelector('#unarchive').addEventListener('click', () => unarchive(email));
  }

  // BUILD HTML RESPONSE
  // Create elements
  const card = document.createElement('div');
  const cardHeader = document.createElement('div');
  const from = document.createElement('p');
  const to = document.createElement('p');
  const subject = document.createElement('p');
  const timestamp = document.createElement('p');
  const cardBody = document.createElement('div');
  let cardText = document.createElement('p');

  // Add classes to elements
  card.className = 'card';
  cardHeader.className = 'card-header';
  cardBody.className = 'card-body';
  cardText.className = 'card-text';

  // Add content to elements
  from.innerHTML = `<span class="bold">From:</span> ${email.sender}`;
  to.innerHTML = `<span class="bold">To:</span> ${email.recipients}`;
  subject.innerHTML = `<span class="bold">Subject:</span> ${email.subject}`;
  timestamp.innerHTML = `<span class="bold">Timestamp:</span> ${email.timestamp}`;
  cardText.innerHTML = email.body.replace(/(?:\r\n|\r|\n)/g, '<br>');
  // cardText = cardText.replace(/(?:\r\n|\r|\n)/g, '<br>');


  // Put elements together
  card.append(cardHeader, cardBody);
  cardHeader.append(from, to, subject, timestamp);
  cardBody.append(cardText);

  // Return to DOM
  document.querySelector('#email-view').append(card);  
}


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function reply(email) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Hide buuttons
  document.querySelector('#reply').style.display = 'none';
  document.querySelector('#archive').style.display = 'none';


  // Populate in composition fields
  document.querySelector('#compose-recipients').value = email.sender;


  if (email.subject.slice(0, 4) !== "Re: ") {
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  } else {
    document.querySelector('#compose-subject').value = email.subject;
  }


  let replyHeading = ` \n \n \n ----------- on ${email.timestamp} ${email.sender} wrote: \n \n`;
  replyHeading = replyHeading.replace("/(\r\n|\n|\r)/gm")
  document.querySelector('#compose-body').value = replyHeading + email.body;
}


function send_email() {

  // Gather data for POST request
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  
  // Post email to database
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        load_mailbox('sent');
    })
  return false;
};


function archive(email) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
    window.location.reload();
}


function unarchive(email) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
  window.location.reload();
}