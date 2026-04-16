(function (w, d) {
  ('use strict');
  function init() {
    function throttle(func, limit) {
      let inThrottle;
      return function (...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    }

    async function navigateTo(url) {
      try {
        const res = await fetch(url, { headers: { 'X-Requested-With': 'fetch' } });

        // Stop if request failed (404, 500, etc.)
        if (!res.ok) {
          console.warn(`Navigation failed: ${res.status}`);
          return;
        }

        const html = await res.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const newArticle = doc.querySelector('article');
        const newAside = doc.querySelector('aside');

        // Ensure required content exists before replacing
        if (!newArticle || !newAside) {
          console.warn('Expected layout elements missing');
          return;
        }

        document.title = doc.title || document.title;

        document.querySelector('article').innerHTML = newArticle.innerHTML;
        document.querySelector('aside').innerHTML = newAside.innerHTML;

      } catch (e) {
        console.error('navigateTo failed:', e);
      }
    }

    function sameOrigin(a, b) {
      const urlA = new URL(a);
      const urlB = new URL(b);
      return urlA.origin === urlB.origin;
    }

    // Function to add a "Copy" button to specified elements
    function addCopyButtonsToElements(selector) {
      const elements = document.querySelectorAll(selector);

      elements.forEach((element) => {
        // Create the button
        const button = document.createElement('button');
        button.textContent = 'Copy';
        button.className = 'button copy';

        // Add an event listener to copy the content
        button.addEventListener('click', () => {
          const content = (element.textContent || element.innerText).trim();

          navigator.clipboard
            .writeText(content)
            .then(() => {
              button.textContent = 'Copied!';
              setTimeout(() => (button.textContent = 'Copy'), 2000);
            })
            .catch((err) => {
              console.error('Failed to copy text: ', err);
            });
        });

        // Insert the button before the element
        element.parentNode.insertBefore(button, element);
      });
    }

    // Add "Copy" buttons to <pre> tags
    addCopyButtonsToElements('.code');

    const menuHandler = {
      menuElement: d.getElementById('menu'),

      toggleMenu() {
        this.menuElement.classList.toggle('act');
      },

      close() {
        this.menuElement.classList.remove('act');
      },

      click(e) {
        if (e.target === this.menuElement && !e.target.classList.contains('act')) {
          e.preventDefault();
          e.stopImmediatePropagation();
          this.toggleMenu();
        } else {
          this.close();
        }
      },

      listenForKeys(e) {
        if (e.isComposing || e.key === 229) return false;

        if (e.key === 'Escape') {
          this.close();
        }

        if (e.key === 'Tab' && !this.menuElement.classList.contains('act')) {
          this.toggleMenu();
          this.menuElement.nextElementSibling.focus();
        }
      },
    };
    const themeSwitch = d.querySelector('#theme');
    const isThemeSwitched = JSON.parse(w.localStorage.getItem('switchedTheme')) || false;
    themeSwitch.checked = isThemeSwitched;

    themeSwitch.addEventListener('focus', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    });

    const themeHandler = (e) => {
      w.localStorage.setItem('switchedTheme', JSON.stringify(e.currentTarget.checked));

      e.preventDefault();
      return;
    };

    const handleRootClick = (e) => {
      const target = e.target;
      if (target.classList.contains('toggle')) {
        e.preventDefault();
        target.classList.remove('animation');
        setTimeout(() => target.classList.add('animation'), 99);
      } else if (target.classList.contains('state')) {
        target.classList.toggle('animation');
      }
      if (e.target.tagName === 'A' && e.target.getAttribute('href')?.charAt(0) !== '#') {
        if (sameOrigin(e.target.href, window.location) && e.target.getAttribute("target") !== "_blank") {
          e.preventDefault();
          history.pushState(e.target.href, '', e.target.href);
          navigateTo(e.target.href);
        }
      }
    };

    w.addEventListener('keyup', menuHandler.listenForKeys.bind(menuHandler));
    d.addEventListener('click', throttle(menuHandler.click.bind(menuHandler), 300));
    d.addEventListener('click', handleRootClick);
    w.addEventListener('popstate', (e) => navigateTo(e.state));
    themeSwitch.addEventListener('change', themeHandler);
    setTimeout(function () {
      // Hide the loader
      d.getElementById('loader').classList.add('hidden');
    }, 250);
  }

  d.addEventListener('DOMContentLoaded', init);
})(window, document);
