$(function () {
  var currentLang = localStorage.getItem('cv-lang') || 'en';
  var L = {};  // labels:  L['about']['en']['title']
  var C = {};  // content: C['experience']['en'][0]

  var sectionDefs = [
    { id: 'section-header',     url: 'sections/header.html' },
    { id: 'section-profile',    url: 'sections/profile.html' },
    { id: 'section-about',      url: 'sections/about.html' },
    { id: 'section-skills',     url: 'sections/skills.html' },
    { id: 'section-portfolio',  url: 'sections/portfolio.html' },
    { id: 'section-experience', url: 'sections/experience.html' },
    { id: 'section-education',  url: 'sections/education.html' },
    { id: 'section-languages',  url: 'sections/languages.html' },
    { id: 'section-references', url: 'sections/references.html' },
    { id: 'section-contact',    url: 'sections/contact.html' },
    { id: 'section-footer',     url: 'sections/footer.html' }
  ];

  var labelFiles   = ['nav', 'profile', 'about', 'skills', 'portfolio', 'experience', 'education', 'languages', 'references', 'contact', 'footer'];
  var contentFiles = ['profile', 'about', 'skills', 'portfolio', 'experience', 'education', 'languages', 'references', 'contact'];

  // ── Load HTML sections ────────────────────────────────────────────────────
  function loadSections() {
    var promises = sectionDefs.map(function (s) {
      return $.get(s.url).then(function (html) { $('#' + s.id).html(html); });
    });
    return $.when.apply($, promises);
  }

  // ── Load all data files ───────────────────────────────────────────────────
  function loadData() {
    var lp = labelFiles.map(function (name) {
      return $.getJSON('data/labels/' + name + '.json').then(function (data) { L[name] = data; });
    });
    var cp = contentFiles.map(function (name) {
      return $.getJSON('data/content/' + name + '.json').then(function (data) { C[name] = data; });
    });
    return $.when.apply($, lp.concat(cp));
  }

  // ── Apply data-i18n label translations ───────────────────────────────────
  function applyLabels(lang) {
    $('[data-i18n]').each(function () {
      var parts = $(this).data('i18n').split('.');
      var val = L[parts[0]] && L[parts[0]][lang] && L[parts[0]][lang][parts[1]];
      if (val !== undefined) $(this).text(val);
    });
    $('[data-i18n-placeholder]').each(function () {
      var parts = $(this).data('i18n-placeholder').split('.');
      var val = L[parts[0]] && L[parts[0]][lang] && L[parts[0]][lang][parts[1]];
      if (val !== undefined) $(this).attr('placeholder', val);
    });
  }

  // ── Section renderers ─────────────────────────────────────────────────────
  function renderProfile(lang) {
    var p = C.profile[lang];
    $('#profile-bg').css('background-image', "url('" + p.backgroundImage + "')");
    $('#profile-photo').attr('src', p.photo);
    $('#profile-name').text(p.name);
    $('#profile-title').text(p.title);
    $('#profile-cv-link').attr('href', p.cvUrl);
    $('#profile-downloadCVen').text(p.downloadCVen);
    $('#profile-downloadCVes').text(p.downloadCVes);
    $('#profile-social').html(p.socialLinks.map(function (link) {
      return '<a class="btn btn-default btn-round btn-lg btn-icon" href="' + link.url + '" rel="tooltip" title="' + link.tooltip + '">' +
             '<i class="fa ' + link.icon + '"></i></a>';
    }).join(''));
  }

  function renderAbout(lang) {
    var a  = C.about[lang];
    var lb = L.about[lang];
    $('#about-summary').text(a.summary);
    $('#about-basic-info').html([
      { label: lb.email,    value: a.email },
      { label: lb.phone,    value: a.phone },
      { label: lb.address,  value: a.address },
      { label: lb.language, value: a.language }
    ].map(function (row) {
      return '<div class="row mt-3">' +
             '<div class="col-sm-4"><strong class="text-uppercase">' + row.label + ':</strong></div>' +
             '<div class="col-sm-8">' + row.value + '</div>' +
             '</div>';
    }).join(''));
  }

  function renderProgressBars(entries, containerId) {
    $('#' + containerId).html(entries.map(function (item) {
      return [
        '<div class="col-md-6">',
        '  <div class="progress-container progress-primary">',
        '    <span class="progress-badge">' + item.name + '</span>',
        '    <div class="progress">',
        '      <div class="progress-bar progress-bar-primary" data-aos="progress-full" data-aos-offset="10" data-aos-duration="2000"',
        '        role="progressbar" aria-valuenow="' + item.percent + '" aria-valuemin="0" aria-valuemax="100"',
        '        style="width: ' + item.percent + '%;"></div>',
        '      <span class="progress-value">' + item.percent + '%</span>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('\n');
    }).join('\n'));
  }

  function buildTimelineItem(title, period, bodyHtml) {
    return [
      '<div class="cc-timeline-item" data-aos="fade-up" data-aos-offset="30">',
      '  <span class="cc-timeline-dot"></span>',
      '  <div class="cc-timeline-body">',
      '    <h5 class="cc-timeline-title">' + title + '</h5>',
      '    <div class="cc-timeline-period">' + period + '</div>',
           bodyHtml,
      '  </div>',
      '</div>'
    ].join('\n');
  }

  function buildHighlights(highlights) {
    if (!highlights || !highlights.length) return '';
    return '<ul>' + highlights.map(function (h) { return '<li>' + h + '</li>'; }).join('') + '</ul>';
  }

  function renderPortfolio(lang) {
    var tabs = C.portfolio[lang].tabs;
    $('#portfolio-tabs').html(tabs.map(function (tab, i) {
      return '<li class="nav-item">' +
             '<a class="nav-link' + (i === 0 ? ' active' : '') + '" data-toggle="tab" href="' + tab.id + '" role="tablist">' +
             '<i class="fa ' + tab.icon + '" aria-hidden="true"></i></a></li>';
    }).join(''));
    $('#portfolio-panes').html(tabs.map(function (tab, i) {
      var leftItems  = tab.items.filter(function (_, idx) { return idx % 2 === 0; });
      var rightItems = tab.items.filter(function (_, idx) { return idx % 2 !== 0; });
      function buildItem(item) {
        return '<div class="cc-porfolio-image img-raised" data-aos="fade-up" data-aos-anchor-placement="top-bottom">' +
               '<a href="' + item.href + '">' +
               '<figure class="cc-effect"><img src="' + item.image + '" alt="Image"/>' +
               '<figcaption><div class="h4">' + item.title + '</div><p>' + item.subtitle + '</p></figcaption>' +
               '</figure></a></div>';
      }
      return '<div class="tab-pane' + (i === 0 ? ' active' : '') + '" id="' + tab.id + '"' + (i > 0 ? ' role="tabpanel"' : '') + '>' +
             '<div class="ml-auto mr-auto"><div class="row">' +
             '<div class="col-md-6">' + leftItems.map(buildItem).join('') + '</div>' +
             '<div class="col-md-6">' + rightItems.map(buildItem).join('') + '</div>' +
             '</div></div></div>';
    }).join(''));
  }

  function renderExperience(lang) {
    var items = C.experience[lang].map(function (entry) {
      var title = entry.role +
                  ' <span class="text-muted font-weight-normal">at</span> ' +
                  '<a href="' + entry.companyUrl + '">' + entry.company + '</a>';
      var body  = '<p><strong>Main Responsibility:</strong> ' + entry.mainResponsibility + '</p>' +
                  buildHighlights(entry.highlights);
      return buildTimelineItem(title, entry.period, body);
    }).join('\n');
    $('#experience-entries').html('<div class="cc-timeline">' + items + '</div>');
  }

  function renderEducation(lang) {
    var items = C.education[lang].map(function (entry) {
      var title = entry.title +
                  ' <span class="text-muted font-weight-normal">at</span> ' +
                  '<a href="' + entry.institutionUrl + '">' + entry.institution + '</a>';
      var body  = '<p><strong>' + entry.degree + '</strong> &mdash; ' + entry.mainDescription + '</p>' +
                  buildHighlights(entry.highlights);
      return buildTimelineItem(title, entry.period, body);
    }).join('\n');
    $('#education-entries').html('<div class="cc-timeline">' + items + '</div>');
  }

  function renderReferences(lang) {
    var entries = C.references[lang];
    $('#reference-indicators').html(entries.map(function (_, i) {
      return '<li' + (i === 0 ? ' class="active"' : '') + ' data-target="#cc-Indicators" data-slide-to="' + i + '"></li>';
    }).join('\n'));
    $('#reference-items').html(entries.map(function (entry, i) {
      return [
        '<div class="carousel-item' + (i === 0 ? ' active' : '') + '">',
        '  <div class="row">',
        '    <div class="col-lg-2 col-md-3 cc-reference-header">',
        '      <div class="row"><div class="col text-left"><img src="' + entry.image + '" alt="Image"></img></div></div>',
        '      <div class="row"><div class="col text-left"><a  href="https://www.linkedin.com/in/virgilioolivardia/details/recommendations/?detailScreenTabIndex=0">LinkedIn</a></div></div>',
        '      <div class="h5 pt-2">' + entry.name + '</div>',
        '      <p class="category">' + entry.title + '</p>',
        '    </div>',
        '    <div class="col-lg-10 col-md-9" style="white-space: pre-wrap"><p>' + entry.quote + '</p></div>',
        '  </div>',
        '</div>'
      ].join('\n');
    }).join('\n'));
  }

  function renderContact(lang) {
    var ct = C.contact[lang];
    var lb = L.contact[lang];
    /*$('#contact-wrapper').css('background-image', "url('" + ct.mapImage + "')");*/
    $('#contact-form').attr('action', ct.formAction);
    $('#contact-info').html([
      '<p class="mb-0"><strong>' + lb.address + '</strong></p>',
      '<p class="pb-2">' + ct.address + '</p>',
      '<p class="mb-0"><strong>' + lb.phone + '</strong></p>',
      '<p class="pb-2">' + ct.phone + '</p>',
      '<p class="mb-0"><strong>' + lb.email + '</strong></p>',
      '<p>' + ct.email + '</p>'
    ].join('\n'));
  }

  function updateLangButtons(lang) {
    $('#lang-select').val(lang);
  }

  // ── Full render ───────────────────────────────────────────────────────────
  function render(lang) {
    applyLabels(lang);
    renderProfile(lang);
    renderAbout(lang);
    renderProgressBars(C.skills[lang],    'skills-entries');
    renderProgressBars(C.languages[lang], 'languages-entries');
    renderPortfolio(lang);
    renderExperience(lang);
    renderEducation(lang);
    renderReferences(lang);
    renderContact(lang);
    updateLangButtons(lang);
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  loadSections().then(function () {
    loadData().then(function () {
      render(currentLang);
      $.getScript('js/now-ui-kit.js?ver=1.1.0', function () {
        $.getScript('js/aos.js?ver=1.1.0', function () {
          $.getScript('scripts/main.js?ver=1.1.0');
        });
      });
    });
  });

  $(document).on('change', '#lang-select', function () {
    currentLang = $(this).val();
    localStorage.setItem('cv-lang', currentLang);
    render(currentLang);
  });
});
