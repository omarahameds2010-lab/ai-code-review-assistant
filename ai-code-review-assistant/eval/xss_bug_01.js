function renderUserInput(userInput) {
    // XSS vulnerability - directly rendering user input
    const div = document.createElement('div');
    div.innerHTML = userInput;  // Should use textContent
    return div;
}

function getApiKey() {
    // Hardcoded credential
    const API_KEY = "AIzaSyBdE7x1x2y3z4w5";
    return API_KEY;
}

function processData(data) {
    // Missing error handling
    const result = JSON.parse(data);  // Could throw error
    return result;
}
