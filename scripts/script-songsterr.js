/**
 * SongsterrEmbed IIFE
 * Renders a link button to open Songsterr in a new tab.
 * Songsterr blocks iframe embedding (X-Frame-Options), so we provide
 * a styled button that opens the site directly.
 */
var SongsterrEmbed = (function () {
	'use strict';

	var SONGSTERR_URL = 'https://www.songsterr.com/';

	/**
	 * Initializes the Songsterr container with a styled link.
	 * @param {string} containerId - The ID of the container element
	 */
	function init(containerId) {
		var container = document.getElementById(containerId);
		if (!container) return;

		var wrapper = document.createElement('div');
		wrapper.className = 'songsterr-link-container';

		var desc = document.createElement('p');
		desc.className = 'songsterr-description';
		desc.textContent = 'Acesse o Songsterr para buscar tablaturas e partituras interativas de milhares de músicas.';
		wrapper.appendChild(desc);

		var link = document.createElement('a');
		link.href = SONGSTERR_URL;
		link.target = '_blank';
		link.rel = 'noopener noreferrer';
		link.className = 'songsterr-open-btn';
		link.textContent = '🎸 Abrir Songsterr';
		wrapper.appendChild(link);

		container.appendChild(wrapper);
	}

	// Auto-init on DOMContentLoaded
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', function () {
			init('songsterrContainer');
		});
	} else {
		init('songsterrContainer');
	}

	return {
		init: init,
		SONGSTERR_URL: SONGSTERR_URL
	};
})();
