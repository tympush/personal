const colorButton = document.querySelector("#colorButton");

colorButton.addEventListener('click', () => {
    displayColorTab();
});

const colorTab = document.querySelector("#colorTab");

function displayColorTab(){
    
    colorTab.showModal();

    closeModal.addEventListener("click", () => {
        colorTab.close();
    });
}








// Function to apply the selected theme and update button styles
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme); // Set theme on <html>
    highlightSelectedButton(theme); // Highlight the correct button
}

// Function to handle theme selection, store it, and apply the theme
function selectTheme(theme) {
    localStorage.setItem('selectedTheme', theme); // Store selected theme
    applyTheme(theme); // Apply theme
}

// Function to highlight the selected button
function highlightSelectedButton(theme) {
    // Reset all buttons to default outline
    document.querySelectorAll('.themeButton').forEach(button => {
        button.style.borderColor = 'var(--outl-col)'; // Default outline color
    });

    // Highlight the selected button
    const selectedButton = document.getElementById(`${theme}ThemeBox`);
    if (selectedButton) {
        selectedButton.style.borderColor = 'var(--pos-col)'; // Highlight with --pos-col
    }
}

// Attach event listeners to the theme buttons
document.getElementById('lightThemeBox').addEventListener('click', function() {
    selectTheme('light');
});

document.getElementById('darkThemeBox').addEventListener('click', function() {
    selectTheme('dark');
});

document.getElementById('contrastThemeBox').addEventListener('click', function() {
    selectTheme('contrast');
});

// Apply the stored theme and highlight on page load
window.addEventListener('load', function() {
    const storedTheme = localStorage.getItem('selectedTheme');
    if (storedTheme) {
        applyTheme(storedTheme); // Apply stored theme
    }
});
