/**
 * script-scale-hero.js
 * ScaleHero — Hero section dinâmica que exibe informações sobre a escala/tonalidade ativa.
 *
 * Ouve o evento `scale-changed` e atualiza o bloco #scaleHeroSection com:
 *   - Tônica em destaque (letra grande) + nome da escala
 *   - Sonoridade, sentimentos, uso comum
 *   - Exemplos de músicas famosas nessa tonalidade/escala
 *
 * L-001 — sem build step, padrão IIFE Vanilla JS.
 */

/* global window, document */

var ScaleHero = (function () {
  'use strict';

  // ------------------------------------------------------------------
  // Base de dados: descrições e exemplos por tipo de escala
  // (tônica é substituída dinamicamente nos textos com {T})
  // ------------------------------------------------------------------

  var SCALE_DATA = {
    maior: {
      label: 'Maior',
      sonoridade: 'Brilhante, aberta, estável e purificada.',
      sentimentos: 'Alegria, <strong>otimismo</strong>, <strong>triunfo</strong>, paz, clareza e inocência.',
      uso: 'Hinos nacionais, músicas infantis, canções pop celebrativas e momentos de resolução heroica no cinema.',
      exemplos: {
        'C':  ['"Imagine" – John Lennon', '"Let It Be" – The Beatles', '"Clocks" – Coldplay'],
        'G':  ['"Sweet Home Alabama" – Lynyrd Skynyrd', '"Good Riddance" – Green Day', '"Here Comes the Sun" – The Beatles'],
        'D':  ['"With or Without You" – U2', '"Knockin\' on Heaven\'s Door" – Bob Dylan', '"Brown Eyed Girl" – Van Morrison'],
        'A':  ['"Don\'t Stop Me Now" – Queen', '"Take Me Home, Country Roads" – John Denver', '"Lean on Me" – Bill Withers'],
        'E':  ['"Jump" – Van Halen', '"My Girl" – The Temptations', '"Crazy Little Thing Called Love" – Queen'],
        'B':  ['"Life is a Highway" – Tom Cochrane', '"I Will Always Love You" – Dolly Parton'],
        'F#': ['"Bohemian Rhapsody" (seções) – Queen', '"Hotel California" – Eagles'],
        'C#': ['"Eye of the Tiger" – Survivor', '"Run to the Hills" – Iron Maiden'],
        'F':  ['"Just the Two of Us" – Bill Withers', '"What\'s Going On" – Marvin Gaye'],
        'Bb': ['"Can\'t Help Falling in Love" – Elvis', '"Stand by Me" – Ben E. King'],
        'Eb': ['"Mr. Brightside" – The Killers', '"Smells Like Teen Spirit" (refrão) – Nirvana'],
        'Ab': ['"Don\'t You Want Me" – Human League', '"Africa" – Toto'],
        'default': ['"Varie a tônica para ver exemplos específicos"']
      }
    },
    jonico: {
      label: 'Jônio (I)',
      sonoridade: 'Brilhante e estável — idêntica à Maior.',
      sentimentos: 'Alegria, paz e clareza.',
      uso: 'Base de toda a harmonia tonal ocidental.',
      exemplos: { default: ['"Mesma sonoridade que a escala Maior"'] }
    },
    menor_natural: {
      label: 'Menor Natural',
      sonoridade: 'Sombria, introspectiva e expressiva.',
      sentimentos: '<strong>Tristeza</strong>, melancolia, profundidade emocional e nostalgia.',
      uso: 'Rock, metal, música clássica, trilhas dramáticas e canções de desamor.',
      exemplos: {
        'A':  ['"Stairway to Heaven" – Led Zeppelin', '"House of the Rising Sun" – The Animals', '"Sultans of Swing" – Dire Straits'],
        'E':  ['"Nothing Else Matters" – Metallica', '"Comfortably Numb" – Pink Floyd'],
        'D':  ['"Smoke on the Water" – Deep Purple', '"Another Brick in the Wall" – Pink Floyd'],
        'B':  ['"One" – Metallica', '"Karma Police" – Radiohead'],
        'default': ['"A melancolia desta escala aparece em incontáveis clássicos do rock"']
      }
    },
    eolio: {
      label: 'Eólio (VI)',
      sonoridade: 'Sombria e introspectiva — idêntica à Menor Natural.',
      sentimentos: 'Tristeza, profundidade, melancolia.',
      uso: 'Muito comum em rock e metal clássico.',
      exemplos: { default: ['"Mesma sonoridade que a escala Menor Natural"'] }
    },
    menor_harmonica: {
      label: 'Menor Harmônica',
      sonoridade: 'Exótica, tensa e oriental.',
      sentimentos: 'Mistério, <strong>drama</strong>, tensão, sensação de Oriente Médio e flamenco.',
      uso: 'Músicas flamencas, neoclassical metal, trilhas de filmes de suspense e música clássica barroca.',
      exemplos: { default: ['"Eruption" – Van Halen (trechos)', '"Paganini\'s 24th Caprice" (releituras de metal)'] }
    },
    menor_melodica: {
      label: 'Menor Melódica',
      sonoridade: 'Fluida, sofisticada e híbrida.',
      sentimentos: 'Elegância, suavidade com tensão subjacente, jazz e melancolia refinada.',
      uso: 'Jazz, música clássica do período romântico, composição cinematográfica.',
      exemplos: { default: ['"Misty" – Erroll Garner', '"Autumn Leaves" (progressões jazzísticas)'] }
    },
    dorico: {
      label: 'Dórico (II)',
      sonoridade: 'Menor com um toque levemente luminoso no sexto grau.',
      sentimentos: '<strong>Funk</strong>, groove, mistura de alegria e melancolia — "felizmente triste".',
      uso: 'Jazz fusion, funk, rock dos anos 60-70 e música celta.',
      exemplos: { default: ['"So What" – Miles Davis', '"Oye Como Va" – Santana', '"Eleanor Rigby" – The Beatles'] }
    },
    frigio: {
      label: 'Frígio (III)',
      sonoridade: 'Intensa, sombria, ibérica e flamenca.',
      sentimentos: 'Tensão dramática, <strong>flamenco</strong>, metal extremo, misticismo.',
      uso: 'Flamenco, metal, música árabe, heavy metal e trilhas de terror.',
      exemplos: { default: ['"White Zombie" – Rob Zombie', '"Wherever I May Roam" – Metallica', '"La Grange" – ZZ Top (introdução)'] }
    },
    lidio: {
      label: 'Lídio (IV)',
      sonoridade: 'Etérea, flutuante e onírica — como "maior com magia".',
      sentimentos: 'Euforia, leveza, <strong>maravilha</strong>, sonho e utopia.',
      uso: 'Trilhas de filmes de ficção científica e fantasia (John Williams), jazz contemporâneo.',
      exemplos: { default: ['"Flying" – The Beatles', '"The Simpsons Theme" – Danny Elfman', '"Flying in a Blue Dream" – Joe Satriani'] }
    },
    mixolidio: {
      label: 'Mixolídio (V)',
      sonoridade: 'Maior com sabor bluesy e rock no sétimo abaixado.',
      sentimentos: 'Energia, <strong>groove</strong>, descontração e blues-rock.',
      uso: 'Blues, rock clássico, country, música celta e folk.',
      exemplos: { default: ['"Sweet Home Chicago" – Robert Johnson', '"Norwegian Wood" – The Beatles', '"Old Time Rock and Roll" – Bob Seger'] }
    },
    locrio: {
      label: 'Lócrio (VII)',
      sonoridade: 'Instável, dissonante e inquietante — o modo mais tenso.',
      sentimentos: 'Desconforto, tensão extrema, caos, sensação de suspensão.',
      uso: 'Metal extremo (thrash, death), trilhas de horror, trechos de jazz avançado.',
      exemplos: { default: ['"YYZ" – Rush (trechos)', '"The Reflecting God" – Marilyn Manson'] }
    },
    pentatonica_maior: {
      label: 'Pentatônica Maior',
      sonoridade: 'Simples, aberta e universal.',
      sentimentos: 'Alegria, <strong>folclore</strong>, nostalgia e simplicidade.',
      uso: 'Música folk, country, rock blues, músicas infantis e solos de guitarra.',
      exemplos: { default: ['"My Girl" – The Temptations', '"Take Me to the River" – Talking Heads', '"Wish You Were Here" – Pink Floyd'] }
    },
    pentatonica_menor: {
      label: 'Pentatônica Menor',
      sonoridade: 'Poderosa, direta e expressiva — a base do blues e rock.',
      sentimentos: '<strong>Grit</strong>, emoção crua, blues, determinação e intensidade.',
      uso: 'Blues, rock, metal, funk — a escala mais usada para solos de guitarra do mundo.',
      exemplos: { default: ['"Smoke on the Water" – Deep Purple', '"Johnny B. Goode" – Chuck Berry', '"Purple Haze" – Jimi Hendrix'] }
    },
    blues_maior: {
      label: 'Blues Maior',
      sonoridade: 'Alegre com toque melancólico — pentatônica maior com "nota blue".',
      sentimentos: 'Otimismo temperado com saudade, groove, leveza e espontaneidade.',
      uso: 'Blues, rock and roll, R&B e solos de guitarra expressivos.',
      exemplos: { default: ['"Pride and Joy" – Stevie Ray Vaughan', '"Hound Dog" – Elvis Presley'] }
    },
    blues_menor: {
      label: 'Blues Menor',
      sonoridade: 'Crua, expressiva e visceral.',
      sentimentos: '<strong>Dor</strong>, anseio, tensão blues e catarse emocional.',
      uso: 'Blues, rock clássico, jazz blues, solos de guitarra.',
      exemplos: { default: ['"The Thrill Is Gone" – B.B. King', '"Born Under a Bad Sign" – Albert King', '"Cross Road Blues" – Robert Johnson'] }
    },
    diminuta_tom_e_semitom: {
      label: 'Diminuta (Tom-Semitom)',
      sonoridade: 'Simétrica, dissonante e tensa.',
      sentimentos: 'Suspense, <strong>horror</strong>, mistério e caos controlado.',
      uso: 'Jazz, trilhas de terror, metal e free jazz.',
      exemplos: { default: ['"Caravan" – Duke Ellington (trechos)', 'Solos de jazz fusion avançados'] }
    },
    diminuta_semitom_e_tom: {
      label: 'Diminuta (Semitom-Tom)',
      sonoridade: 'Simétrica com início cromático — mais tensa que a anterior.',
      sentimentos: 'Tensão aguda, drama e dissonância controlada.',
      uso: 'Muito usada sobre acordes dominantes com alterações no jazz.',
      exemplos: { default: ['"Giant Steps" – John Coltrane (trechos)'] }
    },
    tons_inteiros: {
      label: 'Tons Inteiros',
      sonoridade: 'Flutuante, etérea e sem gravidade tonal.',
      sentimentos: 'Devaneio, <strong>impressionismo</strong>, sonho e dissolução do centro tonal.',
      uso: 'Música impressionista (Debussy), jazz contemporâneo, trilhas etéreas.',
      exemplos: { default: ['"Voiles" – Claude Debussy', '"Who Wants to Live Forever" (trechos) – Queen'] }
    },
    cromatica: {
      label: 'Cromática',
      sonoridade: 'Contém todas as 12 notas — sem centro tonal definido.',
      sentimentos: 'Cor total, tensão e liberdade absoluta.',
      uso: 'Passagens de transição, improvisação livre, música serial e dodecafônica.',
      exemplos: { default: ['"Flight of the Bumblebee" – Rimsky-Korsakov', 'Solos cromáticos de jazz'] }
    },
    egipcia: {
      label: 'Egípcia (Suspended)',
      sonoridade: 'Exótica, suspensa e intrigante.',
      sentimentos: 'Mistério oriental, antiguidade e contemplação.',
      uso: 'Música étnica, trilhas de filmes históricos e experimentação.',
      exemplos: { default: ['"Sultans of Swing" (trechos exóticos) – Dire Straits'] }
    },
    hirajoshi: {
      label: 'Hirajoshi (Japonesa)',
      sonoridade: 'Contemplativa, minimalista e japonesa.',
      sentimentos: '<strong>Zen</strong>, paz interior, wabi-sabi e meditação.',
      uso: 'Música japonesa tradicional, trilhas de anime e música New Age.',
      exemplos: { default: ['"Koto" — música tradicional japonesa', 'Trechos de trilhas de anime'] }
    },
    iwato: {
      label: 'Iwato (Japonesa)',
      sonoridade: 'Austera, obscura e mística.',
      sentimentos: 'Solenidade, silêncio e espiritualidade budista.',
      uso: 'Música de teatro Noh, meditação e música experimental japonesa.',
      exemplos: { default: ['"Música do teatro Noh japonês"'] }
    },
    man_gong: {
      label: 'Man Gong',
      sonoridade: 'Melancólica e flutuante — derivada da Hirajoshi.',
      sentimentos: 'Saudade, introspecção e exotismo.',
      uso: 'Música étnica asiática e exploração modal.',
      exemplos: { default: ['"Exploração de escalas exóticas em jazz fusion"'] }
    },
    ritusen: {
      label: 'Ritusen (Celta)',
      sonoridade: 'Leve, folclórica e pastoral.',
      sentimentos: 'Natureza, simplicidade, vida rural e alegria folclórica.',
      uso: 'Música celta, folk escocês/irlandês e músicas infantis.',
      exemplos: { default: ['"Amazing Grace"', '"Danny Boy" (trechos)', '"Scarborough Fair"'] }
    }
  };

  // Nomes de exibição das tônicas
  var TONICA_LABELS = {
    'C': 'C', 'C#': 'C# / Db', 'D': 'D', 'D#': 'D# / Eb',
    'E': 'E', 'F': 'F', 'F#': 'F# / Gb', 'G': 'G',
    'G#': 'G# / Ab', 'A': 'A', 'A#': 'A# / Bb', 'B': 'B'
  };

  // ------------------------------------------------------------------
  // Referência ao container
  // ------------------------------------------------------------------
  var _container = null;

  // ------------------------------------------------------------------
  // Renderização
  // ------------------------------------------------------------------

  function _render(tonica, tipoEscala) {
    if (!_container) return;

    var data = SCALE_DATA[tipoEscala] || SCALE_DATA['maior'];
    var tonicaLabel = TONICA_LABELS[tonica] || tonica;
    var exemplos = (data.exemplos && (data.exemplos[tonica] || data.exemplos['default'])) || [];

    var exemplosHTML = exemplos.map(function (ex) {
      return '<li>' + ex + '</li>';
    }).join('');

    _container.innerHTML =
      '<div class="scale-hero__text">' +
        '<div class="scale-hero__headline">' +
          '<span class="scale-hero__tonica">' + (tonicaLabel.split('/')[0].trim()) + '</span>' +
          '<span class="scale-hero__scale-name">' + data.label + '</span>' +
        '</div>' +
        '<ul class="scale-hero__props">' +
          '<li><strong>Sonoridade:</strong> ' + data.sonoridade + '</li>' +
          '<li><strong>Sentimentos Despertados:</strong> ' + data.sentimentos + '</li>' +
          '<li><strong>Uso Comum:</strong> ' + data.uso + '</li>' +
        '</ul>' +
        '<ul class="scale-hero__examples">' + exemplosHTML + '</ul>' +
      '</div>' +
      '<div class="scale-hero__circle" id="scaleHeroCircle">' +
        '<!-- Círculo de Escalas injetado pelo script-scale-circle.js -->' +
      '</div>';
  }

  // ------------------------------------------------------------------
  // Init
  // ------------------------------------------------------------------

  function init() {
    _container = document.getElementById('scaleHeroSection');
    if (!_container) return;

    // Ouvir scale-changed
    document.addEventListener('scale-changed', function (e) {
      var detail = e && e.detail;
      if (!detail || !detail.tonica || !detail.tipoEscala) return;
      _render(detail.tonica, detail.tipoEscala);
    });

    // Render inicial com valores dos selects
    var tonicaEl = document.getElementById('tonica');
    var tipoEl   = document.getElementById('tipoEscala');
    if (tonicaEl && tipoEl) {
      _render(tonicaEl.value, tipoEl.value);
    }
  }

  // ------------------------------------------------------------------
  // Bootstrap
  // ------------------------------------------------------------------

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  }

  if (typeof window !== 'undefined') window.ScaleHero = { init: init };
  if (typeof module !== 'undefined' && module.exports) module.exports = { init: init };

}());
