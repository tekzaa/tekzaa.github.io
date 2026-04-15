let siteConfig = {};

fetch('config/site.json')
.then(res => res.json())
.then(data => {
  siteConfig = data;

  loadRecaptcha();
});

function loadRecaptcha() {
  const container = document.getElementById("recaptcha-container");

  container.innerHTML = `
    <div class="g-recaptcha" data-sitekey="${siteConfig.recaptcha.siteKey}"></div>
  `;

  // re-render captcha
  if (typeof grecaptcha !== "undefined") {
    grecaptcha.render(container.firstChild);
  }
}