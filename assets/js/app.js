let siteConfig = {};
let contactConfig = {};

// Load configs
Promise.all([
  fetch('config/site.json').then(res => res.json()),
  fetch('config/contact.json').then(res => res.json())
])
.then(([site, contact]) => {
  siteConfig = site;
  contactConfig = contact;

  initContactUI();
  loadRecaptchaScript();
});

function initContactUI() {

  document.getElementById("submitBtn").innerText =
    contactConfig.buttonText;

  document.getElementById("fname").placeholder =
    contactConfig.fields.firstName;

  document.getElementById("lname").placeholder =
    contactConfig.fields.lastName;

  document.getElementById("contact").placeholder =
    contactConfig.fields.contact;

  document.getElementById("email").placeholder =
    contactConfig.fields.email;

  document.getElementById("message").placeholder =
    contactConfig.fields.message;
}

function loadRecaptchaScript() {
  const script = document.createElement("script");
  script.src = "https://www.google.com/recaptcha/api.js?onload=renderCaptcha&render=explicit";
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
}

function renderCaptcha() {
  grecaptcha.render("recaptcha-container", {
    sitekey: siteConfig.recaptcha.siteKey
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("contactForm")
    .addEventListener("submit", sendContact);
});

function sendContact(e) {
  e.preventDefault(); // STOP reload

  console.log("Form triggered");

  const captcha = grecaptcha.getResponse();

  if (!captcha) {
    showMessage(contactConfig.messages.captcha);
    return;
  }

  const loader = document.querySelector(".loading");
  const btn = document.getElementById("submitBtn");

  loader.style.display = "block";
  btn.disabled = true;
  btn.innerText = "Sending...";

//   const data = {
//     firstName: fname.value,
//     lastName: lname.value,
//     contact: contact.value,
//     email: email.value,
//     message: message.value,
//     captcha: captcha
//   };

    const data = {
    firstName: document.getElementById("fname").value,
    lastName: document.getElementById("lname").value,
    contact: document.getElementById("contactNumber").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value,
    captcha: captcha
    };


    // 🔥 VALIDATION CHECK
  const error = validateForm(data);
  if(error){
    showMessage("error", error);
    // 🔥 RESET UI (MAIN FIX)
    loader.style.display = "none";
    btn.disabled = false;
    btn.innerText = contactConfig.buttonText;
    return;
  }

  fetch(siteConfig.api.contactUrl, {
    method: "POST",
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(res => {
    loader.style.display = "none";
    btn.disabled = false;
    btn.innerText = contactConfig.buttonText;

    if(res.status === "success"){
      showMessage("success", contactConfig.messages.success);
      contactForm.reset();
      grecaptcha.reset();
    } else {
      showMessage("error", contactConfig.messages.error);  
    }
  })
  .catch(() => {
    loader.style.display = "none";
    btn.disabled = false;
    btn.innerText = contactConfig.buttonText;
    showMessage("error", contactConfig.messages.error);
  });
}

function validateForm(data){

  // First Name
  if(!data.firstName || data.firstName.trim() === ""){
    return "First name is required";
  }

  // Last Name
  if(!data.lastName || data.lastName.trim() === ""){
    return "Last name is required";
  }

  // 🔥 Contact validation (ONLY digits, exactly 10)
  if(!/^[0-9]{10}$/.test(data.contact)){
    return "Enter valid 10 digit contact number";
  }

  // Email validation
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)){
    return "Enter valid email address";
  }

  // Message
  if(!data.message || data.message.trim().length < 5){
    return "Message must be at least 5 characters";
  }

  return null; // all valid
}

function showMessage(type, msg){

  const errorBox = document.querySelector(".error-message");
  const successBox = document.querySelector(".sent-message");

  // reset
  errorBox.style.display = "none";
  successBox.style.display = "none";

  errorBox.innerText = "";
  successBox.innerText = "";

  if(type === "success"){
    successBox.innerText = msg;
    successBox.style.display = "block";   // 🔥 IMPORTANT
  } else {
    errorBox.innerText = msg;
    errorBox.style.display = "block";     // 🔥 IMPORTANT
  }
}