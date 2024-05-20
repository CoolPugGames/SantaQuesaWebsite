
document.addEventListener('DOMContentLoaded', function () {
    const containers = document.querySelectorAll('.directory-div');
    containers.forEach(container => {
    const grids = container.querySelectorAll('.directory-category');
    console.log('Adjusting Grid Column Width');

    grids.forEach(grid => {
        const items = grid.querySelectorAll('.employee-card');
        const gridItemWidth = grid.querySelector('.employee-card').offsetWidth;
        const gridContainerWidth = grid.offsetWidth;
        const numColumns = Math.floor(gridContainerWidth / gridItemWidth);

        // Calculate the padding based on the number of columns
        const padding = numColumns > 1 ? (numColumns - 1) * 20 : 0;

        // Set the CSS variable for padding
        gridContainer.style.setProperty('--grid-padding', `0 ${padding}px`);
        });
        console.log('Column padding: ',padding);

        // if (items.length <= 5) {
        //     grid.style.gridTemplateColumns = `repeat(${items.length}, minmax(200px, 1fr))`;
        // }
    })
})