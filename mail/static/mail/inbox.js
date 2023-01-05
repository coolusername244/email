document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // By default, load the inbox
  load_mailbox('inbox');

  // Send email data to db and redirect to sent mailbox
  document.querySelector('#compose-form').onsubmit = () => {
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
    
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
        load_mailbox('sent');
      });
    return false;
    }

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#single-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      emails.forEach(display_mailbox)
  });
}

function display_mailbox(email) {

  // create new element for each email
  const mail = document.createElement('div');

  const ul = document.createElement('ul');
  ul.classList.add("list-group", "list-group-horizontal")

  const from = document.createElement('li');
  from.classList.add("list-group-item", "from", "unread");
  from.innerHTML = `${email.sender}`;

  const subject  = document.createElement('li');
  subject.classList.add("list-group-item", "subject", "unread");
  subject.innerHTML = `${email.subject}`;

  const timestamp = document.createElement('li');
  timestamp.classList.add("list-group-item", "timestamp");
  timestamp.innerHTML = `${email.timestamp}`;

  if (email.read === true) {
    from.classList.add("read");
    from.classList.remove("unread");
    subject.classList.add("read");
    subject.classList.remove("unread");
    timestamp.classList.add("read");

  }

  mail.append(ul);
  ul.append(from, subject, timestamp);

  // add function to each email to take user to individual email
  mail.addEventListener('click', () => openEmail(email))

  // Append email to list
  document.querySelector('#emails-view').append(mail);  
}


function openEmail(email) {
  fetch(`/emails/${email.id}`)
  .then(response => response.json())
  .then(email => {
    document.querySelector('#view-sender').innerHTML = email.sender;
    document.querySelector('#view-recipient').innerHTML = email.recipients;
    document.querySelector('#view-subject').innerHTML = email.subject;
    document.querySelector('#view-timestamp').innerHTML = email.timestamp;
    document.querySelector('#view-body').innerHTML = email.body;
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#single-email-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          read: true
      })
    })
  });
}