const API_BASE_URL = 'http://localhost:3000/api/contacts';

const contactForm = document.getElementById('contact-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const contactIdInput = document.getElementById('contact-id');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const contactsTable = document.getElementById('contacts-table');
const contactsTbody = document.getElementById('contacts-tbody');
const loadingDiv = document.getElementById('loading');
const noContactsDiv = document.getElementById('no-contacts');
const messageDiv = document.getElementById('message');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');

const nameError = document.getElementById('name-error');
const emailError = document.getElementById('email-error');
const phoneError = document.getElementById('phone-error');

let editingContactId = null;
let contacts = [];


document.addEventListener('DOMContentLoaded', () => {
    loadContacts();
    setupEventListeners();
});


function setupEventListeners() {
    contactForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', resetForm);
    

    nameInput.addEventListener('blur', () => validateField('name', nameInput.value));
    emailInput.addEventListener('blur', () => validateField('email', emailInput.value));
    phoneInput.addEventListener('blur', () => validateField('phone', phoneInput.value));

    if (searchInput) {
        searchInput.addEventListener('input', () => applyFiltersAndRender());
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', () => applyFiltersAndRender());
    }
}


function validateField(fieldName, value) {
    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
        case 'name':
            if (!value || value.trim() === '') {
                isValid = false;
                errorMessage = 'Name is required';
            }
            break;
        case 'email':
            if (!value || value.trim() === '') {
                isValid = false;
                errorMessage = 'Email is required';
            } else if (!isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Email format is not valid';
            }
            break;
        case 'phone':
            if (!value || value.trim() === '') {
                isValid = false;
                errorMessage = 'Phone is required';
            } else {
                const digitsOnly = value.replace(/\D/g, '');
                if (digitsOnly.length < 10 || digitsOnly.length > 15) {
                    isValid = false;
                    errorMessage = 'Phone must be 10 to 15 digits';
                }
            }
            break;
    }

    
    const inputElement = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (isValid) {
        inputElement.classList.remove('error');
        errorElement.textContent = '';
    } else {
        inputElement.classList.add('error');
        errorElement.textContent = errorMessage;
    }

    return isValid;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateForm() {
    const nameValid = validateField('name', nameInput.value);
    const emailValid = validateField('email', emailInput.value);
    const phoneValid = validateField('phone', phoneInput.value);
    
    return nameValid && emailValid && phoneValid;
}


async function handleFormSubmit(e) {
    e.preventDefault();
    

    clearErrors();
    
    
    if (!validateForm()) {
        showMessage('Please fix the errors in the form', 'error');
        return;
    }

    const contactData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim()
    };

    try {
        if (editingContactId) {
            await updateContact(editingContactId, contactData);
        } else {
            await createContact(contactData);
        }
        resetForm();
        loadContacts();
    } catch (error) {
        console.error('Form submission error:', error);
    }
}

function resetForm() {
    contactForm.reset();
    contactIdInput.value = '';
    editingContactId = null;
    formTitle.textContent = 'Add New Contact';
    submitBtn.textContent = 'Add Contact';
    cancelBtn.classList.add('hidden');
    clearErrors();
}

function clearErrors() {
    nameInput.classList.remove('error');
    emailInput.classList.remove('error');
    phoneInput.classList.remove('error');
    nameError.textContent = '';
    emailError.textContent = '';
    phoneError.textContent = '';
}


async function loadContacts() {
    try {
        loadingDiv.classList.remove('hidden');
        contactsTable.classList.add('hidden');
        noContactsDiv.classList.add('hidden');

        const response = await fetch(API_BASE_URL);
        
        if (!response.ok) {
            throw new Error('Failed to load contacts');
        }

        const data = await response.json();
        contacts = Array.isArray(data) ? data : [];
        
        loadingDiv.classList.add('hidden');

        applyFiltersAndRender();
    } catch (error) {
        loadingDiv.classList.add('hidden');
        showMessage('Failed to load contacts. Please try again.', 'error');
        console.error('Error loading contacts:', error);
    }
}

async function createContact(contactData) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });

        const data = await response.json();

        if (!response.ok) {
            
            if (data.errors && Array.isArray(data.errors)) {
                data.errors.forEach(error => {
                    if (error.includes('Name')) {
                        nameInput.classList.add('error');
                        nameError.textContent = error;
                    } else if (error.includes('Email')) {
                        emailInput.classList.add('error');
                        emailError.textContent = error;
                    } else if (error.includes('Phone')) {
                        phoneInput.classList.add('error');
                        phoneError.textContent = error;
                    }
                });
                showMessage('Please fix the validation errors', 'error');
            } else {
                showMessage(data.error || 'Failed to create contact', 'error');
            }
            throw new Error(data.error || 'Failed to create contact');
        }

        showMessage('Contact created successfully!', 'success');
        return data;
    } catch (error) {
        if (error.message.includes('Email already exists')) {
            emailInput.classList.add('error');
            emailError.textContent = 'Email already exists';
        }
        throw error;
    }
}

async function updateContact(id, contactData) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });

        const data = await response.json();

        if (!response.ok) {
            
            if (data.errors && Array.isArray(data.errors)) {
                data.errors.forEach(error => {
                    if (error.includes('Name')) {
                        nameInput.classList.add('error');
                        nameError.textContent = error;
                    } else if (error.includes('Email')) {
                        emailInput.classList.add('error');
                        emailError.textContent = error;
                    } else if (error.includes('Phone')) {
                        phoneInput.classList.add('error');
                        phoneError.textContent = error;
                    }
                });
                showMessage('Please fix the validation errors', 'error');
            } else {
                showMessage(data.error || 'Failed to update contact', 'error');
            }
            throw new Error(data.error || 'Failed to update contact');
        }

        showMessage('Contact updated successfully!', 'success');
        return data;
    } catch (error) {
        if (error.message.includes('Email already exists')) {
            emailInput.classList.add('error');
            emailError.textContent = 'Email already exists';
        }
        throw error;
    }
}

async function deleteContact(id) {
    if (!confirm('Are you sure you want to delete this contact?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to delete contact');
        }

        showMessage('Contact deleted successfully!', 'success');
        loadContacts();
    } catch (error) {
        showMessage(error.message || 'Failed to delete contact', 'error');
        console.error('Error deleting contact:', error);
    }
}

function editContact(id) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) return;

    const cells = row.querySelectorAll('td');
    const name = cells[0].textContent.trim();
    const email = cells[1].textContent.trim();
    const phone = cells[2].textContent.trim();

    
    nameInput.value = name;
    emailInput.value = email;
    phoneInput.value = phone;
    contactIdInput.value = id;
    editingContactId = id;

    
    formTitle.textContent = 'Edit Contact';
    submitBtn.textContent = 'Update Contact';
    cancelBtn.classList.remove('hidden');

    
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
    
    
    clearErrors();
}


function displayContacts(contacts) {
    contactsTbody.innerHTML = '';
    
    contacts.forEach(contact => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', contact.id);
        
        const createdDate = new Date(contact.created_at).toLocaleDateString();
        
        row.innerHTML = `
            <td>${escapeHtml(contact.name)}</td>
            <td>${escapeHtml(contact.email)}</td>
            <td>${escapeHtml(contact.phone || 'N/A')}</td>
            <td>${createdDate}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editContact(${contact.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteContact(${contact.id})">Delete</button>
                </div>
            </td>
        `;
        
        contactsTbody.appendChild(row);
    });

    if (contacts.length === 0) {
        noContactsDiv.classList.remove('hidden');
        contactsTable.classList.add('hidden');
    } else {
        noContactsDiv.classList.add('hidden');
        contactsTable.classList.remove('hidden');
    }
}

function getFilteredContacts() {
    const term = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (!term) return [...contacts];

    return contacts.filter(contact => {
        const name = (contact.name || '').toLowerCase();
        const email = (contact.email || '').toLowerCase();
        return name.includes(term) || email.includes(term);
    });
}

function getSortedContacts(list) {
    const sortValue = sortSelect ? sortSelect.value : 'name-asc';
    const [field, direction] = sortValue.split('-');

    const sorted = [...list].sort((a, b) => {
        const aVal = (a[field] || '').toString().toLowerCase();
        const bVal = (b[field] || '').toString().toLowerCase();
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
        return 0;
    });

    if (direction === 'desc') {
        sorted.reverse();
    }

    return sorted;
}

function applyFiltersAndRender() {
    const filtered = getFilteredContacts();
    const sorted = getSortedContacts(filtered);
    displayContacts(sorted);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showMessage(message, type = 'success') {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove('hidden');

    
    setTimeout(() => {
        messageDiv.classList.add('hidden');
    }, 5000);
}


window.editContact = editContact;
window.deleteContact = deleteContact;

