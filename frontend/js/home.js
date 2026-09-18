/**
 * home.js
 * Logic for the University Management System home page
 */

document.addEventListener('DOMContentLoaded', () => {
    loadCMSNavigation();
});

async function loadCMSNavigation() {
    try {
        const [cmsRes, examRes] = await Promise.all([
            fetch(window.API_BASE + '/api/public/landing-content'),
            fetch(window.API_BASE + '/api/public/results')
        ]);
        
        if (!cmsRes.ok || !examRes.ok) throw new Error("Failed to fetch data");
        
        const sections = await cmsRes.json();
        const examHierarchy = await examRes.json();
        
        const navContainer = document.getElementById('dynamic-nav-container');
        if (!navContainer) return;
        
        navContainer.innerHTML = '';
        
        if (sections.length === 0 && Object.keys(examHierarchy).length === 0) {
            navContainer.innerHTML = '<li><a href="#">No Navigation Set</a></li>';
            return;
        }
        
        // 1. Render CMS Sections
        sections.forEach(section => {
            if (section.items && section.items.length > 0) {
                // Render as dropdown
                let html = `
                    <li class="dropdown">
                        <a href="#">${section.title} ▾</a>
                        <ul class="dropdown-content">
                `;
                section.items.forEach(item => {
                    html += `<li><a href="${item.link}">${item.title}</a></li>`;
                });
                html += `
                        </ul>
                    </li>
                `;
                navContainer.innerHTML += html;
            } else {
                // Render as normal link
                navContainer.innerHTML += `<li><a href="#">${section.title}</a></li>`;
            }
        });

        // 2. Render Examination Results hierarchy
        if (Object.keys(examHierarchy).length > 0) {
            let examHtml = `
                <li class="dropdown">
                    <a href="#examination">Examination ▾</a>
                    <ul class="dropdown-content">
            `;
            
            for (const parentLevel in examHierarchy) { // e.g. UG, PG
                examHtml += `
                    <li class="nested-dropdown">
                        <a href="#">${parentLevel} ▸</a>
                        <ul class="nested-dropdown-content">
                `;
                const programs = examHierarchy[parentLevel];
                for (const prog in programs) { // e.g. BSc, BTech
                    examHtml += `
                        <li class="nested-dropdown">
                            <a href="#">${prog} ▸</a>
                            <ul class="nested-dropdown-content">
                    `;
                    programs[prog].forEach(result => {
                        examHtml += `<li><a href="${result.result_link}" target="_blank">${result.title}</a></li>`;
                    });
                    examHtml += `
                            </ul>
                        </li>
                    `;
                }
                examHtml += `
                        </ul>
                    </li>
                `;
            }
            examHtml += `
                    </ul>
                </li>
            `;
            navContainer.innerHTML += examHtml;
        }
        
    } catch (err) {
        console.error("Error loading navigation:", err);
        const navContainer = document.getElementById('dynamic-nav-container');
        if (navContainer) {
            navContainer.innerHTML = '<li><a href="#">Error loading navigation</a></li>';
        }
    }
}
