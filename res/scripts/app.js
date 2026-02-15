/* app.js - legacy file kept for compatibility */
/* particles.js has been removed in the redesign */


// hover link cursor
document.addEventListener('DOMContentLoaded', () => {
    const cursorIcon = document.getElementById('custom-cursor-icon');
    const targets = document.querySelectorAll('.custom-cursor-target');

    // 1. Move the custom cursor to follow the mouse
    document.addEventListener('mousemove', (e) => {
        // We use transform in CSS, so we just set top/left here
        cursorIcon.style.left = e.clientX + 'px';
        cursorIcon.style.top = e.clientY + 'px';
    });

    // 2. Add hover listeners to the specific links
    targets.forEach(target => {
        target.addEventListener('mouseenter', () => {
            cursorIcon.classList.add('active');
        });

        target.addEventListener('mouseleave', () => {
            cursorIcon.classList.remove('active');
        });
    });
});