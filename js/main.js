$(document).ready(function () {
  var phoneInputID = '#phone';

  var input = document.querySelector(phoneInputID);

  if (input) {
    window.iti = window.intlTelInput(input, {
      formatOnDisplay: true,
      geoIpLookup: function (success, failure) {
        $.get('https://ipinfo.io', function () {}, 'jsonp').always(function (resp) {
          var countryCode = resp && resp.country ? resp.country : 'us';
          success(countryCode);
        });
      },
      hiddenInput: 'full_number',
      initialCountry: 'auto',
      separateDialCode: true,
      utilsScript: 'js/intl/utils.js',
    });

    $(phoneInputID).on('countrychange', function (event) {
      if (!window.intlTelInputUtils) return;

      var selectedCountryData = iti.getSelectedCountryData();

      newPlaceholder = intlTelInputUtils.getExampleNumber(
        selectedCountryData.iso2,
        false,
        intlTelInputUtils.numberFormat.INTERNATIONAL,
      );
      iti.setNumber('');

      mask = newPlaceholder.replace(/[1-9]/g, '0').replace(/[^ ]+ /, '');

      $(this).mask(mask);
    });

    iti.promise.then(function () {
      $(phoneInputID).trigger('countrychange');
    });
  }

  $('input[type=text], input[type=tel], input[type=email]').on('focus', function () {
    $(this).removeClass('error');
  });
  $('.form').on('submit', function (e) {
    var INPUTS = {
      firstName: $('input[name="first-name"]'),
      surName: $('input[name="sur-name"]'),
      phone: $('input[name="phone"]'),
      email: $('input[name="email"]'),
    };

    e.preventDefault();
    var data = $(this).serializeArray();
    var objData = {};
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    data.forEach(({ name, value }) => {
      objData[name] = value;
    });

    if (!objData['subscribe-email']) {
      objData['subscribe-email'] = 'no';
    }

    var isValidNumber = intlTelInputUtils.isValidNumber(iti.a.value, iti.j);
    var isValidFirstName = objData['first-name'].length > 2 ? true : false;
    var isValidSurName = objData['sur-name'].length > 2 ? true : false;
    var isValidEmail = mailformat.test(objData['email']);

    if (isValidNumber && isValidFirstName && isValidSurName && isValidEmail) {
      sendDataOnEmail(data);
    } else {
      document.getElementById('form').scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      if (!isValidNumber) INPUTS.phone.addClass('error');
      if (!isValidFirstName) INPUTS.firstName.addClass('error');
      if (!isValidSurName) INPUTS.surName.addClass('error');
      if (!isValidEmail) INPUTS.email.addClass('error');
    }
  });

  $('input[name="preference"]').on('input', function (e) {
    e.preventDefault();
    var switcher = $('.switcher-active');
    var radioActive = $('input[name="preference"]:checked');
    if (radioActive.val() === 'email') switcher.addClass('pos-2');
    if (radioActive.val() === 'phone') switcher.removeClass('pos-2');
  });

  $('.switcher').on('click', function (e) {
    $('input[name="preference"]:not(:checked)').click();
  });

  const anchors = document.querySelectorAll('a[href*="#"]');

  for (let anchor of anchors) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const blockID = anchor.getAttribute('href').substr(1);

      document.getElementById(blockID).scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  function sendDataOnEmail(data) {
    var $btn = $('button[type="submit"]');
    $.ajax({
      type: 'POST',
      url: 'send.php',
      data: data,
      beforeSend: function() {
        $btn.addClass('sending');
      },
      success: function (res) {

        $('#form')[0].reset();
        $btn.parent().append('<div class="thanks-mess">Thank you, your request has been sent!</div>')

      },
      complete: function() {
        $btn.removeClass('sending');
      },
    });
  }
});
