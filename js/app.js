import { IndustrialMusicApp } from './modules/IndustrialMusicApp.js';

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Industrial Music App...');
    try {
        const app = new IndustrialMusicApp();
        window.industrialApp = app; // For debugging
        
        const initialized = await app.initialize();
        if (initialized) {
            console.log('App successfully initialized');
            document.getElementById('status').textContent = 'Ready';
        } else {
            console.error('App initialization failed');
        }
    } catch (error) {
        console.error('Error starting app:', error);
        document.getElementById('status').textContent = 'Error: ' + error.message;
    }
});