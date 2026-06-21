(function () {
  var GITHUB_USER = "imiiii";
  var HIDDEN_REPOS = new Set(["imiiii.github.io"]);
  var FEATURED_ORDER = [
    "mosafer-paya",
    "chrome-extension",
    "DNN99",
    "AniccaMenu",
    "BaseCodeFramework",
    "dotnet-webapi-boilerplate",
    "DynamicTypeForML.Net",
    "TensorFlow-Importer-to-TF-MLIR-dialect",
    "Wiki-For-ML-Project",
    "TestChartJs",
    "Task_AB",
    "my-resume",
    "SimplestMLP",
    "BaseCode",
    "DynamicIDataViewWrapper"
  ];

  var PRIVATE_PROJECTS = [
    {
      name: "anicca",
      language: "TypeScript",
      description:
        "A bilingual soul-healing platform with a modern web experience, content workflows, and full-stack product architecture built for wellness and mindful living.",
      highlights: "Next.js • bilingual UI • product platform"
    },
    {
      name: "iranian-dj-backend",
      language: "Python",
      description:
        "Backend service for a DJ and music platform, handling APIs, data flows, and the server-side logic behind the product experience.",
      highlights: "FastAPI-style backend • APIs • media platform"
    },
    {
      name: "ShippingApp",
      language: "C#",
      description:
        "A Blazor Server application for managing shipments, logistics workflows, and operational tracking in a business environment.",
      highlights: "Blazor Server • .NET • operations dashboard"
    },
    {
      name: "MLNet-public",
      language: "C#",
      description:
        "A machine learning factory on .NET that streamlines model training, evaluation, and deployment using ML.NET.",
      highlights: "ML.NET • model pipelines • .NET"
    },
    {
      name: "MLFactory-Plus-Plus",
      language: "C#",
      description:
        "An upgraded ML factory with Radzen UI for visually building, testing, and managing machine learning workflows.",
      highlights: "Radzen UI • ML workflows • visual tooling"
    },
    {
      name: "MLFactory-Plus-2",
      language: "C#",
      description:
        "An extended ML factory codebase focused on reusable training pipelines, experimentation, and production-ready ML tooling.",
      highlights: "ML automation • C# • experimentation"
    }
  ];

  function languageColor(language) {
    var colors = {
      JavaScript: "#f0db4f",
      TypeScript: "#3178c6",
      Python: "#3572a5",
      C: "#555555",
      "C#": "#178600",
      HTML: "#e34c26",
      CSS: "#563d7c",
      Shell: "#89e051",
      Rust: "#dea584",
      Go: "#00add8"
    };
    return colors[language] || "#1488CC";
  }

  function sortRepos(repos) {
    return repos.slice().sort(function (a, b) {
      var aIndex = FEATURED_ORDER.indexOf(a.name);
      var bIndex = FEATURED_ORDER.indexOf(b.name);
      if (aIndex === -1 && bIndex === -1) {
        return new Date(b.updated_at) - new Date(a.updated_at);
      }
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }

  function createCard(repo, options) {
    var isPrivate = options && options.isPrivate;
    var card = document.createElement("article");
    card.className = "github-repo-card" + (isPrivate ? " github-repo-card-private" : "");

    var title = document.createElement("h3");
    if (isPrivate) {
      title.textContent = repo.name;
    } else {
      var link = document.createElement("a");
      link.href = repo.html_url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = repo.name;
      title.appendChild(link);
    }

    var description = document.createElement("p");
    description.textContent =
      repo.description ||
      (isPrivate
        ? "Private repository — available for demo or discussion on request."
        : "Open-source project from my GitHub — explore the code and README for details.");

    var meta = document.createElement("div");
    meta.className = "github-repo-meta";

    var languageName = repo.language || (repo.primaryLanguage && repo.primaryLanguage.name);
    if (languageName) {
      var language = document.createElement("span");
      language.className = "github-repo-language";
      language.innerHTML =
        '<span class="github-repo-language-dot" style="background:' +
        languageColor(languageName) +
        '"></span>' +
        languageName;
      meta.appendChild(language);
    }

    if (isPrivate) {
      var privateTag = document.createElement("span");
      privateTag.className = "github-repo-tag github-repo-tag-private";
      privateTag.textContent = "Private";
      meta.appendChild(privateTag);
    }

    if (repo.fork) {
      var fork = document.createElement("span");
      fork.className = "github-repo-tag";
      fork.textContent = "Fork";
      meta.appendChild(fork);
    }

    if (repo.highlights) {
      var highlights = document.createElement("span");
      highlights.className = "github-repo-highlights";
      highlights.textContent = repo.highlights;
      meta.appendChild(highlights);
    }

    if (!isPrivate && repo.updated_at) {
      var updated = document.createElement("span");
      updated.className = "github-repo-updated";
      updated.textContent =
        "Updated " +
        new Date(repo.updated_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short"
        });
      meta.appendChild(updated);
    }

    var repoLink = document.createElement("a");
    repoLink.className = "project-link";
    if (isPrivate) {
      repoLink.href =
        "mailto:imanbarzegari95@gmail.com?subject=" +
        encodeURIComponent("Demo request: " + repo.name);
      repoLink.textContent = "Request demo";
    } else {
      repoLink.href = repo.html_url;
      repoLink.target = "_blank";
      repoLink.rel = "noopener noreferrer";
      repoLink.textContent = "View on GitHub";
    }

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(meta);
    card.appendChild(repoLink);
    return card;
  }

  function renderRepos(repos) {
    var container = document.getElementById("github-projects-grid");
    var status = document.getElementById("github-projects-status");
    if (!container) return;

    var visibleRepos = sortRepos(
      repos.filter(function (repo) {
        return !HIDDEN_REPOS.has(repo.name);
      })
    );

    container.innerHTML = "";

    visibleRepos.forEach(function (repo) {
      container.appendChild(createCard(repo));
    });

    if (status) {
      status.textContent =
        visibleRepos.length +
        " public repositories loaded live from github.com/" +
        GITHUB_USER;
    }
  }

  function renderPrivateProjects() {
    var container = document.getElementById("private-projects-grid");
    if (!container) return;

    container.innerHTML = "";
    PRIVATE_PROJECTS.forEach(function (project) {
      container.appendChild(createCard(project, { isPrivate: true }));
    });
  }

  function renderError() {
    var container = document.getElementById("github-projects-grid");
    var status = document.getElementById("github-projects-status");
    if (!container) return;

    container.innerHTML =
      '<p class="github-projects-error">Could not load public repositories right now. Visit <a href="https://github.com/' +
      GITHUB_USER +
      '" target="_blank" rel="noopener noreferrer">github.com/' +
      GITHUB_USER +
      "</a> to browse open-source work.</p>";

    if (status) {
      status.textContent = "Public feed unavailable — private project highlights are shown below.";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderPrivateProjects();

    fetch(
      "https://api.github.com/users/" +
        GITHUB_USER +
        "/repos?per_page=100&sort=updated&type=owner"
    )
      .then(function (response) {
        if (!response.ok) throw new Error("GitHub API request failed");
        return response.json();
      })
      .then(renderRepos)
      .catch(renderError);
  });
})();
