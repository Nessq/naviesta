$(document).ready(function () {
  var phoneInputID = '#phone';

  var input = document.querySelector(phoneInputID);

  if (input) {
    window.iti = window.intlTelInput(input, {
      formatOnDisplay: true,
      geoIpLookup: function (success, failure) {
        try {
          $.get('https://ipinfo.io', function () {}, 'jsonp').always(function (resp) {
            var countryCode = resp && resp.country ? resp.country : 'us';
            success(countryCode);
          });
        } catch (er) {
          console.log(er);
        }
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

  $('a[href*="#"]').on('click', function(e){
    e.preventDefault();
    const blockID = this.getAttribute('href').substr(1);

    setTimeout(()=>{
      document.getElementById(blockID).scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
    
  })


  function sendDataOnEmail(data) {
    var $btn = $('button[type="submit"]');
    $.ajax({
      type: 'POST',
      url: 'send.php',
      data: data,
      beforeSend: function () {
        $btn.addClass('sending');
      },
      success: function (res) {
        $('#form')[0].reset();
        $btn
          .parent()
          .append('<div class="thanks-mess">Thank you, your request has been sent!</div>');
      },
      complete: function () {
        $btn.removeClass('sending');
      },
    });
  }

  var $cont = document.querySelector('.cont');
  var $elsArr = [].slice.call(document.querySelectorAll('.el'));
  var $closeBtnsArr = [].slice.call(document.querySelectorAll('.el__close-btn'));
  var tempOffset = 0;
  var $cai = $('.close-item-active');

  $cai.on('click', function () {
    $('.el.s--active .el__close-btn').click();
  });
  setTimeout(function () {
    $cont.classList.remove('s--inactive');
  }, 200);

  $elsArr.forEach(function ($el) {
    $el.addEventListener('click', function () {
      if (this.classList.contains('s--active')) return;
      $cont.classList.add('s--el-active');
      this.classList.add('s--active');
      tempOffset = $cont.scrollLeft;
      $($cont).stop(true, true).delay(500).animate({ scrollLeft: 0 }, 500);
      $cai.addClass('active');
    });
  });

  $closeBtnsArr.forEach(function ($btn) {
    $btn.addEventListener('click', function (e) {
      e.stopPropagation();
      $cont.classList.remove('s--el-active');
      document.querySelector('.el.s--active').classList.remove('s--active');
      $cai.removeClass('active');
      $($cont).stop(true, true).delay(1500).animate({ scrollLeft: tempOffset }, 500);
    });
  });

  let popupBg = document.querySelector('.popup__bg');
  let popup = document.querySelector('.popup');
  let openPopupButtons = document.querySelectorAll('.open-popup');
  let closePopupButton = document.querySelector('.close-popup');
  let nextPopup = document.querySelector('.next-popup');
  let currentPopup = null;

  function renderItemPopup(id, loader = false) {
    const containerContent = document.querySelector('[data-popup-index="' + id + '"]');
    currentPopup = +id;
    const content = {
      img: containerContent.querySelector('.img').innerText,
      pos: containerContent.querySelector('.pos').innerText,
      name: containerContent.querySelector('.name').innerText,
      desc: containerContent.querySelector('.desc').innerHTML,
    };
    
    let popContent = popup.querySelector('.popup-content');
    let popImg = popup.querySelector('.popup-content__image img');
    let popPos = popup.querySelector('.popup-content__position');
    let popName = popup.querySelector('.popup-content__name');
    let popDesc = popup.querySelector('.popup-content__desc');

    
    if (loader) {
      popContent.classList.add('loading');
      setTimeout(() => {
        popContent.classList.remove('loading');
        popContent.classList.add('preloading');
      }, 250);
      setTimeout(() => {
        popImg.setAttribute('src', content.img);
        popPos.innerText = content.pos;
        popName.innerText = content.name;
        popDesc.innerHTML = content.desc;
        popContent.classList.remove('preloading');
        let nextContainer = document.querySelector('[data-popup-index="' + (+id + 1) + '"]');
        if (nextContainer === null) {
          nextPopup.style.display = 'none';
        } else {
          nextPopup.style.display = 'flex';
        }
      }, 500);
    } else {
      popImg.setAttribute('src', content.img);
      popPos.innerText = content.pos;
      popName.innerText = content.name;
      popDesc.innerHTML = content.desc;
      let nextContainer = document.querySelector('[data-popup-index="' + (+id + 1) + '"]');
      if (nextContainer === null) {
        nextPopup.style.display = 'none';
      } else {
        nextPopup.style.display = 'flex';
      }
    }

  }

  openPopupButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.add('popup-opened');
      popupBg.classList.add('active');
      popup.classList.add('active');
      let id = button.closest('.about-item').getAttribute('data-popup-index');
      renderItemPopup(id);
    });
  });

  nextPopup.addEventListener('click', () => {
    renderItemPopup(currentPopup + 1, true);
  });
  closePopupButton.addEventListener('click', () => {
    popupBg.classList.remove('active');
    popup.classList.remove('active');
    document.body.classList.remove('popup-opened');
    currentPopup = null;
  });

  document.addEventListener('click', (e) => {
    if (e.target === popupBg) {
      document.body.classList.remove('popup-opened');
      popupBg.classList.remove('active');
      popup.classList.remove('active');
      currentPopup = null;
    }
  });

  $scroller = document.querySelector('.cont-scroller .cont-scroller__diff')
  let allWidth = $cont.scrollWidth;

  function scrollerServices(e){
        let $cn = e.target;
        if($cn === undefined) {
          $cn = $cont;
        }
        
        let left = $cn.scrollLeft;
        let percent =  (left / allWidth) * 100;

    
        $scroller.style.width = (($cn.offsetWidth / allWidth) * 100) + '%';
        $scroller.style.left = percent + '%';
  }

  $cont.addEventListener('scroll', scrollerServices);
  scrollerServices($cont);

  function toggleMenu(opening = true){
    if(opening){
      $('.burger').addClass('active');
      $('body').addClass('menu-opened');
    }else{
      $('.burger').removeClass('active');
      $('body').removeClass('menu-opened');
    }
    
  }

  $('.burger').on('click', function(e){
    $btn = $(this);
    if($btn.hasClass('active')){
      toggleMenu(false);
    }else{
      toggleMenu(true);
    }
  });

  $(document).on('click', '.menu-opened .header-nav .menu a', function(){
    toggleMenu(false);
  })

});
