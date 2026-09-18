/**
 * admin_cms.js
 * Logic for managing Landing Page CMS content from the admin portal.
 */

document.addEventListener('DOMContentLoaded', () => {
    loadCMSData();

    document.getElementById('cms-section-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('section-title').value;
        const order = document.getElementById('section-order').value;
        const msg = document.getElementById('cms-section-msg');

        try {
            const res = await fetch('/api/admin/landing-content/section', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, order: parseInt(order) || 0 })
            });
            const data = await res.json();
            if (res.ok) {
                msg.textContent = 'Section added successfully!';
                msg.className = 'status-msg success';
                document.getElementById('cms-section-form').reset();
                loadCMSData(); // Refresh tables
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            msg.textContent = err.message;
            msg.className = 'status-msg error';
        }
    });

    document.getElementById('cms-item-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('item-title').value;
        const link = document.getElementById('item-link').value;
        const order = document.getElementById('item-order').value;
        const section_id = document.getElementById('item-section').value;
        const msg = document.getElementById('cms-item-msg');

        try {
            const res = await fetch('/api/admin/landing-content/item', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, link, section_id: parseInt(section_id), order: parseInt(order) || 0 })
            });
            const data = await res.json();
            if (res.ok) {
                msg.textContent = 'Item added successfully!';
                msg.className = 'status-msg success';
                document.getElementById('cms-item-form').reset();
                loadCMSData(); // Refresh tables
            } else {
                throw new Error(data.error);
            }
        } catch (err) {
            msg.textContent = err.message;
            msg.className = 'status-msg error';
        }
    });
});

async function loadCMSData() {
    try {
        const res = await fetch(window.API_BASE + '/api/public/landing-content');
        if (!res.ok) throw new Error("Failed to fetch CMS content");
        
        const sections = await res.json();
        
        // 1. Populate Section Table
        const secList = document.getElementById('cms-section-list');
        secList.innerHTML = '';
        sections.forEach(sec => {
            secList.innerHTML += `
                <tr>
                    <td>${sec.id}</td>
                    <td>${sec.title}</td>
                    <td>${sec.order}</td>
                    <td><button onclick="deleteSection(${sec.id})" style="padding:5px; background:#ef4444; color:white; border:none; cursor:pointer; border-radius:4px;">Delete</button></td>
                </tr>
            `;
        });

        // 2. Populate Section Dropdown for Items Form
        const secDropdown = document.getElementById('item-section');
        secDropdown.innerHTML = '<option value="">Select Section...</option>';
        sections.forEach(sec => {
            secDropdown.innerHTML += `<option value="${sec.id}">${sec.title}</option>`;
        });

        // 3. Populate Items Table
        const itemList = document.getElementById('cms-item-list');
        itemList.innerHTML = '';
        sections.forEach(sec => {
            if(sec.items) {
                sec.items.forEach(item => {
                    itemList.innerHTML += `
                        <tr>
                            <td>${item.title}</td>
                            <td>${item.link}</td>
                            <td>${sec.title}</td>
                            <td><button onclick="deleteItem(${item.id})" style="padding:5px; background:#ef4444; color:white; border:none; cursor:pointer; border-radius:4px;">Delete</button></td>
                        </tr>
                    `;
                });
            }
        });

    } catch (err) {
        console.error("Error loading CMS data:", err);
    }
}

async function deleteSection(id) {
    if (!confirm("Are you sure? This will delete all items inside this section too!")) return;
    try {
        const res = await fetch(`/api/admin/landing-content/section/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadCMSData();
        } else {
            alert("Failed to delete section.");
        }
    } catch(e) {
        console.error(e);
    }
}

async function deleteItem(id) {
    if (!confirm("Delete this item?")) return;
    try {
        const res = await fetch(`/api/admin/landing-content/item/${id}`, { method: 'DELETE' });
        if (res.ok) {
            loadCMSData();
        } else {
            alert("Failed to delete item.");
        }
    } catch(e) {
        console.error(e);
    }
}
