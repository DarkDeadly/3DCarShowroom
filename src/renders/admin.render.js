import { createElements, createImage } from "../utils/uiBuilder.js"


/**
 * Creates an inline SVG element for the edit icon.
 * @returns {SVGElement}
 */
const createEditIcon = () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.9');

    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M12 20h9');

    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z');

    svg.append(path1, path2);
    return svg;
};

/**
 * Creates an inline SVG element for the delete icon.
 * @returns {SVGElement}
 */
const createDeleteIcon = () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.9');

    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M3 6h18');

    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2');

    const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path3.setAttribute('d', 'M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6');

    svg.append(path1, path2, path3);
    return svg;
};

/**
 * Creates the static car table row element.
 * @returns {HTMLTableRowElement} <tr data-cat="Coupe">
 */
export const createCarTableRow = (car) => {
    // <tr data-cat="Coupe">
    const tr = createElements('tr');
    tr.setAttribute('data-cat', 'Coupe');

    // 1. Thumbnail & Name Cell
    const tdThumb = createElements('td', ['thumb-cell']);

    const carThumb = createImage(car.image, car.model, ['car-thumb']);

    const carName = createElements('div', ['car-name']);
    const modelText = document.createTextNode(car.model);
    const modelSmall = createElements('small', [], '3D model available');
    carName.append(modelText, modelSmall);

    tdThumb.append(carThumb, carName);

    // 2. Year Cell
    const tdYear = createElements('td', [], car.year);
    tdYear.setAttribute('data-label', 'Year');

    // 4. Category Cell
    const tdCategory = createElements('td', [], car.category);
    tdCategory.setAttribute('data-label', 'Category');

    // 5. Price Cell
    const tdPrice = createElements('td');
    tdPrice.setAttribute('data-label', 'Price');
    const priceSpan = createElements('span', ['price-cell'], car.price + " DT");
    tdPrice.appendChild(priceSpan);

    // 6. Color Cell
    const tdColor = createElements('td');
    tdColor.setAttribute('data-label', 'Color');
    const colorCell = createElements('div', ['color-cell']);
    const swatch = createElements('span', ['swatch']);
    swatch.style.background = car.color;
    colorCell.appendChild(swatch);
    tdColor.appendChild(colorCell);

    // 7. Status Cell
    const tdStatus = createElements('td');
    tdStatus.setAttribute('data-label', 'Status');
    const badge = createElements('span', ['badge', car.availability ? "available" : "unavailable"], car.availability ? "Available" : "Unavailable");
    tdStatus.appendChild(badge);

    // 8. Actions Cell
    const tdActions = createElements('td', ['actions-cell']);
    const rowActions = createElements('div', ['row-actions']);

    // Edit Label Action
    const editLabel = createElements('label', ['icon-action', 'edit']);
    editLabel.dataset.id = car.id;
    editLabel.setAttribute('for', 'panel-edit-1');
    editLabel.setAttribute('title', 'Edit');
    editLabel.setAttribute('aria-label', 'Edit');
    editLabel.appendChild(createEditIcon());

    // Delete Label Action
    const delLabel = createElements('label', ['icon-action', 'del']);
    delLabel.dataset.id = car.id
    delLabel.setAttribute('for', 'panel-del-1');
    delLabel.setAttribute('title', 'Delete');
    delLabel.setAttribute('aria-label', 'Delete');
    delLabel.appendChild(createDeleteIcon());

    rowActions.append(editLabel, delLabel);
    tdActions.appendChild(rowActions);

    // Assemble full row
    tr.append(
        tdThumb,
        tdYear,
        tdCategory,
        tdPrice,
        tdColor,
        tdStatus,
        tdActions
    );

    return tr;
};


export function showEmptyState(tbody , table, emptyState) {
    tbody.innerHTML = "";
    table.style.display = "none";
    emptyState.style.display = "flex";
}

export const appendCars = (cars , container) => {
     cars.forEach(car => {
        container.appendChild(
            createCarTableRow(car)
        );
    });
}
export const renderCars = (cars, container) => {
    container.innerHTML = "";
    appendCars(cars , container)
}