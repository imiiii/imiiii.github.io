(function () {
  "use strict";

  var STORAGE_KEY = "freelance-lang";
  var LOCALE_BASE = "./assets/i18n/freelance/";
  var manifest = null;
  var localeCache = {};
  var currentLang = "en";

  function getStoredLang() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* ignore */
    }
  }

  function getLangMeta(code) {
    if (!manifest || !manifest.languages) {
      return { code: "en", label: "English", dir: "ltr" };
    }
    for (var i = 0; i < manifest.languages.length; i++) {
      if (manifest.languages[i].code === code) {
        return manifest.languages[i];
      }
    }
    return { code: "en", label: "English", dir: "ltr" };
  }

  function resolveLangFromCountry(country) {
    if (!manifest) {
      return "en";
    }
    var lang = (manifest.countryToLang && manifest.countryToLang[country]) || manifest.defaultLang || "en";
    if (manifest.fallbackLang && manifest.fallbackLang[lang]) {
      lang = manifest.fallbackLang[lang];
    }
    if (!hasLangFile(lang)) {
      return manifest.defaultLang || "en";
    }
    return lang;
  }

  function hasLangFile(code) {
    if (!manifest || !manifest.languages) {
      return code === "en";
    }
    for (var i = 0; i < manifest.languages.length; i++) {
      if (manifest.languages[i].code === code) {
        return true;
      }
    }
    return false;
  }

  function fetchJson(url) {
    return fetch(url, { cache: "no-store" }).then(function (res) {
      if (!res.ok) {
        throw new Error("Failed to load " + url);
      }
      return res.json();
    });
  }

  function loadLocale(code) {
    if (localeCache[code]) {
      return Promise.resolve(localeCache[code]);
    }
    return fetchJson(LOCALE_BASE + encodeURIComponent(code) + ".json").then(function (data) {
      localeCache[code] = data;
      return data;
    });
  }

  function populateLanguageSelect(selected) {
    var select = document.getElementById("lang-select");
    if (!select || !manifest) {
      return;
    }
    select.innerHTML = "";
    manifest.languages.forEach(function (lang) {
      var option = document.createElement("option");
      option.value = lang.code;
      option.textContent = lang.label;
      select.appendChild(option);
    });
    select.value = selected;
  }

  function applyLocale(code, strings) {
    var meta = getLangMeta(code);
    currentLang = meta.code;

    document.documentElement.lang = meta.code;
    document.documentElement.dir = meta.dir || "ltr";
    document.body.classList.toggle("freelance-rtl", meta.dir === "rtl");

    document.title = strings.pageTitle;
    var description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute("content", strings.metaDescription);
    }

    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      var key = node.getAttribute("data-i18n");
      if (strings[key] !== undefined) {
        node.textContent = strings[key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (node) {
      var key = node.getAttribute("data-i18n-placeholder");
      if (strings[key] !== undefined) {
        node.setAttribute("placeholder", strings[key]);
      }
    });

    var select = document.getElementById("lang-select");
    if (select) {
      select.value = meta.code;
      if (strings.langLabel) {
        select.setAttribute("aria-label", strings.langLabel);
      }
    }

    document.dispatchEvent(
      new CustomEvent("freelance:lang", { detail: { lang: meta.code } })
    );
  }

  function switchLang(code) {
    var safe = hasLangFile(code) ? code : manifest.defaultLang || "en";
    return loadLocale(safe)
      .catch(function () {
        return loadLocale(manifest.defaultLang || "en");
      })
      .then(function (strings) {
        applyLocale(safe, strings);
        setStoredLang(safe);
      });
  }

  function detectLangFromIp() {
    return fetch("https://ipapi.co/json/", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("geo lookup failed");
        }
        return res.json();
      })
      .then(function (data) {
        return resolveLangFromCountry((data && data.country_code) || "");
      })
      .catch(function () {
        return fetch("https://ipwho.is/", { cache: "no-store" })
          .then(function (res) {
            return res.json();
          })
          .then(function (data) {
            return resolveLangFromCountry((data && data.country_code) || "");
          })
          .catch(function () {
            return manifest.defaultLang || "en";
          });
      });
  }

  function init() {
    fetchJson(LOCALE_BASE + "manifest.json")
      .then(function (data) {
        manifest = data;
        var stored = getStoredLang();
        var initial = hasLangFile(stored) ? stored : manifest.defaultLang || "en";
        populateLanguageSelect(initial);

        return loadLocale(initial).then(function (strings) {
          applyLocale(initial, strings);

          if (!stored) {
            return detectLangFromIp().then(function (detected) {
              if (!getStoredLang() && detected !== initial) {
                return switchLang(detected);
              }
            });
          }
        });
      })
      .catch(function () {
        return loadLocale("en").then(function (strings) {
          applyLocale("en", strings);
        });
      })
      .then(function () {
        var select = document.getElementById("lang-select");
        if (select) {
          select.addEventListener("change", function () {
            switchLang(select.value);
          });
        }
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
