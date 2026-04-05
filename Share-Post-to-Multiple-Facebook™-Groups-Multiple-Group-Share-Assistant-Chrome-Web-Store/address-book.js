function initializeAddressBook(showView) {
    console.log('Initializing address book...');
    
    const templateList = document.getElementById('template-list');
    const editForm = document.getElementById('edit-form');
    const editNameInput = document.getElementById('edit-name');
    const editDataTextarea = document.getElementById('edit-data');
    const saveEditButton = document.getElementById('save-edit');
    const cancelEditButton = document.getElementById('cancel-edit');
    const addNewButton = document.getElementById('add-new');
    const backButton = document.getElementById('back-button');

    console.log('Elements found:', {
        templateList: !!templateList,
        editForm: !!editForm,
        addNewButton: !!addNewButton,
        backButton: !!backButton
    });

    if (!addNewButton) {
        console.error('Add new button not found!');
        return;
    }

    let editingKey = null;

    const loadTemplates = () => {
        chrome.storage.local.get('postTemplates', (result) => {
            const postTemplates = result.postTemplates || {};
            const templateKeys = Object.keys(postTemplates);
            
            if (templateKeys.length === 0) {
                templateList.innerHTML = '<div class="empty-state"><div class="empty-icon">📝</div><p class="empty-text">No templates saved yet</p><p class="empty-hint">Click "Add New Template" below to create your first template</p></div>';
                return;
            }
            
            templateList.innerHTML = '';
            for (const key in postTemplates) {
                const entry = document.createElement('div');
                entry.className = 'template-entry';
                
                const preview = postTemplates[key].substring(0, 60) + (postTemplates[key].length > 60 ? '...' : '');
                
                entry.innerHTML = `
                    <div class="template-content">
                        <div class="template-name">${key}</div>
                        <div class="template-preview">${preview}</div>
                    </div>
                    <div class="template-actions">
                        <button class="use-btn" data-key="${key}" title="Use this template">
                            <span class="btn-icon">✓</span>
                        </button>
                        <button class="edit-btn" data-key="${key}" title="Edit template">
                            <span class="btn-icon">✏️</span>
                        </button>
                        <button class="delete-btn" data-key="${key}" title="Delete template">
                            <span class="btn-icon">🗑️</span>
                        </button>
                    </div>
                `;
                templateList.appendChild(entry);
            }
        });
    };

    const showEditForm = (name = '', data = '') => {
        editNameInput.value = name;
        editDataTextarea.value = data;
        editForm.classList.remove('hidden');
        addNewButton.classList.add('hidden');
        templateList.classList.add('hidden');
    };

    const hideEditForm = () => {
        editForm.classList.add('hidden');
        addNewButton.classList.remove('hidden');
        templateList.classList.remove('hidden');
        editingKey = null;
    };

    addNewButton.addEventListener('click', () => {
        editingKey = null;
        showEditForm();
    });

    templateList.addEventListener('click', (e) => {
        // Check if clicking on template name
        const templateName = e.target.closest('.template-name');
        if (templateName) {
            const templateEntry = templateName.closest('.template-entry');
            const key = templateEntry.querySelector('[data-key]').dataset.key;
            
            chrome.storage.local.get('postTemplates', (result) => {
                const postTemplates = result.postTemplates || {};
                const postContentArea = document.getElementById('post-content');
                if (postContentArea && postTemplates[key]) {
                    postContentArea.value = postTemplates[key];
                    // Clear any AI variations since we're using a template
                    document.dispatchEvent(new CustomEvent('templateUsed', { 
                        detail: { content: postTemplates[key] } 
                    }));
                }
                if (showView) {
                    showView('main');
                }
            });
            return;
        }
        
        const button = e.target.closest('button');
        if (!button) return;
        
        const key = button.dataset.key;
        
        if (button.classList.contains('use-btn')) {
            chrome.storage.local.get('postTemplates', (result) => {
                const postTemplates = result.postTemplates || {};
                const postContentArea = document.getElementById('post-content');
                if (postContentArea && postTemplates[key]) {
                    postContentArea.value = postTemplates[key];
                    // Clear any AI variations since we're using a template
                    document.dispatchEvent(new CustomEvent('templateUsed', { 
                        detail: { content: postTemplates[key] } 
                    }));
                }
                if (showView) {
                    showView('main');
                }
            });
        } else if (button.classList.contains('edit-btn')) {
            chrome.storage.local.get('postTemplates', (result) => {
                const postTemplates = result.postTemplates || {};
                editingKey = key;
                showEditForm(key, postTemplates[key]);
            });
        } else if (button.classList.contains('delete-btn')) {
            if (confirm(`Are you sure you want to delete "${key}"?`)) {
                chrome.storage.local.get('postTemplates', (result) => {
                    const postTemplates = result.postTemplates || {};
                    delete postTemplates[key];
                    chrome.storage.local.set({ postTemplates }, loadTemplates);
                });
            }
        }
    });

    saveEditButton.addEventListener('click', () => {
        const name = editNameInput.value.trim();
        const data = editDataTextarea.value.trim();
        if (!name || !data) {
            alert('Template name and content cannot be empty.');
            return;
        }

        chrome.storage.local.get('postTemplates', (result) => {
            const postTemplates = result.postTemplates || {};
            if (editingKey && editingKey !== name) {
                delete postTemplates[editingKey];
            }
            postTemplates[name] = data;
            chrome.storage.local.set({ postTemplates }, () => {
                hideEditForm();
                loadTemplates();
            });
        });
    });

    cancelEditButton.addEventListener('click', hideEditForm);

    if (backButton) {
        backButton.addEventListener('click', () => {
            if (showView) {
                showView('main');
            }
        });
    }

    loadTemplates();
    
    // Expose function to add new template with pre-filled content
    window.addNewTemplateWithContent = (content) => {
        editingKey = null;
        showEditForm('', content);
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = initializeAddressBook;
}
