// ************ Navegação do Header *****************************
/**
 * HeaderNav IIFE
 * Manages the header navigation menu: smooth scrolling to sections,
 * hamburger toggle for mobile, and auto-close after link click.
 */
var HeaderNav = (function () {
    'use strict';

    var nav = null;
    var hamburgerBtn = null;
    var navLinks = null;

    /**
     * Initializes the header navigation by caching DOM references
     * and attaching event listeners.
     */
    function init() {
        nav = document.getElementById('headerNav');
        hamburgerBtn = nav ? nav.querySelector('.hamburger-btn') : null;
        navLinks = document.getElementById('navLinks');

        if (!nav || !hamburgerBtn || !navLinks) {
            return;
        }

        // Attach click listener to hamburger button
        hamburgerBtn.addEventListener('click', toggleMobileMenu);

        // Attach click listeners to each navigation link
        var links = navLinks.querySelectorAll('a[href^="#"]');
        for (var i = 0; i < links.length; i++) {
            links[i].addEventListener('click', handleLinkClick);
        }
    }

    /**
     * Handles a navigation link click: prevents default anchor behavior,
     * scrolls to the target section, and closes the mobile menu.
     * @param {Event} event - The click event
     */
    function handleLinkClick(event) {
        event.preventDefault();
        var href = event.currentTarget.getAttribute('href');
        var sectionId = href ? href.substring(1) : null;

        if (sectionId) {
            scrollToSection(sectionId);
        }

        closeMobileMenu();
    }

    /**
     * Smoothly scrolls the page to the element with the given ID.
     * @param {string} sectionId - The ID of the target section element
     */
    function scrollToSection(sectionId) {
        var element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Toggles the mobile menu open/closed state by adding/removing
     * the `.nav-open` class and updating `aria-expanded`.
     */
    function toggleMobileMenu() {
        if (!nav || !hamburgerBtn) {
            return;
        }

        var isOpen = nav.classList.toggle('nav-open');
        hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    }

    /**
     * Closes the mobile menu by removing the `.nav-open` class
     * and setting `aria-expanded` to false.
     */
    function closeMobileMenu() {
        if (!nav || !hamburgerBtn) {
            return;
        }

        nav.classList.remove('nav-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        init: init,
        scrollToSection: scrollToSection,
        toggleMobileMenu: toggleMobileMenu,
        closeMobileMenu: closeMobileMenu
    };
})();
