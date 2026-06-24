/**
 * Triggers modal view overlay populated with textual details.
 */
function showProject(title, description) {
    const modal = document.getElementById("project-modal");
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-description").innerText = description;
    modal.style.display = "flex";
}

/**
 * Closes view overlay windows.
 */
function closeModal() {
    const modal = document.getElementById("project-modal");
    modal.style.display = "none";
}

// Global click event to close popup modal when clicking outside its bounds
window.addEventListener("click", function(event) {
    const modal = document.getElementById("project-modal");
    if (event.target === modal) {
        closeModal();
    }
});

// Array Matrix managing your project data layer
const curatedProjects = [
    {
        id: "curated-1",
        title: "Personal Developer Hub",
        overview: "A live-deployed, fully responsive portfolio page integrated with asynchronous third-party widget platforms.",
        tech: ["HTML/CSS", "JavaScript ES6", "Fetch API"],
        details: "W1 Project: Designed and deployed a live portfolio baseline structure, upgraded with asynchronous dynamic DOM assembly components on Day 2.",
        demoLink: "#",
        githubLink: "#"
    },
    
];

// Master storage layer merging curated array with dynamic github payload arrays
let allProjects = [...curatedProjects];

/**
 * Builds project cards using DOM manipulation elements and injects them safely.
 */
function renderProjects() {
    const container = document.getElementById("projects-grid");
    if (!container) return;
    
    container.innerHTML = "";

    allProjects.forEach(project => {
        const card = document.createElement("div");
        card.className = "card project-card";

        const techBadges = project.tech && project.tech.length > 0 
            ? project.tech.map(t => `<span>${t}</span>`).join("")
            : `<span>Repository</span>`;

        card.innerHTML = `
            <h3>${project.title}</h3>
            <p class="overview">${project.overview || "Public project code repository."}</p>
            <div class="tech-stack">
                ${techBadges}
            </div>
            <div class="card-actions">
                <button class="btn info-btn" data-id="${project.id}">View Details</button>
                <div class="links">
                    <a href="${project.demoLink || '#'}" target="_blank" ${project.demoLink ? '' : 'style="display:none;"'}>Live Demo</a>
                    <a href="${project.githubLink || '#'}" target="_blank">GitHub</a>
                </div>
            </div>
        `;

        container.appendChild(card);
    });

    // Handle modal bindings cleanly via addEventListener rather than relying on inline onclick strings
    document.querySelectorAll(".info-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetId = btn.dataset.id;
            const project = allProjects.find(p => String(p.id) === String(targetId));
            if (project) {
                showProject(project.title, project.details || project.overview);
            }
        });
    });
}

/**
 * Fetches profile metadata from GitHub and handles loading/error states
 */
async function loadGithubStats(username) {
    const card = document.getElementById("github-card");
    if (!card) return;
    
    card.innerHTML = "<p>Loading GitHub stats...</p>";

    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (!response.ok) throw new Error("GitHub user metadata not found");

        const data = await response.json();

        card.innerHTML = `
            <img src="${data.avatar_url}" alt="${data.login}" class="github-avatar" />
            <h3>${data.name || data.login}</h3>
            <p>${data.bio || "Full Stack Developer "}</p>
            <div class="github-stats-grid">
                <div><strong>${data.public_repos}</strong><span>Repos</span></div>
                <div><strong>${data.followers}</strong><span>Followers</span></div>
                <div><strong>${data.following}</strong><span>Following</span></div>
            </div>
        `;
    } catch (error) {
        card.innerHTML = `<p class="error-text">Couldn't load GitHub stats. Try again later.</p>`;
        console.error(error);
    }
}

/**
 * Fetches real operational public repositories directly from GitHub API and updates the DOM
 */
async function fetchRealGithubRepos(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
        if (!response.ok) throw new Error("Failed to stream repositories");
        
        const repos = await response.json();
        
        const fetchedRepos = repos
            .filter(repo => !repo.fork)
            .map(repo => ({
                id: repo.id,
                title: repo.name.replace(/-/g, ' ').replace(/_/g, ' '),
                overview: repo.description || "Public source code repository hosted on GitHub.",
                tech: repo.language ? [repo.language] : [],
                details: `Created on ${new Date(repo.created_at).toLocaleDateString()}. Last update pushed on ${new Date(repo.updated_at).toLocaleDateString()}. Open issues: ${repo.open_issues_count}.`,
                demoLink: repo.homepage || null,
                githubLink: repo.html_url
            }));
            
        allProjects = [...curatedProjects, ...fetchedRepos];
        renderProjects();
    } catch (error) {
        console.error("Error updating dynamic projects layout grid:", error);
    }
}

function showProject(title, description) {
    const modal = document.getElementById("project-modal");
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-description").innerText = description;
    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("project-modal").style.display = "none";
}

window.addEventListener("click", (e) => {
    if (e.target === document.getElementById("project-modal")) closeModal();
});

document.addEventListener("DOMContentLoaded", async () => {
    const targetUser = "amishbuilds";
    
    renderProjects();

    await loadGithubStats(targetUser);
    await fetchRealGithubRepos(targetUser);
});
