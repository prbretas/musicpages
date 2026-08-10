/**
 * SongsterrEmbed IIFE
 * Renders an iframe directly loading https://www.songsterr.com/
 * No URL input needed — the user navigates within the Songsterr iframe.
 */
var SongsterrEmbed = (function () {
	'use strict';

	var SONGSTERR_URL = 'https://www.songsterr.com/';

	/**
	 * Initializes the Songsterr embed: creates an iframe pointing to songsterr.com.
	 * @param {string} containerId - The ID of the container element
	 */
	function init(containerId) {
		var container = document.getElementById(containerId);
		if (!container) return;

		// Iframe container div
		var iframeWrapper = document.createElement('div');
		iframeWrapper.className = 'songsterr-iframe-container';

		// Create iframe directly pointing to Songsterr
		var iframe = document.createElement('iframe');
		iframe.src = SONGSTERR_URL;
		iframe.style.width = '100%';
		iframe.style.minHeight = '600px';
		iframe.style.border = 'none';
		iframe.setAttribute('allowfullscreen', '');
		iframe.setAttribute('title', 'Songsterr - Tablaturas');
		iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups allow-forms');

		iframeWrapper.appendChild(iframe);
		container.appendChild(iframeWrapper);
	}

	// Auto-init on DOMContentLoaded
	document.addEventListener('DOMContentLoaded', function () {
		init('songsterrContainer');
	});

	return {
		init: init,
		SONGSTERR_URL: SONGSTERR_URL
	};
})();
