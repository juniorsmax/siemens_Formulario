(function () {
  'use strict';
  if (typeof emailjs !== 'undefined') emailjs.init({ publicKey: 'YOUR_EMAILJS_PUBLIC_KEY' });

  var wc = document.querySelector('.wizard-card');
  if (!wc) return;

  var MARCA = wc.dataset.marca || 'Bosch';
  var DEF_ID = wc.dataset.electrodomestico || '';

  var APPS = [
    { id: 'lavadora',      name: 'Lavadora',                          icon: 'bi-moisture' },
    { id: 'lavavajillas',  name: 'Lavavajillas',                      icon: 'bi-cup-hot' },
    { id: 'frigorifico',   name: 'Frigorífico',                       icon: 'bi-snow2' },
    { id: 'campana',       name: 'Campana',                           icon: 'bi-wind' },
    { id: 'secadora',      name: 'Secadora',                          icon: 'bi-brightness-high' },
    { id: 'horno',         name: 'Horno',                             icon: 'bi-fire' },
    { id: 'vitroceramica', name: 'Vitrocerámica / Placa de Inducción', icon: 'bi-lightning-charge' },
    { id: 'termo',         name: 'Termo Eléctrico',                   icon: 'bi-thermometer-half' }
  ];

  var AVR = {
    lavadora:      ['No centrifuga', 'No enciende', 'Hace ruidos extraños', 'No calienta el agua', 'Pierde agua', 'Vibra en exceso', 'No termina el programa', 'Código de error', 'Otro problema'],
    lavavajillas:  ['No lava bien', 'No desagua', 'Pierde agua', 'No enciende', 'Hace ruidos extraños', 'La puerta no cierra bien', 'Código de error', 'Otro problema'],
    frigorifico:   ['No enfría', 'Hace ruidos extraños', 'Congela en exceso', 'Pierde agua', 'La puerta no cierra bien', 'No enciende', 'Código de error', 'Otro problema'],
    campana:       ['No extrae humos', 'Hace ruido excesivo', 'Las luces no funcionan', 'No enciende', 'Los botones no responden', 'Otro problema'],
    secadora:      ['No calienta', 'Hace ruidos extraños', 'No termina el ciclo', 'No enciende', 'Fuga de agua', 'Código de error', 'Otro problema'],
    horno:         ['No calienta', 'El ventilador no funciona', 'No enciende', 'La puerta no cierra bien', 'Temperatura incorrecta', 'Código de error', 'Otro problema'],
    vitroceramica: ['Una zona no calienta', 'La pantalla no funciona', 'No detecta la olla (inducción)', 'Los botones no responden', 'Cerámico agrietado', 'Código de error', 'Otro problema'],
    termo:         ['El agua no calienta', 'Pierde agua', 'La válvula gotea', 'Hace ruido extraño', 'El termostato no regula', 'Tarda mucho en calentar', 'Otro problema']
  };

  var d = { nombre: '', calle: '', numero: '', piso: '', puerta: '', cp: '', eid: '', enombre: '', averia: '', telefono: '', consent: false };
  var step = 1, TOTAL = 6;

  if (DEF_ID && AVR[DEF_ID]) {
    d.eid = DEF_ID;
    var defApp = APPS.filter(function (a) { return a.id === DEF_ID; })[0];
    d.enombre = defApp ? defApp.name + ' ' + MARCA : '';
  }

  function pct() { return Math.round(step / TOTAL * 100); }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function hdr() {
    return '<div class="wiz-prog-row"><span class="wiz-step">Paso ' + step + ' de ' + TOTAL + '</span><span class="wiz-pct">' + pct() + '%</span></div>' +
      '<div class="wiz-bar"><div class="wiz-fill" style="width:' + pct() + '%"></div></div>';
  }

  function v(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }

  function render() {
    document.getElementById('wizardBody').innerHTML = renderStep();
    bind();
  }

  function renderStep() {
    if (step === 1) return renderS1();
    if (step === 2) return renderS2();
    if (step === 3) return renderS3();
    if (step === 4) return renderS4();
    if (step === 5) return renderS5();
    if (step === 6) return renderS6();
    return '';
  }

  function renderS1() {
    return hdr() +
      '<h2 class="wiz-title">Datos de Contacto</h2>' +
      '<p class="wiz-sub">Complete el formulario para asistencia técnica</p>' +
      '<div class="wiz-field"><label class="wiz-label">Nombre y Apellido *</label><input class="wiz-input" id="f-nombre" type="text" placeholder="Nombre y apellido" value="' + esc(d.nombre) + '" autocomplete="name" /></div>' +
      '<div class="wiz-field"><label class="wiz-label">Calle *</label><input class="wiz-input" id="f-calle" type="text" placeholder="Nombre de la calle" value="' + esc(d.calle) + '" autocomplete="street-address" /></div>' +
      '<div class="wiz-row2">' +
        '<div class="wiz-field"><label class="wiz-label">Número *</label><input class="wiz-input" id="f-numero" type="text" placeholder="Nº" value="' + esc(d.numero) + '" /></div>' +
        '<div class="wiz-field"><label class="wiz-label">Piso *</label><input class="wiz-input" id="f-piso" type="text" placeholder="Ej: 3º" value="' + esc(d.piso) + '" /></div>' +
      '</div>' +
      '<div class="wiz-row2">' +
        '<div class="wiz-field"><label class="wiz-label">Puerta / Casa *</label><input class="wiz-input" id="f-puerta" type="text" placeholder="Ej: 2ª" value="' + esc(d.puerta) + '" /></div>' +
        '<div class="wiz-field"><label class="wiz-label">Código Postal *</label><input class="wiz-input" id="f-cp" type="text" placeholder="08001" maxlength="5" inputmode="numeric" value="' + esc(d.cp) + '" /></div>' +
      '</div>' +
      '<div class="wiz-btn-row"><button class="btn-wiz-next" id="btnNext">Siguiente →</button></div>';
  }

  function renderS2() {
    var cards = APPS.map(function (a) {
      return '<div class="app-card' + (d.eid === a.id ? ' sel' : '') + '" data-id="' + a.id + '" data-name="' + a.name + ' ' + MARCA + '">' +
        '<div class="app-icon"><i class="bi ' + a.icon + '"></i></div>' +
        '<div class="app-name">' + a.name + '</div></div>';
    }).join('');
    return hdr() +
      '<h2 class="wiz-title">Electrodoméstico</h2>' +
      '<p class="wiz-sub">Seleccione el que necesita reparar</p>' +
      '<div class="app-grid">' + cards + '</div>' +
      '<div class="wiz-btn-row"><button class="btn-wiz-prev" id="btnPrev">← Anterior</button><button class="btn-wiz-next" id="btnNext">Siguiente →</button></div>';
  }

  function renderS3() {
    var opts = (AVR[d.eid] || []).map(function (a) {
      return '<option value="' + esc(a) + '"' + (d.averia === a ? ' selected' : '') + '>' + esc(a) + '</option>';
    }).join('');
    return hdr() +
      '<h2 class="wiz-title">Tipo de Avería</h2>' +
      '<p class="wiz-sub">¿Cuál es el problema con su ' + esc(d.enombre) + '?</p>' +
      '<div class="wiz-field"><label class="wiz-label">Seleccione la avería *</label>' +
      '<select class="wiz-input" id="f-averia" style="appearance:auto;-webkit-appearance:auto;"><option value="">-- Seleccione --</option>' + opts + '</select></div>' +
      '<div class="wiz-btn-row"><button class="btn-wiz-prev" id="btnPrev">← Anterior</button><button class="btn-wiz-next" id="btnNext">Siguiente →</button></div>';
  }

  function renderS4() {
    return hdr() +
      '<h2 class="wiz-title">Datos de Contacto</h2>' +
      '<p class="wiz-sub">¿Cómo podemos contactarle?</p>' +
      '<div class="wiz-field"><label class="wiz-label">Teléfono *</label>' +
      '<input class="wiz-input" id="f-telefono" type="tel" placeholder="612345678" maxlength="9" inputmode="tel" value="' + esc(d.telefono) + '" autocomplete="tel-national" />' +
      '<p style="font-size:0.8rem;color:var(--text-muted);margin-top:6px;">9 dígitos sin espacios ni prefijo</p></div>' +
      '<div class="wiz-btn-row"><button class="btn-wiz-prev" id="btnPrev">← Anterior</button><button class="btn-wiz-next" id="btnNext">Siguiente →</button></div>';
  }

  function renderS5() {
    return hdr() +
      '<h2 class="wiz-title">Consentimiento</h2>' +
      '<p class="wiz-sub">Necesitamos su permiso para contactarle</p>' +
      '<div class="consent-box' + (d.consent ? ' chk' : '') + '" id="consentBox">' +
        '<div class="cbox">' + (d.consent ? '<i class="bi bi-check-lg"></i>' : '') + '</div>' +
        '<div><p style="font-weight:700;font-size:0.92rem;margin:0 0 6px;">Acepto ser contactado vía telefónica para agendar la cita con el técnico</p>' +
        '<p style="font-size:0.81rem;color:var(--text-muted);margin:0;">Un técnico le llamará de lunes a viernes de 9:00 a 18:00 para confirmar la fecha y hora de la visita.</p></div>' +
      '</div>' +
      '<div class="wiz-btn-row"><button class="btn-wiz-prev" id="btnPrev">← Anterior</button><button class="btn-wiz-next" id="btnNext">Siguiente →</button></div>';
  }

  function renderS6() {
    var dir = esc(d.calle) + ' ' + esc(d.numero) + ', ' + esc(d.piso) + ' ' + esc(d.puerta);
    return hdr() +
      '<h2 class="wiz-title">Confirmación</h2>' +
      '<p class="wiz-sub">Revise sus datos antes de enviar</p>' +
      '<div class="sum-card">' +
        '<div class="sum-row"><div><div class="sum-lbl">Nombre</div><div class="sum-val">' + esc(d.nombre) + '</div></div>' +
        '<div><div class="sum-lbl">Código Postal</div><div class="sum-val">' + esc(d.cp) + '</div></div></div>' +
        '<div style="margin-bottom:14px;"><div class="sum-lbl">Dirección</div><div class="sum-val">' + dir + '</div></div>' +
        '<div class="sum-row"><div><div class="sum-lbl">Teléfono</div><div class="sum-val">' + esc(d.telefono) + '</div></div>' +
        '<div><div class="sum-lbl">Electrodoméstico</div><div class="sum-val">' + esc(d.enombre) + '</div></div></div>' +
        '<div style="margin-bottom:4px;"><div class="sum-lbl">Avería</div><div class="sum-val">' + esc(d.averia) + '</div></div>' +
        '<div class="sum-consent"><i class="bi bi-check-circle-fill me-1"></i>Acepta ser contactado por teléfono</div>' +
      '</div>' +
      '<div class="wiz-btn-row"><button class="btn-wiz-prev" id="btnPrev">← Anterior</button><button class="btn-wiz-send" id="btnSend">Enviar Solicitud</button></div>' +
      '<div class="wiz-send-err" id="sendErr"><i class="bi bi-exclamation-circle me-2"></i>Hubo un error al enviar. Por favor, inténtalo de nuevo.</div>';
  }

  function showSuccess() {
    var ref = 'REF-' + Math.floor(10000000 + Math.random() * 90000000);
    var dir = esc(d.calle) + ' ' + esc(d.numero) + ', ' + esc(d.piso) + ' ' + esc(d.puerta);
    wc.innerHTML =
      '<div class="wizard-hdr"><b>A solo 6 pasos de enviar tu solicitud</b><small>Llena el formulario y un técnico te contactará</small></div>' +
      '<div class="wizard-body" style="padding:28px;text-align:center;">' +
        '<div class="succ-icon"><i class="bi bi-check-lg"></i></div>' +
        '<h2 style="color:var(--primary);font-family:\'Poppins\',sans-serif;margin-bottom:10px;">¡Solicitud Enviada!</h2>' +
        '<p style="color:var(--text-muted);margin-bottom:16px;">Su solicitud ha sido recibida correctamente. Un técnico le llamará al <strong>' + esc(d.telefono) + '</strong> para agendar la cita.</p>' +
        '<div class="next-box">' +
          '<p style="font-weight:700;margin-bottom:10px;font-family:\'Poppins\',sans-serif;">¿Qué ocurre ahora?</p>' +
          '<ol style="padding-left:20px;margin:0;color:var(--text-muted);font-size:0.88rem;line-height:2.1;">' +
            '<li>Un técnico revisará su solicitud en las próximas horas</li>' +
            '<li>Recibirá una llamada al <strong>' + esc(d.telefono) + '</strong> para agendar la visita</li>' +
            '<li>El técnico acudirá a <strong>' + dir + '</strong></li>' +
          '</ol>' +
        '</div>' +
        '<div class="ref-box">' +
          '<p style="color:var(--text-muted);font-size:0.78rem;margin-bottom:4px;">Número de referencia</p>' +
          '<p style="font-weight:800;font-size:1.1rem;margin:0;">' + ref + '</p>' +
        '</div>' +
        '<a href="index.html" style="display:inline-flex;align-items:center;gap:8px;background:var(--primary);color:#fff;padding:13px 28px;border-radius:50px;font-weight:700;text-decoration:none;font-size:0.92rem;font-family:\'Inter\',sans-serif;">' +
          '<i class="bi bi-house-fill"></i> Volver al Inicio' +
        '</a>' +
      '</div>';
  }

  function collect() {
    if (step === 1) {
      d.nombre = v('f-nombre'); d.calle = v('f-calle'); d.numero = v('f-numero');
      d.piso = v('f-piso'); d.puerta = v('f-puerta'); d.cp = v('f-cp');
    } else if (step === 3) {
      d.averia = v('f-averia');
    } else if (step === 4) {
      d.telefono = v('f-telefono');
    }
  }

  function clearErr() { document.querySelectorAll('.wiz-error').forEach(function (e) { e.remove(); }); }

  function showErr(msg) {
    clearErr();
    var p = document.createElement('p'); p.className = 'wiz-error'; p.textContent = msg;
    var br = document.querySelector('.wiz-btn-row');
    if (br) br.parentNode.insertBefore(p, br);
  }

  function validate() {
    clearErr();
    if (step === 1) {
      if (!v('f-nombre') || !v('f-calle') || !v('f-numero') || !v('f-piso') || !v('f-puerta')) {
        showErr('Por favor, completa todos los campos obligatorios.'); return false;
      }
      if (!/^\d{5}$/.test(v('f-cp'))) { showErr('El código postal debe tener exactamente 5 dígitos.'); return false; }
    }
    if (step === 2 && !d.eid) { showErr('Por favor, selecciona un electrodoméstico.'); return false; }
    if (step === 3 && !v('f-averia')) { showErr('Por favor, selecciona el tipo de avería.'); return false; }
    if (step === 4 && !/^\d{9}$/.test(v('f-telefono'))) { showErr('El teléfono debe tener exactamente 9 dígitos sin espacios.'); return false; }
    if (step === 5 && !d.consent) { showErr('Debes aceptar el consentimiento para continuar.'); return false; }
    return true;
  }

  function bind() {
    document.querySelectorAll('.app-card').forEach(function (c) {
      c.addEventListener('click', function () {
        document.querySelectorAll('.app-card').forEach(function (x) { x.classList.remove('sel'); });
        c.classList.add('sel');
        d.eid = c.dataset.id; d.enombre = c.dataset.name; d.averia = '';
      });
    });
    var cb = document.getElementById('consentBox');
    if (cb) cb.addEventListener('click', function () { d.consent = !d.consent; render(); });
    var bp = document.getElementById('btnPrev');
    if (bp) bp.addEventListener('click', function () { step--; render(); });
    var bn = document.getElementById('btnNext');
    if (bn) bn.addEventListener('click', function () { if (!validate()) return; collect(); step++; render(); });
    var bs = document.getElementById('btnSend');
    if (bs) bs.addEventListener('click', sendForm);
  }

  function sendForm() {
    var btn = document.getElementById('btnSend');
    btn.disabled = true; btn.textContent = 'Enviando...';
    var dir = d.calle + ' ' + d.numero + ', ' + d.piso + ' ' + d.puerta + ', CP ' + d.cp;
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
      marca: MARCA,
      nombre: d.nombre,
      direccion: dir,
      codigo_postal: d.cp,
      telefono: d.telefono,
      electrodomestico: d.enombre,
      averia: d.averia,
      consentimiento: 'Sí, acepta ser contactado por teléfono'
    }).then(function () {
      showSuccess();
    }).catch(function () {
      btn.disabled = false; btn.textContent = 'Enviar Solicitud';
      document.getElementById('sendErr').style.display = 'block';
    });
  }

  render();
})();
