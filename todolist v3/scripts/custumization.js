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
    highlightSelectedTheme(theme); // Highlight the correct theme button
}

// Function to handle theme selection, store it, and apply the theme
function selectTheme(theme) {
    localStorage.setItem('selectedTheme', theme); // Store selected theme
    applyTheme(theme); // Apply theme
}

// Assign event listeners to theme buttons dynamically
const themeButtons = {
    light: 'lightThemeBox',
    dark: 'darkThemeBox',
    contrast: 'contrastThemeBox',
};

Object.keys(themeButtons).forEach(theme => {
    document.getElementById(themeButtons[theme]).addEventListener('click', function() {
        selectTheme(theme);
    });
});

// Apply the stored theme on page load
window.addEventListener('load', function() {
    // Check if there is a stored theme, otherwise set it to 'dark' by default
    const storedTheme = localStorage.getItem('selectedTheme') || 'dark';
    applyTheme(storedTheme); // Apply stored or default theme

    // Check if there is a stored color, otherwise set it to 'purple' by default
    const storedColor = localStorage.getItem('selectedColor') || 'purple';
    applyColor(storedColor); // Apply stored or default color
});

// Function to highlight the selected theme button
function highlightSelectedTheme(selectedId) {
    // Reset all theme buttons to default outline by removing the highlight class
    document.querySelectorAll('.themeButton').forEach(button => {
        button.classList.remove('highlight');
    });

    // Highlight the selected theme button by adding the highlight class
    const selectedButton = document.getElementById(`${selectedId}ThemeBox`);
    if (selectedButton) {
        selectedButton.classList.add('highlight'); // Add highlight class to the selected theme button
    }
}










// Function to apply the selected main color
function applyColor(color) {
    document.documentElement.setAttribute('data-main-col', color); // Set main color on <html>
    highlightSelectedColor(color); // Highlight the correct color button
}

// Function to handle color selection, store it, and apply the color
function selectColor(color) {
    localStorage.setItem('selectedColor', color); // Store selected color
    applyColor(color); // Apply color
}

// Assign event listeners to color buttons dynamically
const colorButtons = {
    red: 'redBox',
    orange: 'orangeBox',
    yellow: 'yellowBox',
    green: 'greenBox',
    cyan: 'cyanBox',
    blue: 'blueBox',
    deepblue: 'deepblueBox',
    purple: 'purpleBox',
    pink: 'pinkBox',
    flamingo: 'flamingoBox',
};

Object.keys(colorButtons).forEach(color => {
    document.getElementById(colorButtons[color]).addEventListener('click', function() {
        selectColor(color);
    });
});

// Function to highlight the selected color button
function highlightSelectedColor(selectedId) {
    // Reset all color buttons to default outline by removing the highlight class
    document.querySelectorAll('.colorButton').forEach(button => {
        button.classList.remove('highlight');
    });

    // Highlight the selected color button by adding the highlight class
    const selectedButton = document.getElementById(`${selectedId}Box`);
    if (selectedButton) {
        selectedButton.classList.add('highlight'); // Add highlight class to the selected color button
    }
}
